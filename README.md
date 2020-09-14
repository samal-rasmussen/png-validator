Png Validator
---

Checks Png files for corruption.

This code is cut out of the much more comprehensive https://github.com/lukeapage/pngjs, so you can have a minimal implementation that only does png file validation.

It checks that the chunk layout is correct, and it checks that the crc code for each chunk is valid.

Usage
---

This library exposes a single function `pngValidator` that takes a single parameter, which is a Uint8Array with the raw Png file data. It will throw an error if the files is _not_ valid.

```
try {
	pngValidator(buffer);
	// success
} catch (e) {
	// file is corrupt
}
```

Png Validator is build both as a cjs and es bundle, so you can use it in the backend and frontend.
