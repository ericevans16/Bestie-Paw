# ADR 0001：前端引入构建工具链与 TypeScript（Vite + TS + Vitest + 共享类型）

- **状态**: Proposed（待架构师/Owner 批准）
- **日期**: 2026-06-05
- **决策者**: 架构师（Claude Code）+ Owner
- **相关**: COORDINATION §2（引入构建工具/monorepo 需先立 ADR）

## 背景 Context

后端在 2026-06 已完成质量基建：全模块集成测试、容器化 CI、ESLint、分支保护、契约统一（见 TASKS TASK-001~008）。

**前端则几乎零工程化**：
- `index.html` + `app/*.jsx`，**Babel Standalone 浏览器内编译**，无打包、无构建步骤。
- **无类型检查、无 lint、无测试**。
- 组件经 `fetch` 加载，依赖运行时编译。

这种失衡已多次产生真实成本：
- React Hooks 顺序 bug（`DashboardPage`，靠肉眼+控制台才发现）。
- 前后端**枚举大小写**靠手工适配层转换。
- **分页信封 records/posts→items** 迁移要在前端适配层手工对齐（TASK-004）。
- CSS 单位缺失（`minmax(260,1fr)`）等只能运行时暴露。

根因：前端没有类型、没有测试、没有与后端共享的契约类型，所有错误都推迟到运行时/演示时才暴露。

## 决策 Decision

**为前端引入正式工具链，增量迁移（不重写）：**

1. **Vite + TypeScript**：用 Vite 做开发/构建，逐步把 `.jsx` 迁移为 `.tsx`（先开 `allowJs`，按文件迁移，不一次性重写）。移除 Babel-standalone 的浏览器内编译。
2. **Vitest + Testing Library**：为关键流程（登录/注册、宠物登记、健康记录、社区）加组件/集成测试，纳入 CI。
3. **`packages/shared` 共享类型**：把后端的契约类型（枚举、分页信封、响应信封、DTO）抽到共享包，前后端共同引用，**从根上消灭枚举大小写 / records-items 这类漂移**。这一步把仓库推向 monorepo（pnpm workspace）——属本 ADR 授权范围。
4. **CI 扩展**：前端 `tsc`/`vitest`/`eslint` 纳入 `build-and-test`（或新增 frontend job），与后端同等门禁。

**时机：现在启动（下一阶段）。** 理由：
- 后端已稳，是修桥的好时机（不必边改地基边改楼）。
- 前端面只有 8 个 jsx 文件，**迁移成本随功能增长**——越晚越贵。
- 痛点已反复出现，TS+测试+共享类型正好根治。

## 后果 Consequences

**正面**：
- 编译期类型安全，消灭一整类运行时 bug。
- 前端有自动化测试 + CI 门禁，与后端对齐。
- 共享类型消除前后端契约漂移。
- 生产可用的构建产物（打包/摇树/压缩），优于浏览器内编译。

**代价/风险**：
- 引入构建步骤；贡献者需 Node 工具链（不再是"开个 http server 就能跑"）。
- 迁移有工作量（虽增量）；演示模式（demo mode）与无构建即跑的便利会改变。
- monorepo 化需调整目录与 CI（一次性成本）。

**迁移计划（分阶段，各自独立可交付、CI 兜底）**：
1. 引入 Vite + TS 脚手架，`allowJs`，现有 jsx 原样跑通；加前端 lint + `tsc`。
2. 抽 `packages/shared` 类型，前端 API 层改用共享类型，删手工大小写/信封适配。
3. 逐文件 `.jsx → .tsx`；为关键页加 Vitest 测试。
4. 前端检查纳入 CI 门禁；评估是否保留 demo mode。

## 备选方案 Alternatives

- **A. 维持 Babel-standalone（否决）**：零构建、迭代快，但无法规模化，质量风险持续累积。
- **B. 直接上 Next.js / 全量重写（否决）**：过重，当前不需要 SSR；重写风险高、收益不匹配。
- **C. 推迟到上线前再做（可作为回退）**：若产品仍在重度功能探索/未达 PMF，可暂缓，但须设硬触发点（准备生产上线 / 第二人改前端 / 下次契约-类型 bug 咬人），且期间**克制新增 .jsx**。

## 待办（批准后）

批准本 ADR 后，拆分为实施任务（TASK-009+）：①Vite+TS 脚手架；②`packages/shared` 类型；③逐文件迁移+Vitest；④前端 CI 门禁。**未批准前不动前端架构**（COORDINATION §2）。
