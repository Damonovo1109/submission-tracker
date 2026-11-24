## v1.0.0 · 首个公开版本

**投稿进度台账（Submission Tracker）** 将多个期刊的官网、作者后台和稿件地址集中在一个页面。可双击在本机打开，也可通过 GitHub Pages 在线使用。

### 新功能

- 内置 MDPI、PNAS、Journal of the Asia Pacific Economy、Technology in Society、Growth and Change 及 Humanities and Social Sciences Communications 的示例入口。支持新增、编辑和删除入口。
- 记录稿件题目、稿号、状态、状态日期、专属链接和备注。打开官网作者后台查询最新状态。
- 提供 JSON 备份导入和导出，支持导入旧版桌面台账的备份。
- 提供访客台账和 Google 账号登录界面。部署者配置 Firebase Authentication 后，可使用 Google 官方授权弹窗，在当前浏览器切换账号对应的台账。

### 下载与使用

下载 Release 中的 `submission-tracker-v1.0.0.zip`，解压后打开 `index.html`。如需部署 GitHub Pages 或启用 Google 登录，请按 README 配置。

### 数据与状态

公开发行包从空白稿件记录开始。数据保存在使用者的当前浏览器中，可自行导出备份。状态由使用者更新，最新进度以期刊作者后台所示为准。
