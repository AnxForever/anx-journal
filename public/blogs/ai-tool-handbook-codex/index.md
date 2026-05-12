# Codex 入门：App、IDE 扩展和 CLI 怎么选

第一次用 Codex，先不用纠结“哪个最强”。入口选择应该看你的工作习惯：想少折腾就用 App，常驻编辑器就用 IDE 扩展，习惯终端和自动化就用 CLI。

本文核对时间：2026-05-12。

## 三种入口对比

| 入口 | 一句话描述 | 需要 Node.js | 适合谁 |
|------|------------|--------------|--------|
| Codex App | 图形界面，适合新手快速体验 | 否 | 新手、偏图形界面的用户 |
| IDE 扩展 | 在 VS Code、Cursor、JetBrains 等编辑器侧边栏使用 | 否 | 习惯边看代码边修改的人 |
| Codex CLI | 在终端里和 Codex 对话、改代码、跑命令 | npm 安装需要 Node.js 22+ | 终端党、自动化、远程服务器 |

我的建议：

- 第一次体验：优先 App 或 IDE 扩展。
- 真实开发：优先 CLI。
- 国内网络环境：先读 [API Key、中转站与国内模型配置](/blog/ai-tool-handbook-codex-network)，再选入口。

## Codex App

Codex App 是官方图形界面。它适合先理解 Codex 的基本工作方式：选择项目目录、输入任务、查看 diff、确认或继续追问。

你需要：

- ChatGPT 账号，或可用的 API key / 中转站 key
- macOS 13+ 或 Windows 10+
- 一个练习项目目录

官方入口：

- 下载页：https://openai.com/codex/get-started/
- App 文档：https://developers.openai.com/codex/app
- Windows 应用商店：https://apps.microsoft.com/detail/9plm9xgg6vks

基本流程：

1. 打开 Codex App。
2. 选择一个本地项目目录。
3. 输入一个小任务，例如“分析这个项目结构，只输出说明，不修改文件”。
4. 看 Codex 的分析和计划。
5. 后续再让它生成 diff，并人工审查。

第一次不要直接选生产项目。先用练习目录熟悉 diff 和回滚方式。

## IDE 扩展

IDE 扩展适合已经长期使用 VS Code、Cursor、Windsurf 或 JetBrains IDE 的人。它的优势是上下文就在编辑器里，不需要切换窗口。

安装方式通常是：

1. 打开扩展市场。
2. 搜索 Codex 或 OpenAI Codex。
3. 安装官方扩展。
4. 在侧边栏登录。

IDE 扩展和 CLI 通常共用 `~/.codex/` 配置目录。也就是说，你在本地配置过中转站或 provider 后，IDE 侧一般也能复用。

适合在 IDE 里做的任务：

- 解释当前文件或一段选中代码
- 小范围修复 bug
- 生成测试
- 根据报错定位文件
- 查看 diff 后人工决定是否应用

## Codex CLI

CLI 是最适合长期使用的入口，因为它和本地项目、Git、测试命令、脚本化流程结合最好。

安装：

```bash
npm i -g @openai/codex
```

国内 npm 慢时可以临时使用镜像：

```bash
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

验证：

```bash
codex --version
```

启动：

```bash
cd my-project
codex
```

如果你想更保守地启动，可以限制沙箱和审批：

```bash
codex --sandbox read-only --ask-for-approval on-request
```

日常开发可以允许在当前工作区写文件，同时保留关键命令确认：

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

不要随手在个人电脑上使用完全绕过审批和沙箱的模式。只有在外部环境已经隔离时才考虑。

## 第一个任务怎么跑

建议用一个新目录练习：

```bash
mkdir codex-todo-demo
cd codex-todo-demo
git init
codex --sandbox workspace-write --ask-for-approval on-request
```

在 Codex 里输入：

```text
用 Python 写一个命令行 TODO 应用，支持添加、列出、删除任务，数据保存在 todo.json 文件中。测试使用 Python 标准库 unittest，不依赖第三方包。
```

完成后退出，验证：

```bash
ls
git diff
python3 -m unittest -v
```

这一步的目标不是做出完美应用，而是确认 Codex 能读写文件、运行测试、让你审查 diff。

## 常用 CLI 命令

交互界面里常用：

| 命令 | 作用 |
|------|------|
| `/plan` | 先看方案，再执行 |
| `/model` | 查看或切换模型 |
| `/compact` | 压缩上下文 |
| `/status` | 查看当前配置状态 |

外部命令常用：

| 命令 | 作用 |
|------|------|
| `codex login` | 登录或更新本机凭据 |
| `codex exec "任务"` | 非交互式执行一次任务 |
| `codex review` | 对当前改动做审查 |
| `codex resume` | 恢复会话 |
| `codex mcp` | 管理 MCP Server |

## Windows 建议

如果项目依赖 Linux 工具链，优先用 WSL 2。PowerShell 原生可以运行，但遇到 shell、路径、权限问题时，WSL 更稳定。

WSL 中安装：

```bash
npm i -g @openai/codex
codex
```

## 常见问题

### codex 命令找不到

先看 npm 全局路径：

```bash
npm prefix -g
```

把输出目录加入 PATH，重开终端再试。

### Node.js 版本不够

npm 安装通常需要 Node.js 22+：

```bash
node --version
nvm install 22
nvm use 22
```

### 网络连接失败

国内网络环境下，默认连接 OpenAI 服务可能超时。解决方案不是只改模型名，而是配置兼容 Responses API 的中转站或国内模型网关。下一篇文章专门讲这个。

## 参考来源

- Codex 下载页：https://openai.com/codex/get-started/
- Codex App 文档：https://developers.openai.com/codex/app
- Codex IDE 文档：https://developers.openai.com/codex/ide
- Codex CLI 文档：https://developers.openai.com/codex/cli
- Codex CLI 参数参考：https://developers.openai.com/codex/cli/reference
