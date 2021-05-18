# web-shell

1. 进入server和client文件夹装包

```shell
cd server
yarn

cd client
yarn
```

2. 打开`client/src/components/terminal/terminal.vue`，填入你要远程的主机ip账号密码。到时候会通过websocket传给server，你也可以直接在server端写死，具体看业务需求

3. 启动

```shell
cd server
node app.js

cd client
yarn serve
```

**注意：本项目前端使用的xterm版本相对于现在有点老，有能力可以升级到最新版本，但是会报错，应该是官方修改了引入方法。如果想升级到最新，建议看官方文档重构代码。我现在已经固定版本，不想升级就不要乱动代码。**