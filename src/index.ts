/* eslint-disable sort-keys */

const constants = {
	TYPE_IHDR: 0x49484452,
	TYPE_IEND: 0x49454e44,
	TYPE_IDAT: 0x49444154,
	TYPE_PLTE: 0x504c5445,
	TYPE_tRNS: 0x74524e53,
	TYPE_gAMA: 0x67414d41,

	// color-type bits
	COLORTYPE_PALETTE: 1,
	COLORTYPE_COLOR: 2,
	COLORTYPE_ALPHA: 4, // e.g. grayscale and alpha

	// color-type combinations
	COLORTYPE_PALETTE_COLOR: 3,

	COLORTYPE_TO_BPP_MAP: {
		0: 1,
		2: 3,
		3: 1,
		4: 2,
		6: 4,
	},
};

let _hasIHDR = false;
let _hasIEND = false;
let _palette: number[][] = [];
let _colorType = 0;
let _i: number;
let _buffer: Uint8Array;

const inflateDataList = [];
function _handleInflateData(inflatedData: unknown) {
	inflateDataList.push(inflatedData);
}

const _chunkHandlers: Record<string, (...args: any[]) => void> = {};
_chunkHandlers[constants.TYPE_IHDR] = _parseIHDR;
_chunkHandlers[constants.TYPE_IEND] = _parseIEND;
_chunkHandlers[constants.TYPE_IDAT] = _parseIDAT;
_chunkHandlers[constants.TYPE_PLTE] = _parsePLTE;
_chunkHandlers[constants.TYPE_tRNS] = _parseTRNS;
_chunkHandlers[constants.TYPE_gAMA] = _parseGAMA;

export function pngValidator(
	buffer: Uint8Array,
): void {
	_hasIHDR = false;
	_hasIEND = false;
	_palette = [];
	_colorType = 0;
	_i = 0;
	_buffer = buffer;

	_parseSignature();

	while(_i < _buffer.byteLength) {
		// chunk content length
		const length = _getUint32(_buffer, _i);
		_i += 4;

		if (length > _buffer.byteLength - _i) {
			throw new Error('Invalid chunk length. Index: ' + _i);
		}

		const typeAndDataBuffer = _buffer.slice(_i, _i + 4 + length);

		const type = _getUint32(_buffer, _i);
		_i += 4;
		let name = '';
		for (let i = 4 ; i > 0 ; i--) {
			name += String.fromCharCode(_buffer[_i - i]);
		}

		//console.log('chunk ', name, length);

		// chunk flags
		const ancillary = Boolean(typeAndDataBuffer[0] & 0x20); // or critical
		//    priv = Boolean(typeAndDataBuffer[1] & 0x20), // or public
		//    safeToCopy = Boolean(typeAndDataBuffer[2] & 0x20); // or unsafe

		if (!_hasIHDR && type !== constants.TYPE_IHDR) {
			throw new Error('Expected IHDR on beggining. Index: ' + _i);
		}

		const data = _readBuffer(length);

		const chunkHandler = _chunkHandlers[type];
		if (chunkHandler != null) {
			chunkHandler(data);

			const fileCrc = _getInt32(_buffer, _i);
			_i += 4;
			const calcCrc = crc32(typeAndDataBuffer);
		
			if (calcCrc !== fileCrc) {
				throw new Error('Crc error - ' + fileCrc + ' - ' + calcCrc + '. Index: ' + _i);
			}

			continue;
		}

		if (!ancillary) {
			throw new Error('Unsupported critical chunk type ' + name + '. Index: ' + _i);
		}

		_i += 4;
	}

	if (!_hasIEND) {
		throw new Error('Parsing ended without finding the IEND chunk. Index: ' + _i);
	}

	if (buffer.byteLength > _i) {
		throw new Error('There are bytes left at the end of the file. Index: ' + _i);
	}

	return;
}

function _readBuffer(length: number): Uint8Array {
	const to = _i + length;
	if (to > _buffer.length){
		throw new Error('Unexpectedly reached end of file. Index: ' + _i);
	}
	const buffer = _buffer.slice(_i, to);
	_i = to;
	return buffer;
}

function _parseSignature() {
	const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	const data = _readBuffer(signature.length);

	for (let i = 0; i < signature.length; i++) {
		if (data[i] !== signature[i]) {
			throw new Error('Invalid file signature. Index: ' + _i);
		}
	}
}

function _parseIHDR(data: Uint8Array) {
	const depth = data[8];
	const colorType = data[9]; // bits: 1 paconstte, 2 color, 4 alpha
	const compr = data[10];
	const filter = data[11];
	const interlace = data[12];

	// console.log('    width', width, 'height', height,
	//     'depth', depth, 'colorType', colorType,
	//     'compr', compr, 'filter', filter, 'interlace', interlace
	// );

	if (
		depth !== 8 &&
		depth !== 4 &&
		depth !== 2 &&
		depth !== 1 &&
		depth !== 16
	) {
		throw new Error('Unsupported bit depth ' + depth + '. Index: ' + _i);
	}
	if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
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

function _parsePLTE(data: Uint8Array): void {

	const entries = Math.floor(data.byteLength / 3);

	for (let i = 0; i < entries; i++) {
		_palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 0xff]);
	}
}

function _parseTRNS(data: Uint8Array): void {

	// palette
	if (_colorType === constants.COLORTYPE_PALETTE_COLOR) {
		if (_palette.length === 0) {
			throw new Error('Transparency chunk must be after palette. Index: ' + _i);
			return;
		}
		if (data.byteLength > _palette.length) {
			throw new Error('More transparent colors than palette size. Index: ' + _i);
		}
		for (let i = 0; i < data.byteLength; i++) {
			_palette[i][3] = data[i];
		}
	}
}

function _parseGAMA(data: Uint8Array): void {
	//
}

function _parseIDAT(data: Uint8Array): void {

	if (
		_colorType === constants.COLORTYPE_PALETTE_COLOR &&
		_palette.length === 0
	) {
		throw new Error('Expected palette not found. Index: ' + _i);
	}

	_handleInflateData(data);
}

function _parseIEND(data: Uint8Array): void {
	_hasIEND = true;
}

function _getInt32(buffer: Uint8Array, offset: number){
	const n = _getUint32(buffer, offset);
	return n & 0x80000000 ? n ^ -0x100000000 : n;
}

function _getUint32(buffer: Uint8Array, offset: number): number {
	const b0 = buffer[offset] << 24,
		b1 = buffer[offset + 1] << 16,
		b2 = buffer[offset + 2] << 8,
		b3 = buffer[offset + 3];

	return b0 | b1 | b2 | b3;
}

const crcTable: number[] = [];

(function () {
	for (let i = 0; i < 256; i++) {
		let currentCrc = i;
		for (let j = 0; j < 8; j++) {
			if (currentCrc & 1) {
				currentCrc = 0xedb88320 ^ (currentCrc >>> 1);
			} else {
				currentCrc = currentCrc >>> 1;
			}
		}
		crcTable[i] = currentCrc;
	}
})();

function crc32(buf: Uint8Array): number {
	let crc = -1;
	for (let i = 0; i < buf.length; i++) {
		crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	}
	return crc ^ -1;
}
