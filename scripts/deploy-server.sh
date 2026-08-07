#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-59.110.91.219}"
USER_NAME="${DEPLOY_USER:-root}"
APP_DIR="${DEPLOY_DIR:-/var/www/blog}"
DOMAIN="${DEPLOY_DOMAIN:-anxforever.cn}"
SERVICE_NAME="${DEPLOY_SERVICE_NAME:-anx-journal-blog.service}"

SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=no)
SSH_TARGET="${USER_NAME}@${HOST}"
RSYNC_SSH="ssh ${SSH_OPTS[*]}"

echo "==> 本地构建"
pnpm build

echo "==> 准备服务器目录：${APP_DIR}"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "mkdir -p '${APP_DIR}'"

echo "==> 同步源码到服务器"
rsync -az --delete --no-owner --no-group \
	--exclude .git \
	--exclude node_modules \
	--exclude .next \
	--exclude .open-next \
	--exclude .wrangler \
	--exclude .claude \
	--exclude .codex \
	--exclude .vscode \
	--exclude CLAUDE.md \
	--exclude tsconfig.tsbuildinfo \
	-e "${RSYNC_SSH}" \
	./ "${SSH_TARGET}:${APP_DIR}/"

echo "==> 同步本地构建产物"
rsync -az --delete --no-owner --no-group --exclude cache \
	-e "${RSYNC_SSH}" \
	.next/ "${SSH_TARGET}:${APP_DIR}/.next/"

echo "==> 重启服务"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "
set -e
if ! timeout 45 systemctl restart '${SERVICE_NAME}'; then
	echo 'restart timeout; force restarting ${SERVICE_NAME}'
	systemctl kill -s SIGKILL '${SERVICE_NAME}' || true
	sleep 1
	systemctl reset-failed '${SERVICE_NAME}' || true
	systemctl start '${SERVICE_NAME}'
fi
sleep 4
systemctl is-active '${SERVICE_NAME}'
"

echo "==> 预热文章页和封面"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "
set -e
cd '${APP_DIR}'
node - <<'NODE'
const fs = require('node:fs')

const index = JSON.parse(fs.readFileSync('public/blogs/index.json', 'utf8'))
const urls = new Set(['/', '/robots.txt', '/sitemap.xml'])
for (const item of index) {
	if (!item || item.hidden || !item.slug) continue
	urls.add('/blog/' + item.slug)
	if (item.cover) urls.add(item.cover)
}

async function warm(path) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), 8000)
	try {
		const response = await fetch('http://127.0.0.1:3000' + path, { signal: controller.signal })
		await response.arrayBuffer()
		console.log(response.status, path)
	} catch (error) {
		console.log('ERR', path, error && error.name ? error.name : error)
	} finally {
		clearTimeout(timer)
	}
}

(async () => {
	for (const path of urls) await warm(path)
})()
NODE
"

echo "==> 验证域名"
wget -S -T 10 -t 1 --spider "https://${DOMAIN}" || true

echo "部署脚本执行完成。"
