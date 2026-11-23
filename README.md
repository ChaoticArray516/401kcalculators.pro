# 401k Calculators

**Project your 401k balance year by year — privately, in your browser.**

Live site: [https://401kcalculators.pro](https://401kcalculators.pro)

401k Calculators is a privacy-first static site for projecting a 401(k) balance and modeling retirement withdrawals. Enter your current age, balance, salary, contribution rate, employer match and return assumptions; the calculator builds a year-by-year table and applies age-based IRS contribution limits. A separate retirement calculator turns a projected balance into inflation-adjusted withdrawals and shows the age at which the balance is depleted.

Every calculation runs locally in the browser. There is no account system, no backend database, no analytics and no third-party JavaScript.

## What's inside

- 401(k) projection with salary growth, employer match and age-based contribution limits
- Retirement withdrawal model with inflation, post-retirement return and depletion age
- Optional Social Security input, shown as separate income
- Methodology page with formulas, worked examples and IRS source references
- No sign-up, no cookies, no tracking, no uploaded calculator inputs
- Static HTML output with native ES modules; default results are present without JavaScript

## Tech stack

- Astro static site generation
- Native ES modules for the calculation engine
- Cloudflare Pages (Direct Upload)
- No client-side UI framework, no backend, no database

## Repository layout

```text
.
├── README.md
├── deploy/
│   └── cloudflare/          # Direct Upload configuration and runbook
└── workspace/               # Astro application
    ├── public/              # Static assets, favicon, OG image
    ├── scripts/             # Build, sitemap, OG and verification scripts
    ├── src/
    │   ├── components/
    │   ├── data/            # IRS limits and page metadata
    │   ├── engine/          # Calculation engine and fixtures
    │   ├── layouts/
    │   ├── pages/
    │   ├── styles/
    │   └── ui/
    ├── astro.config.mjs
    └── package.json
```

Internal planning prompts, scratch tests and traffic research are intentionally not tracked in this public repository.

## Local development

```bash
cd workspace
npm ci
npm run dev
```

Production build and verification:

```bash
npm run build
```

The build runs OG generation, fixture checks, Astro static generation, sitemap generation and the Batch 3a verification script.

## Deployment

The site is built locally and uploaded to Cloudflare Pages with Wrangler:

```bash
cd workspace
npm ci
npm run build
npx wrangler pages deploy dist --project-name=retirement-calc --branch=main
```

Credentials are read from environment variables and are never committed. See `deploy/cloudflare/README.md` for the deployment runbook.

## Disclaimer

Results are educational estimates, not financial, tax or investment advice. The calculator does not model taxes, penalties, vesting schedules or required minimum distributions. It is not affiliated with the IRS or any financial institution.
