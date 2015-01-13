/*global parseInt*/
if (![].includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {'use strict';
        if (this === undefined || this === null) {
            throw new TypeError('Impossible de convertir this en objet');
        }
        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k += 1;
        }
        return false;
    };
}