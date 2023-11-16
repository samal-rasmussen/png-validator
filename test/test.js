import fs from "node:fs";
import { pngValidator } from "../index.js";
import assert from "node:assert";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

testDir(__dirname + "/png-suite/");
testDir(__dirname + "/files/");

/**
 *
 * @param {string} dir
 */
function testDir(dir) {
  let files = fs.readdirSync(dir);
  files = files.filter((file) => {
    return /\.png$/i.exec(file);
  });
  files.forEach((file) => {
    let expectError = false;
    if (/^x/.exec(file)) {
      expectError = true;
    }
    testFile(dir, file, expectError);
  });
}

/**
 * @param {string} dir
 * @param {string} file
 * @param {boolean} expectError
 */
function testFile(dir, file, expectError) {
  test("testing file " + file, (t) => {
    const path = dir + file;
    const data = fs.readFileSync(path);
    try {
      pngValidator(data);
      assert.strictEqual(
        expectError,
        false,
        "File is valid, but it is not expected to be"
      );
      // @ts-ignore
    } catch (/** @type {Error}*/ error) {
      if (expectError) {
        assert.strictEqual(
          expectError,
          true,
          `File is invalid as expected. Error: \n\n${error.message}`
        );
      } else {
        throw new Error(
          `Unexpected error validating file: ${file}\n\n${error.message}\n${error.stack}`
        );
      }
    }
  });
}
