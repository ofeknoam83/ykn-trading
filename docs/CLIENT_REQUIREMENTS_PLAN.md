# Client Requirements Plan

**Principles**: Real data only. No mocks. Autocomplete everywhere. Beautiful, cohesive UI. Full unit + integration tests.

---

## 1. Current State vs Required

| Area | Current | Required |
|------|---------|----------|
| Dashboard | Basic grid (SPY, QQQ, ^GSPC, ^IXIC, BTC, ETH), news stub | Global regions (Americas, Europe, Asia-Pacific), market hours, live news, drill-down charts |
| Pickers | AssetPicker (search only) | Asset, date range, interval, exchange, benchmark, options chain – all autocomplete, no free text |
| Backtest | Symbol + date range, SMA strategy | Strategy from builder, fees (maker/taker), benchmark, parallel comparison |
| Strategy Builder | None | Type selector → type-specific config → multi-asset → run |
| Scripts | None | Monaco editor, run on any market/asset/interval/date range |
| ML Pipeline | None | Build → Train → Test → Deploy, full flow |
| Agents | List + tools | Create/edit, workflow, prompts, tool picker, paper run, history |
| News | Stub | Real feeds: general, gov, exchange announcements |
| Jobs | Poll only | Progress bar, ETA, clear computation time |
| Signals | None | Connect providers, merge into strategies |
| Options | None | Chain picker, multi-leg builder (iron condor, straddle, etc.) |
| Paper Trading | Basic | Toggle, fees, full order flow |
| Testing | None | Unit (Vitest) + integration (Playwright/Cypress) |

---

## 2. Global Markets Dashboard

### Layout
- **Header**: Market hours (US, EU, Asia). Compact, not crowded.
- **Grid**: 3–4 columns, regional sections:
  - Americas: S&P 500, NASDAQ, Dow, TSX, Merval
  - Europe: DAX, FTSE 100, CAC 40
  - Asia-Pacific: Nikkei, Hang Seng, ASX 200
  - Crypto: BTC, ETH
- **Card**: Symbol, price, % change, mini sparkline. Click → full chart.
- **News**: Sidebar or bottom strip. Filter: All | Equities | Crypto | Macro | Gov/Exchange.
- **Data**: `GET /data/quote/{sym}`, WebSocket `/ws/prices`. `GET /news/feed?category=`.

---

## 3. Pickers (All Autocomplete – No Free Text)

| Picker | Source | Behavior |
|--------|--------|----------|
| **Asset** | `GET /data/search?q=&asset_class=&exchange=` | Debounce 300ms, multi-select, asset class icons |
| **Date range** | Presets: 1D, 1W, 1M, 3M, 1Y, 5Y + Custom date picker | No typing dates manually |
| **Interval** | Server: `GET /data/intervals` or config | 1m, 5m, 15m, 1h, 4h, 1d (per asset) |
| **Exchange** | `GET /data/exchanges` | NYSE, NASDAQ, Binance, etc. |
| **Benchmark** | `GET /backtest/benchmarks` | Preset + custom (user-created) |
| **Options chain** | `GET /data/options/chains?symbol=` | Underlying → expiry → strike/type |

**Asset classes**: Stocks, Crypto, Options, Derivatives, Bonds, ETFs, Commodities.

---

## 4. Strategy Builder – Type-Specific Configs (Real Depth)

### Flow
1. **Select type** (required first).
2. **Configure** type-specific params (schema-driven, real meaning).
3. **Add assets** (multi-asset, multi-class via pickers).
4. **Optional**: Benchmarks, fees, signal providers.
5. **Run** backtest or paper.

### Strategy Types and Configurable Parameters

#### Technical
- **Indicators**: SMA, EMA, RSI, MACD, Bollinger Bands
- **Lookback periods**: Per indicator (e.g. RSI 14, MACD 12/26/9)
- **Thresholds**: RSI oversold/overbought, MACD crossover
- **Rules**: Crossover (fast > slow), mean reversion, breakout
- **Backend**: Indicator computation → signal series

#### Fundamental
- **Metrics**: P/E, D/E, revenue growth, dividend yield
- **Filters**: Min/max per metric, sector, industry
- **Screening**: Rebalance frequency, top N by score
- **Backend**: `get_fundamentals` → filter → rank

#### ML
- **Model**: XGBoost, LightGBM, RandomForest, PyTorch
- **Features**: Multi-select from `GET /ml/features` (OHLCV-derived, fundamentals)
- **Target**: Next return, binary up/down, multi-class
- **Train/test split**: Date range or ratio
- **Hyperparams**: Learning rate, depth, etc. (schema per model)
- **Backend**: ML pipeline

#### LLM
- **Expert**: Screener, DCF, Risk, Earnings, Portfolio, Patterns, Macro
- **Prompt template**: System + user placeholders
- **Context window**: What to inject (portfolio, news, etc.)
- **Backend**: LLM orchestrator

#### Arbitrage
- **Legs**: Asset A, Asset B (from pickers)
- **Spread**: Entry threshold, exit threshold
- **Backend**: Multi-leg execution

#### Statistical Arbitrage
- **Pairs**: Cointegration test, select pairs
- **Z-score**: Entry/exit bands, halflife
- **Backend**: Pairs trading engine

#### Delta Neutral
- **Underlying**: Stock/ETF
- **Options legs**: Calls, puts, quantities
- **Target delta**: 0
- **Hedge frequency**: Daily, on threshold
- **Backend**: Options strategy engine

#### Options Spread
- **Type**: Vertical, calendar, iron condor, straddle, strangle
- **Strikes, expiries**: From chain picker
- **Backend**: Options engine

#### Momentum
- **Lookback**: 20, 60, 120 days
- **Rebalance**: Daily, weekly
- **Ranking**: By return, volatility-adjusted
- **Top N**: Hold top N, equal or cap-weighted

#### Mean Reversion
- **Lookback**: 20, 60 days
- **Z-score**: Entry ±2, exit 0
- **Bands**: Bollinger, ATR-based

---

## 5. Trading Scripts

- **Editor**: Monaco (VS Code in browser). Python or DSL.
- **Inputs**: Assets (multi-picker), date range, interval, mode (backtest | paper).
- **Output**: Signals (buy/sell/weight). Server executes.
- **API**: `POST /scripts/run` → job_id. Poll `GET /jobs/{id}`.
- **Run scope**: Any market, asset, instrument, date range, interval – all from pickers.

---

## 6. Backtesting

- **Single**: Strategy + assets + dates + fees + benchmark.
- **Fees**: `maker_fee_bps`, `taker_fee_bps` – apply to backtest and paper.
- **Benchmark**: Preset (SPY, QQQ) or custom (user: name + symbols + weights).
- **Parallel**: `POST /backtest/run-batch` – N strategies, same params.
- **Result**: Equity curve vs benchmark, metrics table, trades. Comparison view for batch.

---

## 7. ML Pipeline (End-to-End)

- **Build**: Model type, features (from API), target, data config.
- **Train**: `POST /ml/train` → job_id. Progress + ETA.
- **Test**: `POST /ml/test` with model_id, test date range.
- **Deploy**: `POST /ml/deploy`. Strategy type "ML" references deployed model.
- **UI**: Wizard or tabs for each step.

---

## 8. Background Jobs – Computation Time

- **Poll**: `GET /jobs/{id}` every 1–2s.
- **Response**: `status`, `progress` (0–100), `eta_seconds`, `result`.
- **UI**: Progress bar, "Estimated: ~2 min remaining", spinner.
- **Use cases**: Backtest, ML train, scripts, agent runs, parallel backtest.

---

## 9. News Feeds

- **Sources**: General (NewsAPI, Alpaca, Benzinga), government (SEC EDGAR, Fed, Treasury), exchanges (NYSE, NASDAQ announcements).
- **API**: `GET /news/feed?category=`, `GET /news/announcements`.
- **Ad-hoc trading**: "Trade AAPL" from headline → pre-filled order form.
- **Scraping**: Server-side only. Client consumes.

---

## 10. Signal Providers

- **CRUD**: `GET /signals/providers`, add/edit/remove.
- **Config**: URL, auth, parse rules (map to our signal format).
- **Strategy merge**: In builder, "Add signal" → pick provider, combine rule (AND, OR, weight blend).
- **Backend**: `/signals/providers`, `/signals/fetch`.

---

## 11. Options & Complex Positions

- **Chain**: `GET /data/options/chains?symbol=` → expiry, strike, type.
- **Multi-leg**: Add leg, select option, quantity, buy/sell.
- **Strategies**: Iron condor, straddle, strangle, calendar, delta neutral.
- **Greeks**: Display when available.

---

## 12. Paper Trading

- **Toggle**: Paper | Live.
- **Fees**: Same maker/taker as backtest.
- **Portfolio**: Paper positions, order form with paper/live badge.
- **Backend**: PaperBroker, AlpacaBroker (paper mode).

---

## 13. UX/UI Guidelines

- **Layout**: Grid, 3–4 columns. Strategy builder: config left, preview right.
- **Theme**: Dark. Accent for actions. Green/red PnL.
- **Typography**: Clear hierarchy. Monospace for numbers.
- **Loading**: Skeleton loaders, progress bars. No empty gray boxes.
- **Errors**: Inline validation, toast for API errors, retry.
- **Accessibility**: Keyboard nav for pickers, ARIA.

---

## 14. Testing

### Unit (Vitest)
- Pickers: selection, API call (mocked fetch)
- Forms: validation
- Hooks: useJobs, useQuotes (mocked)
- Utils: date, number formatting

### Integration (Playwright or Cypress)
- Flow: Dashboard → indices load
- Flow: Backtest → strategy → run → result
- Flow: ML train → test → deploy
- Flow: Agent create → run paper → history
- **Real backend** or testcontainers. No mock server for integration.

### Contract
- OpenAPI export from backend.
- Client types from OpenAPI.
- Contract tests: client expectations vs server schema.

---

## 15. Backend Gaps (Server Must Provide)

| Area | Endpoints / Components |
|------|------------------------|
| Data | `GET /data/search`, `/exchanges`, `/options/chains`, `/markets/status`, `/intervals` |
| News | `GET /news/feed`, `/news/announcements`, `/news/sources` |
| Benchmarks | `GET/POST /backtest/benchmarks`, custom CRUD |
| Jobs | `GET /jobs/{id}` with `progress`, `eta_seconds` |
| Strategies | Schema registry, type-specific executors |
| Scripts | `POST /scripts/run`, sandboxed execution |
| ML | `GET /ml/features`, `POST /ml/train`, `/ml/test`, `/ml/deploy` |
| Signals | `GET/POST /signals/providers`, `/signals/fetch` |
| Fees | Maker/taker in backtest + paper broker |
| Options | Options chain provider, multi-leg engine |

---

## 16. Implementation Order (Client)

1. **Pickers**: Asset (multi), DateRange, Interval, Exchange, Benchmark → all wired to APIs
2. **Dashboard**: Regional layout, more indices, market hours, sparklines, news categories
3. **Job progress**: `useJobs` with ETA, `JobProgress` component
4. **Strategy builder**: Type selector, Technical form (first), then others
5. **Backtest UI**: Strategy picker, fees, benchmark, results, comparison view
6. **Parallel backtest**: Batch run, side-by-side comparison
7. **ML pipeline**: Build → Train → Test → Deploy pages
8. **Scripts**: Monaco editor, run config, results
9. **Options**: Chain picker, multi-leg builder
10. **Agents**: Full builder (workflow, prompts, tools, run, history)
11. **Signals**: Provider list, config, strategy merge
12. **News**: Categories, ad-hoc trade button
13. **Paper trading**: Toggle, fees, full order flow
14. **Polish**: Loading, errors, responsiveness
15. **Tests**: Unit, integration, contract
