# Claude Code 入门：安装、登录和 CLAUDE.md

Claude Code 是 Anthropic 面向开发者的命令行 AI 编程工具。它适合在项目目录里读代码、改代码、运行命令、处理 Git 工作流。

本文核对时间：2026-05-12。

## 和 Codex 怎么选

两者不是非此即彼。很多开发者会同时保留 Codex 和 Claude Code：一个负责主要开发，另一个负责审查、解释代码或提供第二意见。

| 项目 | Codex | Claude Code |
|------|-------|-------------|
| 主要生态 | OpenAI / ChatGPT | Anthropic / Claude |
| 主要入口 | App、IDE 扩展、CLI | CLI 为主 |
| 项目指令文件 | `AGENTS.md` | `CLAUDE.md` |
| MCP 支持 | 支持 | 支持 |
| 适合任务 | 编码、审查、云端任务、PR | 编码、终端自动化、代码库理解、Git 工作流 |

如果你已经在用 Claude Pro / Max / Team / Enterprise，Claude Code 值得保留。

## 前置条件

需要：

- Node.js 18+
- npm
- Anthropic Console 账号，或 Claude Pro / Max / Team / Enterprise 账号
- 一个练习项目目录

检查版本：

```bash
node --version
npm --version
```

## 安装

```bash
npm install -g @anthropic-ai/claude-code
```

国内 npm 慢时可以临时使用镜像：

```bash
npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com
```

验证：

```bash
claude --version
```

如果命令找不到，查看 npm 全局目录：

```bash
npm prefix -g
```

把输出路径加入 PATH，重开终端再试。

## 启动和登录

建议先建练习目录：

```bash
mkdir claude-demo
cd claude-demo
git init
claude
```

首次启动会引导登录。常见方式包括：

- Claude 账号登录
- Anthropic API key
- 团队或企业配置

如果使用 API key，不要把真实 key 写进项目文件或文档。

## 第一个任务

在 Claude Code 里输入：

```text
用 Python 写一个命令行计数器，支持 inc、dec、show 三个命令，数据保存在 counter.json。测试使用 Python 标准库 unittest。
```

完成后退出，运行：

```bash
ls
git diff
python3 -m unittest -v
```

你应该能看到它创建的代码、测试和 diff。

## 常用命令

| 命令 | 作用 |
|------|------|
| `claude` | 启动交互式会话 |
| `claude --version` | 查看版本 |
| `claude update` | 更新 Claude Code |
| `/help` | 在交互界面查看可用命令 |
| `/clear` | 清空当前上下文 |
| `/compact` | 压缩上下文 |

不同版本命令可能变化，以 `claude --help` 和交互界面 `/help` 为准。

## 用 CLAUDE.md 固化项目规则

`CLAUDE.md` 是写给 Claude Code 的项目说明文件。它和 Codex 的 `AGENTS.md` 作用相似：告诉 AI 这个项目怎么安装、怎么测试、哪些文件不要碰。

常见位置：

```text
my-project/
  CLAUDE.md
  package.json
  src/
```

大项目也可以在子目录放更具体的 `CLAUDE.md`：

```text
apps/web/CLAUDE.md
packages/api/CLAUDE.md
```

推荐模板：

```markdown
# CLAUDE.md

## 项目概况

这是一个 Next.js 中文博客，文章内容放在 public/blogs。

## 常用命令

- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`
- 构建验证：`pnpm build`

## 写作规则

- 使用简体中文
- 先给结论，再给步骤
- 命令、配置、排错分开写
- 涉及外部工具版本时，优先核对官方文档

## 禁止事项

- 不提交 `node_modules/`
- 不把真实 API key、token、cookie 写入文档
- 不修改未授权的部署密钥和生产配置

## 完成前检查

1. 运行 `pnpm build`
2. 检查新增文章是否进入 `public/blogs/index.json`
3. 检查分类是否进入 `public/blogs/categories.json`
```

## CLAUDE.md 写作原则

写可执行规则，不写愿望清单。

不要写：

```markdown
- 保持高质量
- 注意安全
```

改成：

```markdown
- 修改 TypeScript 后运行 `pnpm build`
- 示例 key 统一写成 `sk-your-api-key`
- 不读取或展示 `.env*` 文件内容
```

`CLAUDE.md` 不应该变成项目百科。详细背景放进 `docs/`，在 `CLAUDE.md` 里给入口即可。

## 和 AGENTS.md 共存

可以共存：

```text
AGENTS.md    # 给 Codex
CLAUDE.md    # 给 Claude Code
```

如果项目同时使用两种工具，建议两份文件保持同一套结构，但不要为了同步而引入复杂生成脚本。清晰、短小、人工可维护更重要。

## 参考来源

- Claude Code 文档：https://code.claude.com/docs/en/
- Claude Code 快速开始：https://code.claude.com/docs/en/quickstart
- Claude Code 安装文档：https://code.claude.com/docs/en/setup
- Claude Code Memory 文档：https://code.claude.com/docs/en/memory
