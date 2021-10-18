var TYPE_IHDR = 0x49484452;
var TYPE_IEND = 0x49454e44;
var TYPE_IDAT = 0x49444154;
var TYPE_PLTE = 0x504c5445;
var TYPE_tRNS = 0x74524e53;
var TYPE_gAMA = 0x67414d41;
// color-type combinations
var COLORTYPE_PALETTE_COLOR = 3;
var COLORTYPE_TO_BPP_MAP = {
    0: 1,
    2: 3,
    3: 1,
    4: 2,
    6: 4,
};
var _hasIHDR = false;
var _hasIDAT = false;
var _hasIEND = false;
var _palette = [];
var _colorType = 0;
var _i;
var _buffer;
var inflateDataList = [];
function _handleInflateData(inflatedData) {
    inflateDataList.push(inflatedData);
}
var _chunkHandlers = {};
_chunkHandlers[TYPE_IHDR] = _parseIHDR;
_chunkHandlers[TYPE_IEND] = _parseIEND;
_chunkHandlers[TYPE_IDAT] = _parseIDAT;
_chunkHandlers[TYPE_PLTE] = _parsePLTE;
_chunkHandlers[TYPE_tRNS] = _parseTRNS;
_chunkHandlers[TYPE_gAMA] = _parseGAMA;
export function pngValidator(buffer) {
    _hasIHDR = false;
    _hasIDAT = false;
    _hasIEND = false;
    _palette = [];
    _colorType = 0;
    _i = 0;
    _buffer = buffer;
    _parseSignature();
    while (_i < _buffer.byteLength) {
        // chunk content length
        var length_1 = _getUint32(_buffer, _i);
        _i += 4;
        if (length_1 > _buffer.byteLength - _i) {
            throw new Error('Invalid chunk length. Index: ' + _i);
        }
        var typeAndDataBuffer = _buffer.slice(_i, _i + 4 + length_1);
        var type = _getUint32(_buffer, _i);
        _i += 4;
        var name_1 = '';
        for (var i = 4; i > 0; i--) {
            name_1 += String.fromCharCode(_buffer[_i - i]);
        }
        // chunk flags
        var ancillary = Boolean(typeAndDataBuffer[0] & 0x20); // or critical
        //    priv = Boolean(typeAndDataBuffer[1] & 0x20), // or public
        //    safeToCopy = Boolean(typeAndDataBuffer[2] & 0x20); // or unsafe
        if (!_hasIHDR && type !== TYPE_IHDR) {
            throw new Error('Expected IHDR on beggining. Index: ' + _i);
        }
        var data = _readBuffer(length_1);
        var chunkHandler = _chunkHandlers[type];
        if (chunkHandler != null) {
            chunkHandler(data);
            var fileCrc = _getInt32(_buffer, _i);
            _i += 4;
            var calcCrc = crc32(typeAndDataBuffer);
            if (calcCrc !== fileCrc) {
                throw new Error('Crc error - ' + fileCrc + ' - ' + calcCrc + '. Index: ' + _i);
            }
            continue;
        }
        if (!ancillary) {
            throw new Error('Unsupported critical chunk type ' + name_1 + '. Index: ' + _i);
        }
        _i += 4;
    }
    if (!_hasIHDR) {
        throw new Error('Parsing ended without finding the IHDR chunk. Index: ' + _i);
    }
    if (!_hasIDAT) {
        throw new Error('Parsing ended without finding any IDAT chunk. Index: ' + _i);
    }
    if (!_hasIEND) {
        throw new Error('Parsing ended without finding the IEND chunk. Index: ' + _i);
    }
    if (buffer.byteLength > _i) {
        throw new Error('There are bytes left at the end of the file. Index: ' + _i);
    }
    return;
}
function _readBuffer(length) {
    var to = _i + length;
    if (to > _buffer.length) {
        throw new Error('Unexpectedly reached end of file. Index: ' + _i);
    }
    var buffer = _buffer.slice(_i, to);
    _i = to;
    return buffer;
}
function _parseSignature() {
    var signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    var data = _readBuffer(signature.length);
    for (var i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) {
            throw new Error('Invalid file signature. Index: ' + _i);
        }
    }
}
function _parseIHDR(data) {
    var depth = data[8];
    var colorType = data[9]; // bits: 1 paconstte, 2 color, 4 alpha
    var compr = data[10];
    var filter = data[11];
    var interlace = data[12];
    if (depth !== 8 &&
        depth !== 4 &&
        depth !== 2 &&
        depth !== 1 &&
        depth !== 16) {
        throw new Error('Unsupported bit depth ' + depth + '. Index: ' + _i);
    }
    if (!(colorType in COLORTYPE_TO_BPP_MAP)) {
        throw new Error('Unsupported color type. Index: ' + _i);
    }
    if (compr !== 0) {
        throw new Error('Unsupported compression method. Index: ' + _i);
    }
    if (filter !== 0) {
        throw new Error('Unsupported filter method. Index: ' + _i);
    }
    if (interlace !== 0 && interlace !== 1) {
        throw new Error('Unsupported interlace method. Index: ' + _i);
    }
    _colorType = colorType;
    _hasIHDR = true;
}
function _parsePLTE(data) {
    var entries = Math.floor(data.byteLength / 3);
    for (var i = 0; i < entries; i++) {
        _palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 0xff]);
    }
}
function _parseTRNS(data) {
    // palette
    if (_colorType === COLORTYPE_PALETTE_COLOR) {
        if (_palette.length === 0) {
            throw new Error('Transparency chunk must be after palette. Index: ' + _i);
            return;
        }
        if (data.byteLength > _palette.length) {
            throw new Error('More transparent colors than palette size. Index: ' + _i);
        }
        for (var i = 0; i < data.byteLength; i++) {
            _palette[i][3] = data[i];
        }
    }
}
function _parseGAMA() {
    //
}
function _parseIDAT(data) {
    if (_colorType === COLORTYPE_PALETTE_COLOR &&
        _palette.length === 0) {
        throw new Error('Expected palette not found. Index: ' + _i);
    }
    _handleInflateData(data);
    _hasIDAT = true;
}
function _parseIEND() {
    _hasIEND = true;
}
function _getInt32(buffer, offset) {
    var n = _getUint32(buffer, offset);
    return n & 0x80000000 ? n ^ -0x100000000 : n;
}
function _getUint32(buffer, offset) {
    var b0 = buffer[offset] << 24, b1 = buffer[offset + 1] << 16, b2 = buffer[offset + 2] << 8, b3 = buffer[offset + 3];
    return b0 | b1 | b2 | b3;
}
var crcTable = [];
(function () {
    for (var i = 0; i < 256; i++) {
        var currentCrc = i;
        for (var j = 0; j < 8; j++) {
            if (currentCrc & 1) {
                currentCrc = 0xedb88320 ^ (currentCrc >>> 1);
            }
            else {
                currentCrc = currentCrc >>> 1;
            }
        }
        crcTable[i] = currentCrc;
    }
})();
function crc32(buf) {
    var crc = -1;
    for (var i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return crc ^ -1;
}
//# sourceMappingURL=index.js.map