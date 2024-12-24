/*
 * @Date: 2023-12-12 14:25:45
 * @LastEditors: 曾韩样
 * @LastEditTime: 2023-12-12 14:43:34
 */
// 将打包后的dist文件夹打包为zip文件
const fs = require("fs");
const archiver = require("archiver");
const { resolve } = require("path");
const { name, version } = require("../package.json");

const output = fs.createWriteStream(
  resolve(__dirname, `../${name}-${version}.zip`)
);
const archive = archiver("zip", {
  zlib: { level: 9 },
});

output.on("close", () => {
  const size = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`打包文件大小为 ${size} MB`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(resolve(__dirname, "../dist"), false);
archive.finalize();
