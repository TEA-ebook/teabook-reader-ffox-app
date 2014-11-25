/*global onmessage: true, self: true, JSZip: true, XmlDocument: true*/
"use strict";
var zip;

function getFile (path, format) {
    var zipFile = zip.file(path);
    if (zipFile) {
        if (format === "bytes") {
            return zipFile.asBytes();
        }
        if (format === "blob") {
            return zipFile.asArrayBuffer();
        }
        return zipFile.asText();
    }
    return false;
}

function getBasePath (contentFilePath) {
    var result = contentFilePath.match(/^(.*)\/.*\.opf$/);
    if (result) {
        return result[1] + '/';
    }
    return '';
}

function getOpfFilePath(container) {
    var opfFilePath, document;

    document = new XmlDocument(container);
    opfFilePath = document.descendantWithPath("rootfiles.rootfile").attr["full-path"];

    return opfFilePath;
}

function getMetadata(opf) {
    var metadata, metadataNode, document, descriptionNode;

    metadata = {};
    document = new XmlDocument(opf);
    metadataNode = document.childNamed("metadata");

    metadata.title = metadataNode.childNamed("dc:title").val;
    metadata.publisher = metadataNode.childNamed("dc:publisher").val;
    descriptionNode = metadataNode.childNamed("dc:description");
    metadata.description = descriptionNode ? descriptionNode.val: "";
    metadata.identifier = metadataNode.childNamed("dc:identifier").val;
    metadata.language = metadataNode.childNamed("dc:language").val;
    metadata.authors = [];
    metadataNode.childrenNamed("dc:creator").forEach(function (authorNode) {
        var author = authorNode.val;
        if (author && author.length > 0) {
            metadata.authors.push(author);
        }
    });

    return metadata;
}

function getCoverFilePath(opf) {
    var metaCoverNode, coverFilePath, document;

    document = new XmlDocument(opf);

    // method 1 : search for meta cover
    metaCoverNode = document.childNamed("metadata").childWithAttribute("name", "cover");
    if (metaCoverNode) {
        coverFilePath = document.childNamed("manifest").childWithAttribute("id", metaCoverNode.attr.content).attr.href;
    }

    return coverFilePath;
}

onmessage = function (event) {
    var containerFile, opfFilePath, opfFile, coverFilePath, metadata;

    zip = new JSZip(event.data);

    // first, get the container file
    containerFile = getFile("META-INF/container.xml");

    // then get the .opf file
    opfFilePath = getOpfFilePath(containerFile);
    opfFile = getFile(opfFilePath);

    // extract metadata
    metadata = getMetadata(opfFile);

    // extract the cover
    coverFilePath = getCoverFilePath(opfFile);
    if (coverFilePath) {
        metadata.cover = getFile(getBasePath(opfFilePath) + coverFilePath, "blob");
    }

    // send book metadata to the caller
    self.postMessage(metadata);

    self.close();
};