# 更新日志 / Changelog

本项目所有值得记录的改动都会写在这里。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布 / Unreleased]

### 新增 Added
- **AI 助手接入真实大模型**：新增统一入口 `aiComplete()`，调用优先级为
  Google Gemini（配置免费 key 时）→ 免费无需注册的 Pollinations 接口 → 本地话题感知兜底，
  保证演示环境零配置也始终有响应。免费 Gemini Key 获取见 `app/services.jsx` 顶部 `AI_CONFIG` 注释。
- 应用入口 `index.html` 补充 favicon 链接。
- 新增本更新日志 `CHANGELOG.md`。

### 变更 Changed
- **前端整合为单一 React 单页应用**：`BestiePaw App.html` 重命名为 `index.html`，
  以 React 版作为唯一前端入口。
- 重写 `README.md`：更新技术栈说明、前端模块结构、路由说明与本地运行/演示模式指引。

### 修复 Fixed
- 修复 `DashboardPage` 的 React Hooks 顺序错误（`useLang()` 在早返回后才调用，导致控制台持续报错）。
- 修复宠物卡片网格 CSS：`minmax(260, 1fr)` → `minmax(260px, 1fr)`，此前缺省单位导致整组声明失效、卡片竖排。

### 移除 Removed
- 删除已被 React 版取代的静态多页前端：`login.html`、`register.html`、`pet-profile.html`、
  `onboarding-complete.html`，以及旧静态版的 `css/`、`js/`。
- 移除死代码：未被加载的 `app/tweaks-panel.jsx`、未被调用的 `matchRoute()` 工具函数。

---

## 历史 / Earlier

项目早期里程碑（见 git 历史）：

- 初版前端界面
- 后端功能实现（Express + Prisma：认证、宠物、健康、提醒、社区、统计）
- 项目框架构建
