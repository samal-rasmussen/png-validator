Png Validator
---

Checks Png files for corruption.

This code is cut out of the much more comprehensive https://github.com/lukeapage/pngjs, so you can have a minimal implementation that only does png file validation.

It checks that the chunk layout is correct, and it checks that the crc code for each chunk is valid.

Only 2.5 kb minified and uncompressed.

Available as an npm package: https://www.npmjs.com/package/png-validator

Usage
---

Png Validator is built both as a cjs and es bundle, so you can use it in the backend and frontend.

There is only a single function exposed called `pngValidator` that takes a single parameter, which is a Uint8Array with the raw Png file data. It will throw an error if the file is _not_ valid.

```
// node
const pngValidator = require('png-validator');
// browser / bundler
import { pngValidator } from 'png-validator';

try {
	pngValidator(buffer);
	// success
} catch (e) {
	// file is invalid or corrupt
	console.error(e);
}
```
