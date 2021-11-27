const fs = require("fs");
const jimp = require("jimp");
const jsQR = require("jsqr");
const base45 = require('base45');
const zlib = require('zlib');
const cbor = require('cbor');

if (process.argv.length < 3 || !fs.existsSync(process.argv[2])) {
  console.log('No way!');
  process.exit();
}

var buffer = fs.readFileSync(process.argv[2]);

jimp.read(buffer, function (err, image) {
  if (err) {
    console.error(err);
    // TODO handle error
  }

  const code = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);

  if (code) {
    try {
      const clearCode = code.data.replace('HC1:', '');
      const decodedBase45Code = base45.decode(clearCode);
      const inflatedCode = zlib.inflateSync(decodedBase45Code);
      const codeDecodedFromCBOR = cbor.decodeFirstSync(inflatedCode);
      let cborFinalObjectMap = cbor.decodeFirstSync(codeDecodedFromCBOR.value[2]);
      console.log(cborFinalObjectMap.get(-260).get(1));
    }
    catch (e) {
      console.log(e);
    }
  }
});
