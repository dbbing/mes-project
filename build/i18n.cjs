// baidu.json文件内容
// {
//   "appid": "",
//   "key": "",
//   "delay": 200  延迟，高级版不得低于100，数字类型，企业版不得低于10
// }
// -------------------------------------

const path = require("path");
const fs = require("fs");
const lineLog = require("single-line-log").stdout;
const baiduConfig = require("../baidu.json");  //文件内容在顶部注释中
// 读取/locales/zh-cn.json文件，将其转换为json对象
const zh = require("../src/locales/zh-cn.json");
const messages = {
  "zh-cn": zh,
  "en-us": require("../src/locales/en-us.json"),
  "de-de": require("../src/locales/de-de.json"),
  "es-es": require("../src/locales/es-es.json"),
  "fr-fr": require("../src/locales/fr-fr.json"),
  "id-id": require("../src/locales/id-id.json"),
  "it-it": require("../src/locales/it-it.json"),
  "ja-jp": require("../src/locales/ja-jp.json"),
  "km-kh": require("../src/locales/km-kh.json"),
  "ko-kr": require("../src/locales/ko-kr.json"),
  "pt-pt": require("../src/locales/pt-pt.json"),
  "ru-ru": require("../src/locales/ru-ru.json"),
  "vi-vn": require("../src/locales/vi-vn.json"),
  "zh-tw": require("../src/locales/zh-tw.json"),
};

const baiduMap = {
  "zh-cn": "zh",
  "en-us": "en",
  "de-de": "de",
  "es-es": "spa",
  "fr-fr": "fra",
  "id-id": "id",
  "it-it": "it",
  "ja-jp": "jp",
  "km-kh": "hkm",
  "ko-kr": "kor",
  "pt-pt": "pt",
  "ru-ru": "ru",
  "vi-vn": "vie",
  "zh-tw": "cht",
};

// 对object进行按key排序
function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
}

function mergeMessages(target, source) {
  for (const key in source) {
    if (!target[key]) {
      target[key] = source[key];
    }
  }
}

function baiduTranslate(text, from, to) {
  // 加入防抖，防止翻译过快
  const http = require("http");
  const querystring = require("querystring");
  const appid = baiduConfig.appid;
  const key = baiduConfig.key;
  const salt = new Date().getTime();
  const sign = require("crypto")
    .createHash("md5")
    .update(appid + text + salt + key)
    .digest("hex");
  const data = querystring.stringify({
    q: text,
    from: baiduMap[from],
    to: baiduMap[to],
    appid: appid,
    salt: salt,
    sign: sign,
  });
  const options = {
    hostname: "https://fanyi-api.baidu.com/api/trans/vip/translate?",
  };
  // return Promise.resolve(data)
  return new Promise((resolve, reject) => {
    fetch(options.hostname + data)
      .then((res) => {
        if (res.status === 200) {
          setTimeout(() => {
            resolve(res.json());
          }, baiduConfig.delay || 1000);
        } else {
          reject(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function translate(target, source) {
  // 遍历source，调用baidu，翻译后的值赋值给target
  let i = 0;
  console.log(`\n开始翻译，翻译语言：${target}，翻译源：${source}`);
  const targetLang = messages[target];
  const sourceLang = messages[source];
  const keys = Object.keys(sourceLang);
  const len = keys.length;
  let breakFlag = false;
  for await (const key of keys) {
    let text = "";
    if (targetLang[key] === sourceLang[key]) {
      await baiduTranslate(sourceLang[key], source, target)
        .then((res) => {
          if (!res.error_code) {
            messages[target][key] = res.trans_result[0].dst;
            text = res.trans_result[0].dst;
            writeFiles(target);
          } else {
            console.log(`\n出现错误，停止翻译，错误信息：${res.error_msg}`);
            breakFlag = true;
          }
        })
        .catch((err) => {
          console.log(`\n出现错误，停止翻译，错误信息：${err}`);
          breakFlag = true;
        });
    }
    if (breakFlag) {
      break;
    }
    if (i === len) {
      lineLog(
        `\n翻译完成，翻译语言：${target}，翻译源：${source} \n  进度============= ${i++}/${len}`
      );
    } else {
      lineLog(
        `正在翻译   ${
          sourceLang[key]
        } ==> ${text}    \n进度============= ${i++}/${len} \n`
      );
    }
  }
}

// 结果写入对应的文件
const writeFiles = (key) => {
  if (key === "zh-cn") return;
  else if (key) {
    fs.writeFileSync(
      path.resolve(__dirname, `../src/locales/${key}.json`),
      JSON.stringify(sortObject(messages[key]), null, 2)
    );
    return;
  } else {
    for (const key in messages) {
      fs.writeFileSync(
        path.resolve(__dirname, `../src/locales/${key}.json`),
        JSON.stringify(sortObject(messages[key]), null, 2)
      );
    }
  }
};

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("请输入语言参数");
  return;
} else if (args.length == 1) {
  mergeMessages(messages[args[0]], zh);
  translate([args[0]], "zh-cn");
  writeFiles(args[0]);
  return;
} else if (args.length == 2) {
  mergeMessages(messages[args[0]], messages[args[1]]);
  translate([args[0]], [args[1]]);
  writeFiles(args[0]);
  return;
} else {
  console.log("参数错误");
  return;
}

// // 遍历所有语言，将缺失的翻译项补充进去
// for (const key in messages) {
//   if (key !== "zh-cn") {
//     mergeMessages(messages[key], zh);
//     // console.log(`merge ${key} success`);
//   }
// }
