const scpClient = require("scp2");
var Client = require("ssh2").Client;
const path = require("path");
const server = {
  host: "192.168.0.165",
  port: 22,
  username: "root",
  password: "Supreme123",
  path: "/flow-line/front/html",
};
const source_path = path.resolve() + "/dist";
const conn = new Client();
const startTime = new Date().getTime();
console.log("连接服务器，开始发布");
conn
  .on("ready", function () {
    conn.exec("cd /flow-line/front/html", function (err, stream) {
      if (err) throw err;
      stream
        .on("close", function () {
          // 在执行shell命令后，把开始上传部署项目代码放到这里面
          scpClient.scp(
            source_path, {
              host: server.host,
              port: server.port,
              username: server.username,
              password: server.password,
              path: server.path, // 项目放置静态地址（服务器中地址）
            },
            function (err) {
              if (err) {
                console.log("发布失败");
              } else {
                console.log("发布成功");
              }
              const endTime = new Date().getTime();
              const costTime = ((endTime - startTime) / 1000).toFixed(2);
              console.log("耗时：" + costTime + "秒");
            }
          );
          conn.end();
        })
        .on("data", function (data) {
          console.log("STDOUT: " + data);
        })
        .stderr.on("data", function (data) {
          console.log("STDERR: " + data);
        });
    });
  })
  .connect({
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password,
  });