const fs = require('fs');
const fg = require('fast-glob');
const path = require('path');

const ROOT = path.join(__dirname, './../public');

const bgImages = fg.globSync(ROOT+"/bg/bg-*.jpg").map((p) => p.split(ROOT)[1]);
const vrmList = fg.globSync(ROOT+"/vrm/*.vrm").map((p) => p.split(ROOT)[1]);

let str = "";
str += `export const bgImages = ${JSON.stringify(bgImages)};`;
str += `export const vrmList = ${JSON.stringify(vrmList)};`;

fs.writeFileSync(path.join(__dirname, './../src/paths.ts'), str);
