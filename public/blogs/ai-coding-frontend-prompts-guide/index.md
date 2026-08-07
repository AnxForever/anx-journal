# Cursor、Claude Code、Codex 前端提示词怎么写

有效的前端提示词不是一串“现代、简洁、高级”的形容词，而是一份足够明确的界面任务书。Cursor、Claude Code 和 Codex 都能生成前端代码，但最终质量取决于输入中是否包含可执行的设计约束。

## 前端提示词的六个部分

### 1. 页面目标

说明页面服务谁、用户要完成什么任务，以及最重要的操作是什么。模型需要先理解信息优先级。

### 2. UI 设计风格

选择明确的风格，并说明为什么适合当前产品。可以从 [StyleKit 风格库](https://stylekit.top/styles) 选择方向。

### 3. 设计 token

给出主色、中性色、字体、字号、间距、圆角、边框和阴影规则。不要让模型在每个组件中临时猜测。

### 4. 页面结构

列出导航、Hero、功能区、内容区、表单、CTA 和页脚等区域，并说明它们的顺序与关系。

### 5. 响应式与无障碍

要求移动端重排、键盘焦点、对比度、语义标签、触控尺寸和 reduced motion，而不是等页面完成后再补。

### 6. 验收条件

明确禁止横向溢出、无意义渐变、占位内容、不可用按钮和缺失状态。要求运行类型检查、构建或浏览器测试。

## 一个通用模板

```text
为[用户]设计并实现一个[页面类型]。
核心任务是[用户目标]，主要操作是[CTA]。
使用[UI 风格]，颜色、排版、间距和组件规则如下：[具体规则]。
页面包含：[区域清单]。
支持桌面端和移动端，并满足键盘操作、对比度和减少动画偏好。
不要使用：[禁止项]。
完成后检查响应式、交互状态、类型和构建。
```

Cursor 更适合结合当前项目文件持续修改；Claude Code 和 Codex 适合在仓库中执行多文件任务。无论使用哪个工具，都应该先让它读取现有设计系统，而不是重新发明视觉语言。

你也可以直接使用 [StyleKit UI 提示词库](https://stylekit.top/ui-prompts)、[Landing Page 提示词](https://stylekit.top/landing-page-prompts) 和 [Dashboard 提示词](https://stylekit.top/dashboard-prompts)。

## 延伸阅读

- [UI 设计风格大全](/blog/ui-design-styles-guide)
- [AI 生成网页为什么越来越像](/blog/why-ai-websites-look-the-same)
- [AI 前端设计与 StyleKit](/blog/ai-frontend-design-prompts-ui-styles)
