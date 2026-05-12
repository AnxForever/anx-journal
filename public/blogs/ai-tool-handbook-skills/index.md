# Skills 入门：把重复提示词沉淀成工作流

Skill 是把一套可复用工作方法保存下来，让 AI 下次按同样步骤、格式和质量标准执行。它适合沉淀“怎么做”，不适合保存密钥或直接连接外部系统。

本文核对时间：2026-05-12。

## 什么时候该写 Skill

如果你发现自己总在复制类似提示词，就可以考虑写 Skill：

- “按这个格式写中文教程。”
- “按这个 checklist 做代码审查。”
- “生成周报时固定包含风险、进展和下周计划。”
- “改文档后同步导航、来源页和构建检查。”

Skill 的价值不是让提示词变复杂，而是让重复工作稳定下来。

## Skill、项目指令和 MCP 的区别

| 机制 | 解决什么 | 放在哪里 | 例子 |
|------|----------|----------|------|
| `AGENTS.md` / `CLAUDE.md` | 某个项目的长期规则 | 项目仓库 | 构建命令、目录约定、提交前检查 |
| Skill | 跨项目复用的工作方法 | Skill 目录 | 中文文档写作、代码审查、周报生成 |
| MCP | 给 AI 接入外部工具和数据 | Host 的 MCP 配置 | GitHub、数据库、文件系统、内部 API |

简单判断：

- 问题是“这个项目有什么规矩”：写 `AGENTS.md` 或 `CLAUDE.md`。
- 问题是“这类任务要怎么做”：写 Skill。
- 问题是“AI 要访问哪里”：配 MCP。

## Skill 目录长什么样

最小结构：

```text
cn-docs-writer/
  SKILL.md
```

常见完整结构：

```text
cn-docs-writer/
  SKILL.md
  references/
    page-checklist.md
  scripts/
    check_headings.py
  assets/
    template.md
```

`SKILL.md` 是必需文件，通常包含：

- YAML frontmatter：`name`、`description`。
- 正文工作流：触发后应该怎么做。
- 可选资源说明：什么时候读取 `references/`、运行 `scripts/`、使用 `assets/`。

## 写 Skill 的基本流程

1. 先选一个你已经重复做过三次以上的任务。
2. 写清楚触发条件，让 AI 知道什么时候该用。
3. 把核心流程写进 `SKILL.md`，只保留必要步骤。
4. 把长规范、模板、术语表放进 `references/`。
5. 把机械且容易出错的动作做成 `scripts/`。
6. 用 2-3 个真实任务试跑，再删掉多余说明。

## 范例一：中文教程写作 Skill

适合：

- 维护中文 Markdown / VitePress / 博客教程。
- 希望每篇都保持“先结论、再步骤、最后排错”的结构。
- 希望新增页面时同步导航、来源页和构建验证。

目录：

```text
cn-docs-writer/
  SKILL.md
  references/
    page-checklist.md
```

`SKILL.md`：

```markdown
---
name: cn-docs-writer
description: Use when writing or editing Chinese tutorial documentation, especially Markdown or VitePress pages that need clear structure, beginner-friendly wording, navigation updates, and build verification.
---

# 中文教程写作

## 工作流

1. 先确认本次页面解决的一个主要问题。
2. 用简体中文写作，先给结论，再给步骤。
3. 命令、配置、排错分开写，不把大段命令混在正文里。
4. 示例 key 统一使用 `sk-your-api-key`，不要写真实密钥。
5. 新增页面后检查导航、侧边栏、README、来源页是否需要同步。
6. 完成前运行项目规定的构建命令。

## 页面结构

- 顶部用一句话说明页面用途。
- 加一个“本页速读”块，包含解决什么、适合谁、预计耗时。
- 每页只解决一个主要问题。
- 涉及外部产品、模型、价格、API 协议时，优先核对官方文档。

## 何时读取参考资料

如果要新增页面或大改结构，读取 `references/page-checklist.md`。
```

`references/page-checklist.md`：

```markdown
# 页面检查清单

- 标题是否能说明读者会解决什么问题
- 是否有“本页速读”
- 是否把命令、配置、排错分开
- 是否避免真实 API key、token、cookie
- 是否同步导航或索引
- 是否运行构建验证
```

## 范例二：代码审查 Skill

适合：

- 每次审查都希望先列风险，而不是先总结优点。
- 团队想统一严重程度、文件行号、测试缺口写法。
- 想把审查清单从聊天记录里搬出来。

目录：

```text
focused-code-review/
  SKILL.md
```

`SKILL.md`：

```markdown
---
name: focused-code-review
description: Use when reviewing code changes for bugs, regressions, missing tests, security risks, data loss risks, or maintainability issues. Prioritize actionable findings with file and line references.
---

# Focused Code Review

## Review order

1. Read the user request and changed files before judging the diff.
2. Prioritize correctness, security, data loss, migrations, and missing tests.
3. Findings come first. Summaries are secondary.
4. Each finding should include file path, line reference, severity, and why it matters.
5. If no issues are found, say so clearly and mention residual test risk.

## Output format

- Start with findings ordered by severity.
- Use concise bullets.
- Add open questions only when they affect correctness.
- End with a short verification note if tests were run or could not be run.

## Do not

- Do not rewrite unrelated code.
- Do not spend review space on style-only suggestions unless they hide a real bug.
- Do not expose secrets from `.env`, logs, or private config files.
```

## 范例三：带脚本的 Skill

如果一个步骤每次都一样、很机械、容易写错，就可以放进 `scripts/`。

目录：

```text
link-checker/
  SKILL.md
  scripts/
    check_links.py
```

`SKILL.md`：

```markdown
---
name: link-checker
description: Use when checking Markdown documentation links before publishing.
---

# Link Checker

## Workflow

1. Inspect changed Markdown files.
2. Run `python scripts/check_links.py <file>` for edited pages.
3. Report broken local links first, then external links that need manual checking.
4. Do not modify generated site output.
```

脚本负责确定性检查，Skill 负责告诉 AI 什么时候运行、怎么解释结果。

## 常见错误

### 写得太长

`SKILL.md` 不是知识库。正文只放核心流程，详细规范放 `references/`，需要时再读。

### 触发条件太模糊

`description` 不要只写“帮助写文档”。要写清楚什么时候触发，例如“editing Chinese tutorial documentation, especially Markdown or VitePress pages”。

### 写进密钥和私有地址

Skill 可以描述“从环境变量读取 token”，但不要保存真实 token。涉及外部系统访问时，优先用 MCP 或本地配置管理密钥。

## 下一步

先从一个小 Skill 开始：把你最常复制的一段提示词改成 `SKILL.md`。如果它需要访问数据库、GitHub 或本地文件系统，再回到 MCP 方案配置合适的工具入口。

## 参考来源

- OpenAI Skills 介绍：https://academy.openai.com/public/resources/skills
- OpenAI Codex Plugins and Skills：https://openai.com/academy/codex-plugins-and-skills/
- OpenAI Skills 示例仓库：https://github.com/openai/skills
