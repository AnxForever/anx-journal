# 部署推送备忘

## 当前线上环境

`anxforever.cn` 当前部署在阿里云服务器，不再通过 Vercel 自动发布。

- 服务器：`59.110.91.219`
- 应用目录：`/var/www/blog`
- systemd 服务：`anx-journal-blog.service`
- Next.js 监听：`0.0.0.0:3000`
- 域名入口：Nginx HTTPS 反向代理到 `127.0.0.1:3000`
- Nginx 配置：`/etc/nginx/conf.d/anxforever.cn.conf`

线上状态可通过以下命令检查：

```bash
ssh root@59.110.91.219 'systemctl status anx-journal-blog.service --no-pager'
curl -I https://anxforever.cn
```

## 发布流程

项目提供 `scripts/deploy-server.sh`，默认目标与当前线上环境一致：

```bash
pnpm build
bash scripts/deploy-server.sh
```

脚本会同步源码与 `.next` 构建产物，然后重启 `anx-journal-blog.service`。发布前应先检查工作区，避免把无关的未完成修改同步到服务器。

如果只发布文章，应至少同步：

- `public/blogs/<slug>/`
- `public/blogs/index.json`
- `public/blogs/categories.json`（分类有变化时）

文章索引会参与 sitemap、RSS 和页面生成，修改后仍需重新构建并重启服务。

## GitHub 仓库

仓库地址：`git@github.com:AnxForever/anx-journal.git`

GitHub 用于版本管理，但推送 `main` 当前不会自动更新线上服务器。发布与 Git 推送是两个独立步骤。

## 不应提交的本地文件

- `.claude/`
- `.codex/`
- `CLAUDE.md`
- `.playwright-mcp/`
- 本地缓存与构建临时文件

如果服务器地址、目录、端口或服务名发生变化，应同时更新本文与 `scripts/deploy-server.sh`。

## 环境变量：GitHub 贡献热力图

首页 GitHub 卡片（`/api/contributions`）有两种数据源：

- **不配 token**：走公共 API `github-contributions-api.jogruber.de`，无需鉴权，但只含**公开**贡献，且依赖第三方爬取，偶发不稳。
- **配 `GITHUB_CONTRIB_TOKEN`**（推荐）：走官方 GraphQL，最稳，且能统计**私有仓库**贡献。

Token 生成：GitHub → Settings → Developer settings → Personal access tokens。
- Classic token 勾选 `read:user`（要统计私有贡献再加 `repo`）。
- 或 Fine-grained token，Account permissions 里给 read 权限即可。

配置位置（当前阿里云 systemd 部署）：写进服务的 `Environment`，例如
`/etc/systemd/system/anx-journal-blog.service` 中加一行
`Environment=GITHUB_CONTRIB_TOKEN=ghp_xxxx`，然后
`systemctl daemon-reload && systemctl restart anx-journal-blog.service`。

Vercel / Cloudflare 部署则在各自控制台的环境变量里加 `GITHUB_CONTRIB_TOKEN`。

> token 是机密，只放服务端环境变量，**切勿**写进代码或以 `NEXT_PUBLIC_` 前缀暴露给前端。接口只回传聚合计数，不泄露 token。
