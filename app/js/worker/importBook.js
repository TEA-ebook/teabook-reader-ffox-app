/*global onmessage, self, JSZip, XmlDocument*/
"use strict";
var zip;

function getFile(path, format) {
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

function getBasePath(contentFilePath) {
    var result = contentFilePath.match(/^(\w*)\/\w*\.opf$/);
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
    var metadata, metadataNode, document, descriptionNode, publisherNode;

    metadata = {};
    document = new XmlDocument(opf);
    metadataNode = document.childNamed("metadata");

    metadata.title = metadataNode.childNamed("dc:title").val.trim();

    publisherNode = metadataNode.childNamed("dc:publisher");
    metadata.publisher = publisherNode ? publisherNode.val : "";

    descriptionNode = metadataNode.childNamed("dc:description");
    metadata.description = descriptionNode ? descriptionNode.val : "";

    metadata.identifier = metadataNode.childNamed("dc:identifier").val;

    metadata.language = metadataNode.childNamed("dc:language").val;

    metadata.authors = [];
    metadataNode.childrenNamed("dc:creator").forEach(function (authorNode) {
        var author = authorNode.val;
        if (author && author.length > 0) {
            metadata.authors.push(author.trim());
        }
    });

    return metadata;
}

function getImagePath(element) {
    var children, path = null;

    if (element.name === 'img') {
        return element.attr.src;
    }

    if (element.name === 'image') {
        return element.attr["xlink:href"];
    }

    children = element.children;
    children.forEach(function (child) {
        path = getImagePath(child);
    });

    return path;
}

function getCoverFilePath(opf, basePath) {
    var document, guide, manifestItems, spineItems, i = 0,
        coverItem, file, coverPageDocument, coverPath = null;

    document = new XmlDocument(opf);

    // method 1 : search for meta cover
    coverItem = document.childNamed("metadata").childWithAttribute("name", "cover");
    if (coverItem) {
        return document.childNamed("manifest").childWithAttribute("id", coverItem.attr.content).attr.href;
    }

    // method 2 : search for mainfest item with property cover-image
    manifestItems = document.childNamed("manifest").children;
    if (manifestItems.length > 0) {
        manifestItems.forEach(function (item) {
            if (item.attr.properties && (item.attr.properties.indexOf("cover-image") !== -1)) {
                coverPath = item.attr.href;
            }
        });
    }

    // method 3 : search for a reference in the guide
    if (!coverPath) {
        guide = document.childNamed("guide");
        if (guide) {
            coverItem = guide.childWithAttribute("type", "cover");
            if (coverItem) {
                file = getFile(coverItem.attr.href);
                coverPageDocument = new XmlDocument(file);
                coverPath = getImagePath(coverPageDocument.childNamed("body"));
            }
        }
    }

    // method 4 : browse 3 first items of the spine
    if (!coverPath) {
        spineItems = document.childNamed("spine").children;
        if (spineItems && spineItems.length > 0) {
            for (i; i < Math.min(3, spineItems.length); i += 1) {
                coverItem = document.childNamed("manifest").childWithAttribute("id", spineItems[i].attr.idref);
                if (coverItem && coverItem.attr.href) {
                    file = getFile(basePath + coverItem.attr.href);
                    coverPageDocument = new XmlDocument(file);
                    coverPath = getImagePath(coverPageDocument.childNamed("body"));
                    if (coverPath) {
                        break;
                    }
                }
            }
        }
    }

    return coverPath;
}

self.onmessage = function (event) {
    var containerFile, opfFilePath, basePath, opfFile, coverFilePath, metadata;

    zip = new JSZip(event.data);

    // first, get the container file
    containerFile = getFile("META-INF/container.xml");

    // then get the .opf file
    opfFilePath = getOpfFilePath(containerFile);
    opfFile = getFile(opfFilePath);
    basePath = getBasePath(opfFilePath);

    // extract metadata
    metadata = getMetadata(opfFile);

    // extract the cover
    coverFilePath = getCoverFilePath(opfFile, basePath);
    if (coverFilePath) {
        metadata.cover = getFile(basePath + coverFilePath, "blob");
    }

    // send book metadata to the caller
    self.postMessage(metadata);

    self.close();
};