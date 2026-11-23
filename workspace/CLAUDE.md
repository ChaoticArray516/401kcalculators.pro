# retirement_calc — 编码代理入口

> 本文件是文档入口，不代表工程已初始化。Batch 3a 与轻量 UX 收尾已实现并通过构建与浏览器验证，等待用户裁定；不得未经批准进入 Batch 3b。

## 项目事实

- 项目：401k Calculators；域名：`401kcalculators.pro`。
- 技术栈：Astro 构建期静态生成 + 原生 ES 模块；用户 2026-11-23 终选。不使用 React/Vue/Svelte 或 `client:*` 指令。
- 市场：美国 / 英语；核心工具：401(k) 退休计算器。
- 首页主词：`401k calculator`；retirement 必须独立页，禁止同题互吃。
- YMYL：作者/审校、IRS 官方来源与日期、教育免责声明、真实更新时间、假设透明可改。

## 文档顺序

1. `prompts/dev_piplines/MASTER_SOP.md`
2. `prompts/dev_piplines/phase0/p1_handoff.md`
3. `prompts/dev_piplines/phase1/p2_handoff.md`
4. `prompts/dev_piplines/phase2/rendering_spec_v1.md`
5. `prompts/dev_piplines/phase2/seo_tech_spec.md`
6. 当前批次施工单与 `prompts/chat/chat_task_NN.md`

冲突裁决：双规范 > 施工单与 F 注记 > chat_task > handoff。

## 硬规则

- 不凭记忆改写逐字 Title/Description/H1/FAQ/Schema。
- 不偷建未来路由或渲染未上线链接；不偷装依赖。
- 不虚构计算结果、搜索数据、官方事实、构建或测试通过状态。
- 不承诺收益、不给予个体化投资/税务/法律建议；不采集 SSN/账户号。
- 未获用户批准前不部署、不提交 GSC、不注册域名、不发外链、不 git commit/push。

[全文完]
