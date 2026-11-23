# Cloudflare Pages 部署配置

本目录记录 `401kcalculators.pro` 的 Cloudflare Pages Direct Upload 配置。机器可读版本见 `deploy.config.json`。

## 关键参数

| 项 | 值 |
|---|---|
| Pages 项目名 | `retirement-calc` |
| 生产分支 | `main` |
| pages.dev 地址 | `https://retirement-calc-bxq.pages.dev` |
| 自定义域 | `401kcalculators.pro`（Cloudflare zone 已创建，等待 Dynadot 修改 NS） |
| Cloudflare 名称服务器 | `conrad.ns.cloudflare.com`、`imani.ns.cloudflare.com` |
| Cloudflare Account ID | `c226e5607ca2ba37b6c3190ad07b3e18` |
| 构建命令 | `npm ci && npm run build` |
| 构建产物 | `workspace/dist/` |
| Token 权限 | Account → Cloudflare Pages → Edit |
| Token 环境变量 | `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` |

## 凭证

本项目的部署凭证保存在 `deploy/cloudflare/cloudflare-auth.conf`（已被同目录 `.gitignore` 排除，绝不提交）：

```dotenv
CLOUDFLARE_API_TOKEN=<你的 Pages Edit Token>
CLOUDFLARE_ACCOUNT_ID=c226e5607ca2ba37b6c3190ad07b3e18
```

也可以使用 `workspace/.env.local`（同样已排除）。模板见 `deploy/cloudflare/env.local.example`。不要将 Token 写入 `deploy.config.json`、README、源码或任何会进入版本库的文件。该凭证文件是明文，注意本机权限；如曾外泄，应在 Cloudflare 删除并重建 Token。

## 执行顺序

```bash
cd projs/retirement_calc/workspace

# 1. 安装依赖并构建（Node 22.23.4 为项目锁定版本）
npm ci
npm run build

# 2. 加载凭证到当前 shell（二选一；wrangler 从进程环境变量读取）
set -a
. ../deploy/cloudflare/cloudflare-auth.conf
# 或者：. ./.env.local
set +a

# 3. 首次创建 Pages 项目（仅一次；已存在则跳过）
npx wrangler pages project create retirement-calc --production-branch main

# 4. 部署生产分支
npx wrangler pages deploy dist --project-name=retirement-calc --branch=main
```

项目不在 Git 仓库内，因此必须显式传 `--branch=main`，否则可能部署到预览环境。

## 验证

部署完成后检查：

- `https://retirement-calc-bxq.pages.dev/`
- `https://retirement-calc-bxq.pages.dev/retirement-calculator/`
- `https://retirement-calc-bxq.pages.dev/methodology/`
- `https://retirement-calc-bxq.pages.dev/sitemap.xml`
- `https://retirement-calc-bxq.pages.dev/robots.txt`
- `https://retirement-calc-bxq.pages.dev/does-not-exist` 返回真实 404

## 自定义域 DNS（Dynadot）

Cloudflare Pages 要求先把 `401kcalculators.pro` 的 DNS 转移到 Cloudflare。Cloudflare 侧已创建 Free 计划 zone。

2026-11-24 完成状态：

- Dynadot 已保存 Cloudflare 名称服务器（`conrad.ns.cloudflare.com`、`imani.ns.cloudflare.com`）。
- `.pro` 注册局 RDAP 已返回 Cloudflare 名称服务器；本机 `nslookup` 被 DNS 代理拦截，不能作为判断依据。
- Pages 自定义域已添加并激活：
  - `401kcalculators.pro`，域名 ID `4bc78c58-8efa-4f61-afac-e85806b4b829`，状态 `active`；
  - `www.401kcalculators.pro`，域名 ID `ed50d8f9-7c1d-477d-a7c2-7ebb61ed0fc1`，状态 `active`。
- DNS 记录：
  - `401kcalculators.pro` CNAME → `retirement-calc-bxq.pages.dev`（已代理）
  - `www.401kcalculators.pro` CNAME → `retirement-calc-bxq.pages.dev`（已代理）
  - 原有 Dynadot 停放 A 记录（`185.53.179.149`，含 wildcard）已删除。
- HTTPS 已验证：apex 与 www 均返回 200；6 个路由、sitemap、robots、OG 正常；未知路径返回真实 404。

### 本机 DNS 注意事项

这台机器的 `nslookup` 和直接 `curl https://401kcalculators.pro/` 会被本地 DNS 代理劫持到本地 Caddy，返回 `410 Gone`（`Server: Caddy`）。这不是 Cloudflare 的响应。验证站点时使用 RDAP、DoH，或强制解析到真实 Cloudflare IP：

```bash
curl --resolve 401kcalculators.pro:443:172.67.152.92 https://401kcalculators.pro/
```

`www` 目前与 apex 同内容；如需统一权重，可在 Cloudflare 增加 `www` → apex 的 301 重定向规则。

在 Dynadot 的域名管理 → 名称服务器设置中：

- 删除：`ns1.dyna-ns.net`、`ns2.dyna-ns.net`
- 添加：`conrad.ns.cloudflare.com`、`imani.ns.cloudflare.com`
- 如果 Dynadot 启用了 DNSSEC，先关闭 DNSSEC，再修改名称服务器；Cloudflare 激活后可重新配置。

保存后等待 Cloudflare 检查生效（通常几分钟到 24 小时）。Cloudflare 页面上的「我已更新名称服务器」只触发检查，不会替你改 Dynadot。zone 激活后，回到 Pages 项目 → 自定义域 → 设置自定义域 → 输入 `401kcalculators.pro` 完成绑定。

Cloudflare 扫描到 3 条 A 记录并默认导入；在 Pages 自定义域绑定完成前，这些记录可能仍指向 Dynadot 的停放页。绑定 Pages 时以 Cloudflare 自动生成的记录为准，不要手工删除扫描导入的记录，除非已确认其用途。

## 边界

- 本项目使用 Direct Upload，之后不能切换为 Git 集成；要切换只能新建 Pages 项目。
- 自定义域、DNS、GSC 提交与 Git 操作均需单独批准。
- `deploy/cloudflare` 只放配置与说明，不放任何 secret。
