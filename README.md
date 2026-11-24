# 投稿进度台账 · Submission Tracker

一个浏览器里的投稿工作台。集中保存期刊官网、作者后台和稿件专属链接，手动记录稿件编号、审稿状态及更新时间。

## 本地使用

1. 从 GitHub Releases 下载 `submission-tracker-v1.0.0.zip` 并解压。
2. 用 Chrome、Edge 或其他现代浏览器打开解压后的 `index.html`。如需放在桌面，可以给 `index.html` 创建快捷方式，保留解压目录中的配套文件。
3. 首次打开时有六个示例投稿入口和一份空白稿件台账。点击「新增入口」保存其他期刊的后台，或用卡片上的「编辑」修改现有入口。
4. 点击「新增稿件」，可将期刊后台中看到的稿号、状态、日期和稳定的稿件地址记入台账。通过「打开稿件」或「作者后台」查询最新状态。

台账数据保存在当前浏览器。文件移动、换浏览器、更换部署地址前，可先「导出备份」。新位置打开后再导入。旧桌面版导出的 JSON 也可以导入。导出的文件可能含个人稿件信息，请保存在本地。

## 发布到 GitHub Pages

1. 在 GitHub 创建一个空仓库，例如 `submission-tracker`。把本项目目录**里面**的文件放到仓库根目录，包含隐藏的 `.github`。
2. 在仓库的 **Settings → Pages** 中，把发布源选为 **GitHub Actions**。
3. 将代码提交到 `main`。也可以在 **Actions → Deploy Submission Tracker** 中手动运行部署。部署完成后，可通过 Pages 显示的地址打开。

默认发布的站点提供访客台账。GitHub Pages 工作流只部署页面和三个配套脚本，无需安装应用运行依赖或自建服务器。仓库中仅应提交软件文件，个人台账和导出的备份留在本机。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 启用 Google 账号登录

Google 登录是可选功能。它通过 **Firebase Authentication** 拉起 Google 官方授权弹窗，以同一浏览器内的账号身份区分各自的台账。Chrome 浏览器安装或已经登录 Google 账号都不代表台账已登录。程序内的登录也与各期刊后台的登录独立。

1. 在 [Firebase 控制台](https://console.firebase.google.com/) 新建或选择一个项目，在 **Project settings → Your apps** 注册 Web 应用。
2. 到 **Authentication → Sign-in method** 启用 **Google**，按控制台提示填写项目支持邮箱。
3. 在 **Authentication → Settings → Authorized domains** 加入你的部署主机名，例如 `YOUR_GITHUB_USERNAME.github.io`。这里只填主机名。如果使用自定义域名，加入自定义域名。
4. 将 Firebase 提供的 **Web SDK 配置对象**复制到 `firebase-config.js`，替换文件中的 `null`。通常包括 `apiKey`、`authDomain`、`projectId` 和 `appId`。保留 Firebase 控制台提供的 `authDomain`。这个文件只需 Web 配置，无需放服务账号、私钥或 OAuth 客户端密钥。
5. 重新部署。打开 HTTPS 站点，点击「Google 账号登录」→「继续使用 Google」，用测试账号验证登录和退出。

本地直接打开 `index.html` 时可用访客台账。账号切换只影响当前浏览器内看到的本地记录，程序没有云端稿件数据库。若要把访客记录转入某账号，先在访客模式导出，再登录该账号并导入。换设备同样通过备份转移。

参考：[Firebase 的 Google 登录指南](https://firebase.google.com/docs/auth/web/google-signin)、[Firebase Web 应用配置](https://firebase.google.com/docs/web/setup)。

## 创建 GitHub Release

GitHub Pages 提供在线访问，GitHub Releases 提供按版本下载。

1. 将本项目内容推送到 `main` 后，在仓库中选择 **Releases → Draft a new release**。
2. 从 `main` 创建标签 `v1.0.0`，标题用 `v1.0.0 · 首个公开版本`。
3. 把 [RELEASE_NOTES.md](RELEASE_NOTES.md) 的内容粘贴到发布说明。
4. 将 `submission-tracker-v1.0.0.zip` 上传到 Release 附件。确认 ZIP 只包含通用版软件与说明，再发布。

参考：[GitHub Releases 发布指南](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。
希望大家多多交流，多多投稿,多接accept!如果这个小工具对你有所帮助，欢迎自愿捐赠，以支持后续维护与改进。捐赠完全自愿，不会影响软件的使用；你的使用、反馈或分享同样是对项目很好的支持If you find this little tool useful, you’re welcome to support its continued development with a small, optional donation. There’s absolutely no obligation—using and sharing the project is already appreciated. Alipay：damonovo@163.com
