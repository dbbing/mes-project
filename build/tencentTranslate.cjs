// tencent.json 文件内容如下
// {
//     "secretId": "appId",
//     "secretKey": "key",
//     "UntranslatedText": "{name}",  要排除的文本
//     "projectId": 0, 项目id，数字类型
//     "delay": 1000   延迟，不得低于200，数字类型
// }
// --------------------------------------------------------
const path = require("path");
const fs = require("fs");
const lineLog = require("single-line-log").stdout;
const tencentConfig = require("../tencent.json"); //文件内容在顶部注释中
const tencentcloud = require("tencentcloud-sdk-nodejs-tmt");
const TmtClient = tencentcloud.tmt.v20180321.Client;
const args = process.argv.slice(2);
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
  "ko-kr": require("../src/locales/ko-kr.json"),
  "pt-pt": require("../src/locales/pt-pt.json"),
  "ru-ru": require("../src/locales/ru-ru.json"),
  "vi-vn": require("../src/locales/vi-vn.json"),
  "zh-tw": require("../src/locales/zh-tw.json"),
};
const tencentMap = {
  "zh-cn": "zh",
  "en-us": "en",
  "de-de": "de",
  "es-es": "es",
  "fr-fr": "fr",
  "id-id": "id",
  "it-it": "it",
  "ja-jp": "ja",
  "ko-kr": "ko",
  "pt-pt": "pt",
  "ru-ru": "ru",
  "vi-vn": "vi",
  "zh-tw": "zh-TW",
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
const clientConfig = {
  credential: {
    secretId: tencentConfig.secretId,
    secretKey: tencentConfig.secretKey,
  },
  region: "ap-shanghai",
  profile: {
    httpProfile: {
      endpoint: "tmt.tencentcloudapi.com",
    },
  },
};

const client = new TmtClient(clientConfig);

function tencentTranslate(text, from, to) {
  const params = {
    SourceText: text,
    Source: tencentMap[from],
    Target: tencentMap[to],
    ProjectId: tencentConfig.projectId || 0,
    UntranslatedText: tencentConfig.UntranslatedText || "",
  };
  return new Promise((resolve, reject) => {
    client.TextTranslate(params).then(
      (data) => {
        setTimeout(() => {
          resolve(data);
        }, tencentConfig.delay || 1000);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

async function translate(target, source) {
  let i = 1;
  console.log(`\n开始翻译，翻译语言：${target}，翻译源：${source}`);
  const targetLang = messages[target];
  const sourceLang = messages[source];
  const keys = Object.keys(sourceLang);
  const len = keys.length;
  let breakFlag = false;
  for await (const key of keys) {
    let text = "";
    if (targetLang[key] === sourceLang[key]) {
      await tencentTranslate(sourceLang[key], source, target)
        .then((res) => {
          if (res.TargetText) {
            messages[target][key] = res.TargetText;
            text = res.TargetText;
            writeFiles(target);
          } else {
            console.log(
              `\n出现错误，停止翻译，错误信息： ${res.RequestId} ${res.Error.Code}}`
            );
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

if (args.length == 0) {
  console.log("请输入语言参数,或使用 -h 查看帮助\n ");
  return;
} else if (args.length == 1) {
  if (args[0] === "zh-cn") {
    console.log("不能翻译成中文");
    return;
  } else if (args[0] === "-h") {
    const help = `第一个参数为目标语言，第二个参数为源语言，如果只有一个参数，则默认源语言为中文，例如： \n yarn translate:tx en-us zh-cn \n yarn translate:tx ja-jp \n yarn translate:tx en-us \n\n`;
    console.log(help);
    return;
  } else if (!messages[args[0]]) {
    console.log("参数错误");
    return;
  } else {
    mergeMessages(messages[args[0]], zh);
    translate([args[0]], "zh-cn");
    writeFiles(args[0]);
    return;
  }
} else if (args.length == 2) {
  mergeMessages(messages[args[0]], messages[args[1]]);
  translate([args[0]], [args[1]]);
  writeFiles(args[0]);
  return;
} else {
  console.log("参数错误");
  return;
}
