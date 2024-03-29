## Png Validator

Checks Png files for corruption.

This code is cut out of the much more comprehensive https://github.com/lukeapage/pngjs, so you can have a minimal implementation that only does png file validation.

It checks that the chunk layout is correct, and it checks that the crc code for each chunk is valid.

Zero dependencies and only 2.6 kb after minification.

Available as an npm package: https://www.npmjs.com/package/png-validator

## Usage

There is only a single function exposed called `pngValidator` that takes a single parameter, which is an Uint8Array with the raw Png file data. It will throw an error if the file is _not_ valid.

```js
import { pngValidator } from "png-validator";

try {
  pngValidator(buffer);
  // success
} catch (e) {
  // file is invalid or corrupt
  console.error(e);
}
```

Here's a complete example of how to use it with a file input:

```html
<!DOCTYPE html>
<html>
  <head>
    <script module type="module">
      import { pngValidator } from "https://unpkg.com/png-validator@2.0.0/index.js";

      const input = document.querySelector("#file-input");
      input.addEventListener("change", readPng);

      function readPng() {
        const file = input.files?.[0];
        if (!file) {
          console.log("no file");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
          const file = e.target?.result;
          if (!file) {
            console.log("no file in onload");
            return;
          }
          if (typeof file === "string") {
            console.log("file is string");
            return;
          }
          const png = new Uint8Array(file);
          try {
            pngValidator(png);
            console.log("file is valid");
          } catch (e) {
            console.log("file is invalid", e);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    </script>
  </head>
  <body>
    <input id="file-input" type="file" accept=".png" />
  </body>
</html>
```

From version 2.0 on there is only an esm version of Png Validator. Use v. 1.1 if you need commonjs.
