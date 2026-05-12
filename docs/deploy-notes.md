# 部署推送备忘

当前线上域名 `anxforever.cn` 仍指向 Vercel。日常更新博客时，优先使用 GitHub 推送触发 Vercel 自动部署。

## GitHub / Vercel 自动部署

仓库地址：`git@github.com:AnxForever/anx-journal.git`

本地远端 `origin` 应保持为 SSH：

```bash
git remote set-url origin git@github.com:AnxForever/anx-journal.git
```

确认当前 SSH 身份是个人账号 `AnxForever`：

```bash
ssh -T git@github.com
```

正常发布流程：

```bash
pnpm build
git status --short
git add <需要发布的文件>
git commit -m "Update blog content"
git push origin main
```

推送到 `main` 后，Vercel 会自动从 GitHub 拉取最新代码并重新部署。

## 不要提交的本地文件

以下文件只属于本机工具或临时服务器部署，不应提交到 GitHub：

- `.claude/`
- `.codex`
- `CLAUDE.md`
- `scripts/deploy-server.sh`，除非明确决定以后维护阿里云服务器部署脚本

## 阿里云服务器记录

曾手动部署到服务器 `59.110.91.219`：

- 应用目录：`/www/wwwroot/anx-journal`
- PM2 进程：`anx-journal`
- 本机监听：`127.0.0.1:13001`
- Nginx 配置：`/etc/nginx/conf.d/anxforever.cn.conf`

如果未来要从 Vercel 切回阿里云，需要把 DNS 改为：

```text
@      A      59.110.91.219
www    A      59.110.91.219
```
