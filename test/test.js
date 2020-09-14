const fs = require('fs');
const pngValidator = require('../dist/index.cjs');
const tape = require('tape');

const pngSuiteDir = __dirname + '/png-suite/';
const filesDir = __dirname + '/files/';

fs.promises.readdir(pngSuiteDir)
.then((files) => {	
	files = files.filter((file) => {
		return /\.png$/i.exec(file);
	});
	
	files.forEach((file) => {
		let expectError = false;
		if (/^x/.exec(file)) {
			expectError = true;
		}
		testFile(pngSuiteDir, file, expectError);
	});
})
.then(() => {
	return fs.promises.readdir(filesDir)
})
.then((files) => {	
	files.forEach((file) => {
		let expectError = false;
		if (/^x/.exec(file)) {
			expectError = true;
		}
		testFile(filesDir, file, expectError);
	});
});

function testFile(dir, file, expectError) {
	tape('testing file ' + file, (t) => {
		t.plan(1);
		const path = dir + file;
		const data = fs.readFileSync(path);
		try {
			pngValidator.pngValidator(data);
			if (expectError) {
				t.fail('File is valid, but it is not expected to be');
			} else {
				t.pass('File is valid as expected');
			}
		} catch (error) {
			if (expectError) {
				t.pass(
					'File is invalid as expected. Error: \n\n' +
					error.message
				);
			} else {
				t.fail(
					'Unexpected error validating file:' + file + '\n\n' +
					error.message +	'\n' +
					error.stack,
				);
				process.exit(1);
			}
		}
	});
}
