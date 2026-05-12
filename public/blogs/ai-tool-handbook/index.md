# AI 编程工具手册：给国内开发者的阅读路线

这组文章是给“想真正把 AI 编程工具用起来”的开发者准备的。重点不是罗列工具名，而是把几个容易混在一起的问题拆开：入口怎么选、国内网络怎么处理、项目规则怎么固化、什么时候用 MCP，什么时候写 Skill。

本文核对时间：2026-05-12。工具更新很快，具体命令和登录入口以官方文档、当前版本 `--help` 输出为准。

## 先看结论

如果你刚开始用，建议按这个顺序读：

1. [Codex 入门：App、IDE 扩展和 CLI 怎么选](/blog/ai-tool-handbook-codex)
2. [不用订阅账号也能用 Codex：API Key、中转站与国内模型配置](/blog/ai-tool-handbook-codex-network)
3. [Claude Code 入门：安装、登录和 CLAUDE.md](/blog/ai-tool-handbook-claude-code)
4. [MCP 入门：把文件、GitHub 和数据库接给 AI](/blog/ai-tool-handbook-mcp)
5. [Skills 入门：把重复提示词沉淀成工作流](/blog/ai-tool-handbook-skills)
6. [这份手册应该部署在哪：国内访问优先的方案](/blog/ai-tool-handbook-deploy-cn)

最短路线是：先跑通 Codex CLI，再补 `AGENTS.md`，再按需要配置 MCP 或 Skill。

## 这套手册解决什么

AI 编程工具的坑通常不在“会不会写提示词”，而在这些基础设施问题：

| 问题 | 对应文章 |
|------|----------|
| 不知道装 App、IDE 扩展还是 CLI | Codex 入门 |
| 没有 ChatGPT 订阅账号，或国内无法直连 | Codex 网络与模型接入 |
| 想多保留一个 Claude 生态工具 | Claude Code 入门 |
| 想让 AI 安全访问文件、GitHub、数据库 | MCP 入门 |
| 总是重复同一段提示词和审查清单 | Skills 入门 |
| 想让国内读者能稳定访问手册 | 国内部署方案 |

## 先分清四个概念

`Codex` 是 OpenAI 生态里的编程代理入口，可以通过 App、IDE 扩展或 CLI 使用。

`Claude Code` 是 Anthropic 生态里的终端编程代理，适合在项目目录里读代码、改代码、跑命令。

`MCP` 解决的是“AI 需要访问外部工具或数据源”的问题，例如文件系统、GitHub、数据库、内部 API。

`Skill` 解决的是“AI 需要复用一套工作方法”的问题，例如固定的中文文档写法、代码审查格式、发布清单。

## 国内用户优先处理网络和协议

很多失败不是模型能力问题，而是入口不通、协议不兼容、密钥没被正确读取。

建议先确认三件事：

- 你准备用 ChatGPT 登录，还是用 API key / 中转站 key / 国内模型 key。
- 你的 provider 是否兼容 OpenAI Responses API。
- 本地 `~/.codex/config.toml` 和环境变量是否能被当前终端读取。

只支持 `/v1/chat/completions` 的服务，通常不适合新版 Codex 主流程。它们可以留给其他兼容 Chat Completions 的工具使用。

## 推荐学习路径

### 完全新手

先装 Codex App 或 IDE 扩展，选一个练习目录，让它做一个很小的任务。不要一开始就让它改生产项目。

完成后再读网络接入文章，把 API key、中转站或国内模型网关配置清楚。

### 有开发经验

直接从 Codex CLI 开始：

```bash
npm i -g @openai/codex
codex --version
codex
```

跑通后补一个 `AGENTS.md`，把项目的安装、测试、构建和修改边界写进去。

### 团队或长期项目

建议同时准备：

- 项目根目录的 `AGENTS.md`
- Claude Code 用户需要的 `CLAUDE.md`
- 一组最小可用的 MCP Server
- 1-3 个高频工作流 Skill

这里的重点是“少而稳定”。每个工具入口都要有明确边界和验证方式。

## 发布形态

这份手册不一定要做成独立网站。放进博客反而更适合长期维护：每个主题是一篇文章，后续更新某一章时不会影响整站结构。

如果要保证国内访问，部署是另一个问题。当前博客使用 Next.js + OpenNext Cloudflare，内容并入博客以后，读者是否能稳定访问仍取决于博客实际部署线路。具体取舍见部署方案文章。

## 参考来源

- OpenAI Codex 文档：https://developers.openai.com/codex/
- Claude Code 文档：https://code.claude.com/docs/en/
- MCP 官方文档：https://modelcontextprotocol.io/docs
- OpenAI Skills 示例：https://github.com/openai/skills
