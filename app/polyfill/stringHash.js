/*jslint bitwise: true*/
function hashFnv32a(str, asString) {
    "use strict";
    var i, l, hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i += 1) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if (asString) {
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

String.prototype.hashCode = function () {
    "use strict";
    return hashFnv32a(this, true);
};