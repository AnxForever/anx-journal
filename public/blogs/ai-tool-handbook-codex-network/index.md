# Codex 零基础教程（三）：用 CC Switch 配置 API Key

前两篇装好了客户端、注册了账号。这一篇解决网络问题——国内直连 OpenAI 大概率超时，需要用中转 API 或国内模型。

手动改 `config.toml` 太折腾，直接用 [CC Switch](https://github.com/farion1231/cc-switch) ——免费开源的工具，一键切换 API 渠道，不用手写配置文件。

本文核对时间：2026-08-07。

## CC Switch 是什么

一个本地运行的 API 渠道管理器，支持 Codex、Claude Code、Gemini CLI。添加中转站或国内模型的 API Key 后，点一下就能切换，配置自动写入 Codex，不用自己手改 `~/.codex/config.toml`。

关键特性：
- **协议自动转换**：国内模型只有 Chat Completions 接口，CC Switch 在本地自动转成 Codex 需要的 Responses API 格式
- **API Key 不落地**：真实 Key 只存在 CC Switch 本地，Codex 配置文件里只有本地代理地址，不会泄露
- **免费开源**：GitHub 80k+ star，注意别下到收费假冒版

## 第一步：下载安装

去 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 下载对应版本：

- **Windows**：`.msi` 安装包
- **macOS**：`.dmg` 或 `brew install --cask cc-switch`
- **Linux**：`.deb` / `.rpm` / `.AppImage`

安装后打开 CC Switch。

## 第二步：获取 API Key

你需要一个中转站或国内模型提供商的 API Key。常见渠道（排名不分先后）：

- **中转站**：ofox.ai、aisz.mom、YYLX.IO 等（支持支付宝，价格约为官方的 10%）
- **国内模型**：DeepSeek 开放平台、阿里百炼等，直接注册即可获取 Key

注意 API Key 一般只显示一次，创建后立刻复制保存。

## 第三步：在 CC Switch 添加渠道

1. 打开 CC Switch，顶部切换到 **Codex** 标签
2. 点 **+** 添加供应商
3. 填写：

| 字段 | 填什么 |
|------|--------|
| 名称 | 随便起，比如 `我的中转` |
| 适用工具 | Codex |
| Base URL | 中转站给的地址，如 `https://api.aisz.mom/v1` |
| API Key | 第二步拿到的 Key |
| 模型 | 和中转站支持的模型名一致 |

填完保存。

## 第四步：启用 + 启动

1. 在 CC Switch 主界面点 **Enable / 启用** 这个渠道
2. 确认 **本地路由** 开关已开启（设置 → 本地路由 → 总开关 + Codex 开关，v3.16.0 以上才有此功能）
3. 重启 Codex

打开 Codex 后输入 `/status`，确认 model 和 provider 是你在 CC Switch 里配的，说明生效了。

## 常见问题

### Codex 无响应 / 一直转圈

检查 CC Switch 的本地路由开关。设置 → 本地路由 → 确认总开关和 Codex 开关都开了。

### 配置不生效

切换渠道 → 点保存 → **重启 CC Switch → 重启 Codex**。顺序不能少。

### 报 403 / model not found

模型名和中转站支持的不一致。去中转站的模型列表确认名称，改过来。

### API Key 无效

检查 Key 是否复制完整、有没有多余空格。中转站的 Key 一般创建后只显示一次。

### 免费额度用完

Codex 免费额度有限，API Key 按量计费。中转站一般几块钱就能用很久。

## 参考

- CC Switch 下载：https://github.com/farion1231/cc-switch/releases
- Codex 官方配置文档：https://developers.openai.com/codex/config

> 有问题来抖音群聊交流：**248636512581**
