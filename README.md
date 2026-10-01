# Yang Gu · Personal workshop

中英文个人项目主页，原生 HTML / CSS / JavaScript，Cloudflare Workers 提供登录与项目权限 API，Durable Object 的 SQLite 持久保存会话和账号偏好；本地也支持 Node.js 22+。

线上主页：https://homepage.gyagp.workers.dev/

旧地址 gyagp-home.gyagp.workers.dev 会保留路径与查询参数跳转到新地址。浏览器 Cookie 按域名隔离，首次访问新地址需重新登录；服务器上的排序与置顶偏好保留。

## 本地运行

    npm start

打开 http://127.0.0.1:4173/?lang=zh 或 http://127.0.0.1:4173/?lang=en 。

当前本机的管理员与受保护项目已配置。唯一支持的账号为 gyagp。密码仅以随机盐和 scrypt 哈希保存在已忽略的 .private/auth.json 中，不写入前端或 Git。

新环境使用 npm run setup 交互设置密码，再把受保护项目资料放入 .private/projects.json。设置脚本不会覆盖已有账号或项目。可用 PORTFOLIO_PRIVATE_DIR 指向站点目录之外的私有数据目录。

## 访问规则

- 访客可见“已发布，或代码公开”的项目。已发布应用即使代码私有也可展示；私有代码入口仍不交给访客。企业入口和受 Vercel 保护的部署记录不作为公开发布依据。
- gyagp 登录后，额外的未发布私有项目与企业项目单独显示在“我的其它项目”中。修改 localStorage 或页面元素不会获得权限。
- 会话使用随机令牌和 HttpOnly、SameSite=Strict Cookie，8 小时过期。退出时服务端立即撤销会话。Cloudflare 会话保存在 SQLite，运行实例重启不丢失；本地 Node 服务重启需重新登录。
- 登录受同源检查和尝试频率限制。API 不缓存私有响应，静态服务仅允许公开页面、assets/ 和 archive/，不提供目录列表。
- 当前仅有一个管理员，没有注册或其他用户入口。
- 支持拖动、前后移动、置顶和取消置顶；调整限定在同一展示分组及置顶状态内。访客偏好保存在浏览器；登录后保存到服务器，独立浏览器登录也能恢复。保存状态与失败重试入口会显示在排序工具下方。
- Cloudflare 的账号偏好保存在 Durable Object SQLite；本地 Node 版本保存为 .private/preferences.json。前端不会把登录用户的偏好写入 localStorage。
- 主页登录不授予 GitHub 仓库或项目自身的访问权限。

## Cloudflare 部署

    npm ci
    npx wrangler auth activate gyagp0
    npm run cf:deploy

部署脚本先校验邮箱与账号 ID，目标固定为 gyagp0@gmail.com 的个人 Cloudflare 账号。构建仅复制白名单页面和静态资源到 dist/，不会上传整个工作目录。

.private/projects.json 仅编入服务端 Worker；.private/auth.json 的盐与密码哈希作为 AUTH_CONFIG Secret 上传，不包含明文密码。SQLite Durable Object 保存会话、登录限流和用户排序、置顶偏好；重新发布不会清空已有偏好。账号类仍由旧 Worker gyagp-home 承载，新 Worker homepage 通过跨脚本绑定复用原命名空间。不要删除旧 Worker 或把该绑定改成新建命名空间，否则会影响已有数据。

部署脚本先发布并检查新主页，再发布 cloudflare/wrangler-legacy.json：它保留账号类，只将旧站网页跳转至新域名。

部署前需在本机配置 .private/，或从安全备份恢复该目录。它不会进入 Git，也不属于公开资源。npm run setup 可以初始化本地管理员。GitHub Pages 只能提供访客可见的静态页面，完整登录功能使用上面的 Cloudflare 站点。

保留 Node.js 运行方式：npm start。若改用 Node 主机，设置 NODE_ENV=production、PUBLIC_ORIGIN=站点 HTTPS 地址，并通过反向代理提供 HTTPS。PORTFOLIO_PRIVATE_DIR 可以指向独立的私有配置目录。

## 维护项目

访客目录在 assets/js/projects.js（ES module）；私有代码项目的完整资料在 .private/projects.json（JSON 数组）。已发布的私有项目会同时在访客目录中保留移除 repo / futureSource 的副本；服务端按 id 合并，不重复展示。

    {
      "id": "my-project",
      "order": 20,
      "art": "reading",
      "category": "tools",
      "visibility": "public",
      "name": { "zh": "项目名", "en": "Project name" },
      "subtitle": "A SHORT VISUAL CAPTION",
      "description": { "zh": "简介", "en": "Description" },
      "tags": { "zh": ["标签"], "en": ["Tag"] },
      "repo": "https://github.com/owner/repo",
      "release": {
        "url": "https://example.com/",
        "kind": "web",
        "access": "public"
      },
      "future": { "zh": [], "en": [] },
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-09-01T00:00:00Z"
    }

- category：tools / learning / games / ai / graphics。项目数量和分类根据当前有权查看的项目计算。
- visibility：public / private / restricted / unknown，仅表示代码权限。非 public 的完整记录放在私有目录；是否向访客展示由代码公开或非企业发布入口共同决定。unknown 表示权限未确认。
- release.kind：web / download / deployment；release.access：public / account / registration / restricted / webgpu / enterprise / vercel。enterprise 不视为发布；deployment + vercel 是受保护的部署记录。
- createdAt 取 GitHub created_at；updatedAt 取 pushed_at，表示最近代码推送日期。显示 UTC 日期；没有仓库读取权限时为 null，页面显示“待确认”。
- 没有已确认的发布链接时 release 为 null，releaseState 为 unlisted / private / verify / sourceBuild / extension。
- future 空数组显示“待更新”。来自仓库的计划可附 futureSource 链接；不构成完成时间承诺。
- art 可选，引用 portfolio.js 中的通用插画。不使用私有项目名命名公开素材。
- 固定文案在 assets/js/portfolio.js 的 translations；布局在 index.html，样式在 assets/css/portfolio.css。
- 无 JavaScript 的公开项目列表在 index.html 的 noscript 中，应与公开项目同步更新。
- 联系方式在 index.html，复制邮箱逻辑在 portfolio.js。语言按 URL 参数、保存的偏好、浏览器语言依次选择。

## 公开链接核对

- 魔方原地址 gyagp/rubiks-cube-threejs 已迁移到 https://github.com/webgfx/rubiks-cube ，演示为 https://webgfx.github.io/rubiks-cube/ 。
- WebGPU 演示集：https://webgfx.github.io/webgpu-demos/ ，汇集社区作品。
- 水族馆：https://webgfx.github.io/aquarium-web/webgpu/aquarium ，需支持 WebGPU 的浏览器。
- Online Toolkit 正确网址：https://webgfx.github.io/online-toolkit/ 。
- GPUMark 为 Windows 本地测试集；Pantheon Toolkit 为需手动安装的浏览器扩展。
- Handwriting 的最新 GitHub Production 成功部署记录（2026-02-17）：https://handwriting-3pw0h8r36-gyagps-projects.vercel.app ，目前要求 Vercel 登录。仓库登记的 handwriting-rho.vercel.app 标题为 Adaptive Handwriting Coach，暂不能确认与当前仓库版本相符；主页使用已核实的“查看部署”入口。
- Fingoo：https://fingoo.gyagp.workers.dev/ ，代码私有但已发布，因此进入访客区。
- Backpack 是公开的 C++ / WebGPU 推理运行时，进入访客区。

受保护项目的核对记录和元数据仅在私有目录中保留。

## 验证

服务端权限测试无需额外依赖：

    npm test

浏览器验证需 Playwright：

    npm install --no-save --package-lock=false playwright
    npx playwright install chromium
    npm run test:browser

可用 PLAYWRIGHT_MODULE 指定现有模块路径，PLAYWRIGHT_BROWSER=msedge 使用已安装的 Edge。可选 AXE_CORE_MODULE 指向 axe-core 的 axe.min.js，追加桌面和手机的双语自动化无障碍检查。

测试使用临时的合成私有项目与测试凭据，不读取或修改真实账号。覆盖正确/错误账号、Cookie 安全属性、退出撤销、过期、跨站请求、限流、静态路径隔离，以及双语、筛选、搜索、键盘和响应式布局。截图输出至已忽略的 artifacts/。

Cloudflare 运行时与持久化验证：

    npm run build:workers
    npm run test:cloudflare

此测试使用合成凭据和独立 SQLite 存储，验证运行实例重启、退出和重新登录后偏好仍然存在。线上验收已验证真实部署的访客/管理员权限与服务端偏好读写。
