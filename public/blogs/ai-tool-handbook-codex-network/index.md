# 不用订阅账号也能用 Codex：API Key、中转站与国内模型配置

Codex 不一定非要通过 ChatGPT 订阅账号使用。你可以走 ChatGPT 登录、OpenAI API key、中转站 key，或者国内模型 provider key。关键在于本地配置文件和协议兼容性。

本文核对时间：2026-05-12。

## 先看结论

- 本地重点文件是 `~/.codex/config.toml` 和 `~/.codex/auth.json`。
- 使用中转站或国内模型时，优先选择兼容 OpenAI Responses API 的服务。
- 只支持 Chat Completions 的服务，不适合作为新版 Codex CLI / IDE 扩展的主流程。
- 不要把真实 API key 写进仓库、博客文章或共享配置。

## 四条入口

| 方式 | 你需要什么 | 本地配置重点 | 适合谁 |
|------|------------|--------------|--------|
| ChatGPT 登录 | ChatGPT 账号 | `auth.json` 由登录流程生成 | 能直连 OpenAI 的用户 |
| OpenAI API key | `OPENAI_API_KEY` | 环境变量或本机凭据 | 想按量计费的用户 |
| 中转站 key | 中转站 key + `base_url` | `config.toml` + 环境变量 | 国内网络、企业代理用户 |
| 国内模型 key | provider key + 兼容入口 | `config.toml` + 环境变量 | 想接入 Qwen、DeepSeek、GLM 等模型的用户 |

## 配置文件位置

macOS / Linux：

```text
~/.codex/
```

Windows：

```text
C:\Users\<你的用户名>\.codex\
```

关键文件：

- `config.toml`：模型、provider、接口地址、安全模式。
- `auth.json`：登录流程生成的认证文件，也可以从已登录机器复制到远程机。

如果目录不存在：

```bash
mkdir -p ~/.codex
```

如果你已经在本机登录过，可以复制认证文件到远程机器：

```bash
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

## 官方默认流程

如果能访问 OpenAI，最简单是登录：

```bash
codex login
codex
```

也可以临时设置 API key：

```bash
export OPENAI_API_KEY="sk-your-api-key"
codex
```

Windows PowerShell：

```powershell
$env:OPENAI_API_KEY="sk-your-api-key"
codex
```

## 中转站接入

中转站配置的重点不是“有没有 OpenAI 风格域名”，而是它是否兼容 Codex 当前需要的接口协议。

先确认服务文档明确支持 OpenAI Responses API。然后编辑：

```bash
nano ~/.codex/config.toml
```

写入类似配置：

```toml
model = "gpt-5.3-codex"
model_provider = "my_proxy"

[model_providers.my_proxy]
name = "My Proxy"
base_url = "https://your-proxy.example.com/v1"
env_key = "MY_PROXY_API_KEY"
wire_api = "responses"
```

这里建议新建自定义 provider，不要覆盖内置 `openai` provider。以后恢复官方配置更容易。

设置密钥：

```bash
export MY_PROXY_API_KEY="sk-your-api-key"
```

PowerShell：

```powershell
$env:MY_PROXY_API_KEY="sk-your-api-key"
```

长期使用可以写入 shell 配置或系统环境变量，但不要提交到 Git。

## 国内模型网关

如果你的国内模型服务提供 OpenAI 兼容入口，并且支持 Responses API，写法和中转站相同：

```toml
model = "your-model-name"
model_provider = "domestic_gateway"

[model_providers.domestic_gateway]
name = "Domestic Gateway"
base_url = "https://your-cn-gateway.example.com/v1"
env_key = "DOMESTIC_API_KEY"
wire_api = "responses"
```

设置密钥：

```bash
export DOMESTIC_API_KEY="sk-your-api-key"
```

需要额外确认：

- 模型是否支持工具调用。
- 是否支持流式输出。
- 是否能返回 Codex 需要的结构化事件。
- provider 是否真的实现 Responses API，而不是只把 Chat Completions 包了一层。

## 为什么不推荐只支持 Chat Completions 的服务

旧教程里常看到：

```toml
wire_api = "chat"
```

新版 Codex 主流程更依赖 Responses API。只支持 `/v1/chat/completions` 的服务可能会出现工具调用失败、事件结构不匹配、上下文状态异常等问题。

如果服务文档只写了 `/v1/chat/completions`，建议把它留给其他兼容 Chat Completions 的工具，不要作为 Codex 主力 provider。

## 验证配置

启动：

```bash
codex
```

进入后输入：

```text
/status
```

重点看：

- 当前 model 是否符合预期。
- provider 是否是你配置的 `my_proxy` 或 `domestic_gateway`。
- base URL 是否正确。
- API key 对应的环境变量是否存在。

终端里也可以先查：

```bash
cat ~/.codex/config.toml
echo $MY_PROXY_API_KEY
echo $DOMESTIC_API_KEY
```

`echo` 不能输出空值。展示给别人时记得打码。

## 常见报错

### 401 Unauthorized

常见原因：

- 环境变量名和 `env_key` 不一致。
- key 拼错、过期、额度不足。
- 新终端没有加载 shell 配置。

### 404 Not Found

常见原因：

- `base_url` 没写对。
- 缺少 `/v1`。
- 模型名不是 provider 支持的名称。

### 连接超时

常见原因：

- 当前网络访问不了 provider。
- 系统代理没有被终端继承。
- `HTTPS_PROXY` / `https_proxy` 配置不正确。

### Unsupported API format

常见原因：

- `wire_api` 没有设置为 `responses`。
- 中转站只兼容 Chat Completions。
- provider 文档和实际实现不一致。

## 90 秒检查清单

每天开始前可以快速检查：

- `codex --version` 能输出版本号。
- `cat ~/.codex/config.toml` 能看到 provider 配置。
- `echo $MY_PROXY_API_KEY` 或 `echo $DOMESTIC_API_KEY` 不为空。
- 当前网络能访问 `base_url`。
- `codex` 能进入交互模式，`/status` 显示符合预期。

## 参考来源

- Codex 基础配置：https://developers.openai.com/codex/config-basic
- Codex 配置参考：https://developers.openai.com/codex/config
- Codex CLI 文档：https://developers.openai.com/codex/cli
