const fs = require('fs');
const path = require('path');
const util = require('util');
const sharp = require('sharp');

const [readdir, readFile] = [fs.readdir, fs.readFile].map(fn => util.promisify(fn));

const INPUT_DIR = path.join(__dirname, './input');
const OUTPUT_DIR = path.join(__dirname, './output');
const OVERLAY_PATH = path.join(__dirname, './overlay.svg');
const IGNORE_FILES = ['.DS_Store'];

const sharpImg = (filename, fileBuffer) => {
  const { name } = path.parse(filename);
  return new Promise((resolve, reject) => {
    sharp(fileBuffer)
      .resize(500, 500)
      .extract({
        left: 0,
        top: 0,
        width: 400,
        height: 400
      })
      .overlayWith(OVERLAY_PATH, {
        cutout: true
      })
      .toFile(path.join(OUTPUT_DIR, `${name}.png`), err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(console.log(`sharp ${filename} successfully`));
      });
  });
};

readdir(INPUT_DIR, 'utf8')
  .then(files => {
    const filesList = files.filter(v => !IGNORE_FILES.includes(v));
    if (filesList.length) {
      filesList.forEach(filename => {
        readFile(path.join(INPUT_DIR, filename))
          .then(fileBuffer => {
            return sharpImg(filename, fileBuffer);
          })
          .catch(err => {
            console.error(err);
            console.log(`failed at sharping ${filename}`);
          });
      });
    } else {
      console.log('no input files');
      process.exit();
    }
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });
