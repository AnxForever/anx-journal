# MCP 入门：把文件、GitHub 和数据库接给 AI

MCP（Model Context Protocol）是一套让 AI 应用连接外部工具和数据源的开放协议。你可以把它理解成 AI 工具的标准化工具接口。

本文核对时间：2026-05-12。

## MCP 解决什么问题

如果 AI 只是在当前项目里读写代码，普通 CLI 或 IDE 扩展已经够用。MCP 的价值在于：当 AI 需要访问项目外部的数据或工具时，给它一个结构化、可控、可复用的入口。

典型场景：

- 读取指定目录里的资料。
- 查询 GitHub issue / PR。
- 查询只读数据库。
- 调用内部系统 API。
- 复用同一个工具入口给 Claude Code、Codex、Cursor 等不同 Host。

## 三个角色

| 名称 | 作用 | 例子 |
|------|------|------|
| Host | 你正在使用的 AI 应用 | Claude Code、Codex、Cursor |
| Client | Host 内部负责连接 MCP Server 的部分 | 通常由 AI 应用内置 |
| Server | 暴露工具和数据的进程 | filesystem server、GitHub server、数据库 server |

日常配置时，主要关心的是给 Host 添加哪些 MCP Server。

## MCP Server 提供什么

| 能力 | 含义 | 例子 |
|------|------|------|
| Tools | 可被模型调用的动作 | 创建 issue、查询数据库、读文件 |
| Resources | 可读取的上下文数据 | 文档、表结构、仓库文件 |
| Prompts | 可复用提示模板 | 代码审查模板、发布说明模板 |

普通用户最常用的是 Tools。

## 第一个 Server：只读练习目录

不要一开始就把整个用户目录暴露给 AI。先建一个练习目录：

```bash
mkdir -p ~/mcp-demo/notes
printf "hello mcp\n" > ~/mcp-demo/notes/readme.txt
```

大多数 MCP 配置形态类似：

```json
{
  "mcpServers": {
    "filesystem-demo": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/mcp-demo"
      ]
    }
  }
}
```

含义：

- `filesystem-demo` 是 server 名称。
- `command` 是启动命令。
- `args` 是命令参数。
- 最后的路径是允许访问的目录。

Windows 路径示例：

```json
{
  "mcpServers": {
    "filesystem-demo": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\you\\mcp-demo"
      ]
    }
  }
}
```

## 在 Claude Code 中添加

```bash
claude mcp add filesystem-demo -- npx -y @modelcontextprotocol/server-filesystem ~/mcp-demo
claude mcp list
```

然后启动：

```bash
claude
```

提问：

```text
列出 filesystem-demo 能看到的文件，只读，不要修改。
```

## 在 Codex 中添加

```bash
codex mcp add filesystem-demo -- npx -y @modelcontextprotocol/server-filesystem ~/mcp-demo
codex mcp list
```

启动：

```bash
codex
```

提问：

```text
查看可用 MCP 工具，说明 filesystem-demo 提供了什么能力。不要修改文件。
```

## 范例一：本地资料夹助手

适合：

- 总结一组 Markdown 笔记。
- 根据本地规范回答问题。
- 检查新文档是否漏了章节。

准备目录：

```bash
mkdir -p ~/mcp-demo/handbook-notes
printf "Codex 文档要求：先给结论，再给步骤。\n" > ~/mcp-demo/handbook-notes/style.md
printf "示例 key 必须写成 sk-your-api-key。\n" > ~/mcp-demo/handbook-notes/security.md
```

添加：

```bash
codex mcp add handbook-notes -- npx -y @modelcontextprotocol/server-filesystem ~/mcp-demo/handbook-notes
codex mcp list
```

提问：

```text
只读取 handbook-notes 里的资料，总结这个项目的写作规则。不要修改文件。
```

这个例子风险低，因为暴露给 AI 的目录很小。

## 范例二：Issue / PR 摘要助手

适合：

- 整理最近打开的 issue。
- 根据 PR diff 生成审查要点。
- 把发布前未完成事项列成清单。

配置形态通常类似：

```json
{
  "mcpServers": {
    "github-readonly": {
      "command": "npx",
      "args": ["-y", "<github-mcp-server-package>"],
      "env": {
        "GITHUB_TOKEN": "ghp-your-token"
      }
    }
  }
}
```

建议：

- 先用只读 token。
- token 不要写进仓库文件。
- 第一次只让 AI 列表、总结、分类，不让它直接改远程状态。

可用任务：

```text
查看当前仓库最近 5 个 open issue，按“安装问题、配置问题、文档问题、其他”分类，只输出摘要和建议下一步。
```

## 范例三：只读数据库问答

适合：

- 查询产品指标。
- 检查某个用户状态。
- 根据运营数据生成周报草稿。

数据库类 MCP 一定先用只读账号。配置形态类似：

```json
{
  "mcpServers": {
    "analytics-readonly": {
      "command": "node",
      "args": ["/path/to/analytics-mcp-server.js"],
      "env": {
        "DATABASE_URL": "postgres://readonly_user:password@host:5432/app"
      }
    }
  }
}
```

更稳妥的做法：

- 给 MCP 单独建只读数据库账号。
- 限制能访问的 schema、表和视图。
- 让 server 内部做 SQL 白名单或超时限制。
- 禁止把生产写权限、管理员账号、全库导出能力交给 AI。

提问示例：

```text
使用 analytics-readonly 查询过去 7 天新增用户数，只输出 SQL、结果摘要和你对数据可靠性的判断，不要做任何写入操作。
```

## 什么时候不要用 MCP

如果只是重复一套写作步骤、代码审查格式或发布检查清单，不需要接外部系统，优先写 Skill。MCP 适合“访问哪里”，Skill 适合“怎么做”。

## 安全原则

每加一个 MCP Server，模型就多一组可调用能力。

建议：

- 只添加当前任务需要的 server。
- 给 filesystem 限定目录。
- 给 database 使用只读账号。
- 不把真实 API key 写进共享配置。
- 定期清理不再使用的 server。

## 参考来源

- MCP 官方网站：https://modelcontextprotocol.io/
- MCP 文档：https://modelcontextprotocol.io/docs
- MCP Quickstart：https://modelcontextprotocol.io/docs/getting-started/intro
- MCP Examples：https://modelcontextprotocol.io/examples
- Claude Code MCP 文档：https://code.claude.com/docs/en/mcp
