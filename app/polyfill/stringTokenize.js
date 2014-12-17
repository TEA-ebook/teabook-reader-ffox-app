if (!String.prototype.tokenize) {
    Object.defineProperty(String.prototype, 'tokenize', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (minTokenLength) {
            "use strict";
            minTokenLength = minTokenLength || 2;
            return this.split(/[ ']/).filter(function(token) { return token.length >= minTokenLength; });
        }
    });
}