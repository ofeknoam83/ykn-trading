# Implementation To-Dos (200+)

Each to-do has a **Planning** stage (design, decide, document) before **Execution**. Complete planning before starting execution.

---

## PHASE 1: Server Foundation

### S001 | Backend Project Scaffold
- **Planning**: Define Python version (3.11), project layout, dependency groups. Decide on tooling: uv/poetry/pip.
- **Execution**: Create `backend/` dir, `pyproject.toml`, `requirements.txt`, `app/__init__.py`, `app/main.py` minimal FastAPI app.

### S002 | Environment & Config
- **Planning**: List all config vars (DB URL, Redis URL, API keys, env names). Document in `.env.example`.
- **Execution**: Implement `app/config.py` with Pydantic Settings, load from env. Create `.env.example` with placeholders.

### S003 | FastAPI App Bootstrap
- **Planning**: Define lifespan (startup/shutdown), CORS, router mounting. Plan health check route.
- **Execution**: Wire `main.py` lifespan, CORS middleware, `GET /health` route. Mount v1 router placeholder.

### S004 | Docker Compose - Database
- **Planning**: Choose TimescaleDB image, PostgreSQL version. Define ports, volumes, env.
- **Execution**: Add `timescaledb` service to `docker-compose.yml` with TimescaleDB extension enabled.

### S005 | Docker Compose - Redis
- **Planning**: Define Redis port, persistence, memory limit.
- **Execution**: Add `redis` service to `docker-compose.yml`. Document startup order.

### S006 | Database Connection - Async Engine
- **Planning**: Choose asyncpg driver, connection pool settings. Review SQLAlchemy 2.0 async patterns.
- **Execution**: Implement `app/core/database.py` with `create_async_engine`, `async_sessionmaker`, `get_db` dependency.

### S007 | Redis Connection
- **Planning**: Choose redis client (redis-py async). Define key prefixes, default TTL.
- **Execution**: Implement `app/core/redis.py` with async Redis client, `get_redis` dependency.

### S008 | SQLAlchemy Base & Declarative
- **Planning**: Define naming convention for tables/columns. Plan model organization.
- **Execution**: Create `app/db/base.py` with declarative base. Create `app/db/__init__.py`.

### S009 | Alembic Init
- **Planning**: Configure Alembic for async, env.py script location.
- **Execution**: Run `alembic init`, update `alembic.ini` and `env.py` for async + asyncpg.

### S010 | OHLCV Model
- **Planning**: Design schema: symbol, open, high, low, close, volume, interval, bucket (timestamp). Plan hypertable partitioning.
- **Execution**: Create `app/db/models/ohlcv.py`. Add TimescaleDB hypertable table option.

### S011 | OHLCV Migration
- **Planning**: Review TimescaleDB migration syntax. Plan chunk interval.
- **Execution**: Create Alembic migration for `ohlcv` table, `create_hypertable` on bucket column.

### S012 | Fundamentals Model
- **Planning**: Design schema: symbol, pe_ratio, debt_equity, revenue_growth, etc. Plan hypertable or regular table.
- **Execution**: Create `app/db/models/fundamentals.py`. Migration.

### S013 | Portfolio Snapshots Model
- **Planning**: Design positions JSONB structure. Single-user, no user_id.
- **Execution**: Create `app/db/models/portfolio_snapshots.py`. Migration.

### S014 | Backtest Runs Model
- **Planning**: Design schema: strategy_id, params JSONB, metrics JSONB, timestamp.
- **Execution**: Create `app/db/models/backtest_runs.py`. Migration.

### S015 | ML Models Model
- **Planning**: Design schema: model_id, version, type, path, created_at. Plan file storage vs DB.
- **Execution**: Create `app/db/models/ml_models.py`. Migration.

### S016 | LLM Sessions Model
- **Planning**: Design schema: session_id, expert_type, inputs, outputs, timestamp.
- **Execution**: Create `app/db/models/llm_sessions.py`. Migration.

### S017 | Agents Model
- **Planning**: Design schema: name, model, system_prompt, workflow JSONB, enabled_tools[]. Plan workflow structure.
- **Execution**: Create `app/db/models/agents.py`. Migration.

### S018 | Agent Runs Model
- **Planning**: Design schema: agent_id, mode, started_at, ended_at, decisions JSONB, orders JSONB.
- **Execution**: Create `app/db/models/agent_runs.py`. Migration.

### S019 | Data Provider Protocol
- **Planning**: Finalize `DataProvider` Protocol. Define `AssetClass` enum, return types (Quote, Fundamentals, etc.).
- **Execution**: Create `app/providers/base.py` with Protocol, `AssetClass`, abstract method signatures.

### S020 | Pydantic Data Models
- **Planning**: Define Quote, Fundamentals, EarningsReport, InsiderTrade, SymbolInfo. Match provider output shape.
- **Execution**: Create `app/models/data.py` with all Pydantic schemas.

### S021 | Alpaca Provider - Init
- **Planning**: Review alpaca-trade-api async/sync. Plan credential loading. Choose data vs trade API.
- **Execution**: Create `app/providers/alpaca.py`, init Alpaca client, implement `get_quote`.

### S022 | Alpaca Provider - Historical
- **Planning**: Map Alpaca bars API to our date range, interval. Plan DataFrame normalization.
- **Execution**: Implement `get_historical` in AlpacaProvider. Return normalized pandas DataFrame.

### S023 | YFinance Provider - Init
- **Planning**: Review yfinance API. Plan `asyncio.to_thread` wrapping for sync calls.
- **Execution**: Create `app/providers/stocks.py`, implement `get_quote` (wrapped in to_thread).

### S024 | YFinance Provider - Fundamentals
- **Planning**: Map yfinance info dict to our Fundamentals schema. Handle missing fields.
- **Execution**: Implement `get_fundamentals` in YFinanceProvider.

### S025 | YFinance Provider - Earnings
- **Planning**: Map yfinance earnings data to EarningsReport list. Plan quarters param.
- **Execution**: Implement `get_earnings_history` in YFinanceProvider.

### S026 | YFinance Provider - Insider & Options
- **Planning**: Map insider trades, options IV. Handle unsupported symbols gracefully.
- **Execution**: Implement `get_insider_trades`, `get_options_iv` in YFinanceProvider.

### S027 | CCXT Provider - Init
- **Planning**: Choose exchange (Binance). Plan symbol format (BTC/USDT). Review CCXT async.
- **Execution**: Create `app/providers/crypto.py`, implement `get_quote`, `get_historical`.

### S028 | Provider Factory
- **Planning**: Define selection rules: asset_class → provider. Config-driven mapping.
- **Execution**: Create `app/providers/factory.py`. `get_provider(asset_class)` returns correct provider.

### S029 | Broker Protocol
- **Planning**: Finalize Broker Protocol. Define Position, Order, OrderRequest, Account schemas.
- **Execution**: Create `app/brokers/base.py` with Protocol. Create `app/models/broker.py` schemas.

### S030 | Paper Broker - Storage
- **Planning**: Choose storage: Redis vs SQLite. Plan key structure for positions, orders, account.
- **Execution**: Create `app/brokers/paper_broker.py` with Redis-backed state. Implement `get_positions`, `get_account`.

### S031 | Paper Broker - Orders
- **Planning**: Plan order fill simulation (market = last price). Plan fee application.
- **Execution**: Implement `place_order`, `cancel_order` in PaperBroker. Simulate fills.

### S032 | Alpaca Broker - Init
- **Planning**: Review Alpaca Orders API. Plan paper vs live URL switching.
- **Execution**: Create `app/brokers/alpaca_broker.py`, init client. Implement `get_positions`, `get_account`.

### S033 | Alpaca Broker - Orders
- **Planning**: Map OrderRequest to Alpaca order format. Plan order type support (market, limit).
- **Execution**: Implement `place_order`, `cancel_order`, `get_orders` in AlpacaBroker.

### S034 | Data API - Quote
- **Planning**: Define route `GET /data/quote/{symbol}`. Query params: asset_class. Plan cache key.
- **Execution**: Create `app/api/v1/data.py`. Implement quote endpoint with provider factory + Redis cache.

### S035 | Data API - Historical
- **Planning**: Define route `GET /data/historical`. Params: symbol, start, end, interval. Plan cache TTL.
- **Execution**: Implement historical endpoint. Return JSON or CSV.

### S036 | Data API - Fundamentals
- **Planning**: Define route `GET /data/fundamentals/{symbol}`.
- **Execution**: Implement fundamentals endpoint. Use YFinance/Alpaca per asset class.

### S037 | Data API - Earnings
- **Planning**: Define route `GET /data/earnings/{symbol}`. Query param: quarters.
- **Execution**: Implement earnings endpoint.

### S038 | Data API - Search
- **Planning**: Define `GET /data/search?q=&asset_class=&exchange=`. Plan provider delegation.
- **Execution**: Implement search endpoint. Aggregate from providers. Return SymbolInfo[].

### S039 | Data API - Exchanges
- **Planning**: Define static list or DB of exchanges. Map to providers.
- **Execution**: Implement `GET /data/exchanges` endpoint.

### S040 | Portfolio API - Positions
- **Planning**: Define broker selection (config or query param). Plan Paper vs Alpaca.
- **Execution**: Create `app/api/v1/portfolio.py`. Implement `GET /portfolio/positions`.

### S041 | Portfolio API - Account
- **Planning**: Define account schema (balance, equity, etc.).
- **Execution**: Implement `GET /portfolio/account`.

### S042 | Portfolio API - Orders
- **Planning**: Define `POST /portfolio/orders` body. Validate OrderRequest.
- **Execution**: Implement place order endpoint. Implement `GET /portfolio/orders`.

---

## PHASE 2: Backtesting & Jobs

### S043 | Job Store Schema
- **Planning**: Design job storage: Redis keys or DB table. Status: pending, running, completed, failed.
- **Execution**: Create `app/core/jobs.py` or `app/db/models/jobs.py`. Implement job create, update, get.

### S044 | Job Queue - In-Process
- **Planning**: Choose MVP: asyncio Task vs threading. Plan job ID generation.
- **Execution**: Implement job runner. `POST` creates job, runs in background, stores result.

### S045 | Jobs API
- **Planning**: Define `GET /jobs/{id}` response: status, progress?, eta_seconds?, result?.
- **Execution**: Implement `GET /jobs/{id}` endpoint.

### S046 | VectorBT Engine - Setup
- **Planning**: Review vectorbt API. Plan input: DataFrame columns, signal format.
- **Execution**: Create `app/backtest/vectorbt_engine.py`. Accept OHLCV DataFrame + signals Series.

### S047 | VectorBT Engine - Fees
- **Planning**: Plan fee model: fixed per trade vs bps. Maker vs taker.
- **Execution**: Add fee config to engine. Apply in backtest run.

### S048 | Analytics Module
- **Planning**: Define metrics: Sharpe, Sortino, Calmar, max drawdown, profit factor. Plan calculation.
- **Execution**: Create `app/backtest/analytics.py`. Implement each metric from equity curve + trades.

### S049 | Monte Carlo Module
- **Planning**: Review bootstrap method. Plan resampling of returns.
- **Execution**: Create `app/backtest/monte_carlo.py`. Return confidence intervals.

### S050 | Walk-Forward Module
- **Planning**: Plan rolling window: train period, test period, step size.
- **Execution**: Create `app/backtest/walk_forward.py`. Implement rolling optimization.

### S051 | Backtest API - Run
- **Planning**: Define `POST /backtest/run` body: strategy config, assets, date_range, interval, fees.
- **Execution**: Create `app/api/v1/backtest.py`. Implement run endpoint. Return job_id. Run as job.

### S052 | Backtest API - Get Result
- **Planning**: Define response: metrics, equity curve, trades.
- **Execution**: Implement `GET /backtest/{run_id}`. Fetch from job result or DB.

### S053 | Benchmarks - Schema
- **Planning**: Design benchmark: name, symbols[], weights[]. Preset vs custom.
- **Execution**: Create `app/db/models/benchmarks.py`. Migration.

### S054 | Benchmarks API
- **Planning**: Define `GET /backtest/benchmarks`, `POST /backtest/benchmarks`.
- **Execution**: Implement CRUD for benchmarks.

### S055 | Backtest - Batch Run
- **Planning**: Plan batch job: N strategies, same params. Aggregate results.
- **Execution**: Implement `POST /backtest/run-batch`. Return combined job or sub-jobs.

---

## PHASE 3: LLM & Agents

### S056 | LLM Client - Anthropic
- **Planning**: Review Anthropic messages API, tool use format. Plan error handling.
- **Execution**: Create `app/llm/clients.py`. Implement Claude client with tool-calling.

### S057 | LLM Client - OpenAI
- **Planning**: Review OpenAI chat API, function calling format.
- **Execution**: Add OpenAI client. Same interface as Anthropic.

### S058 | LLM Tools - get_quote
- **Planning**: Define tool schema for LLM. Map to provider call.
- **Execution**: Create `app/llm/tools.py`. Implement get_quote tool, register schema.

### S059 | LLM Tools - get_fundamentals
- **Planning**: Define tool schema. Map to YFinance.
- **Execution**: Implement get_fundamentals tool.

### S060 | LLM Tools - get_earnings_history
- **Execution**: Implement get_earnings_history tool.

### S061 | LLM Tools - get_historical
- **Execution**: Implement get_historical tool.

### S062 | LLM Tools - get_portfolio
- **Planning**: Inject broker dependency. Plan which broker (config).
- **Execution**: Implement get_portfolio tool.

### S063 | LLM Tools - get_sector_averages
- **Planning**: Plan data source. Cache or compute from fundamentals.
- **Execution**: Implement get_sector_averages tool.

### S064 | LLM Tools - get_options_implied_move
- **Execution**: Implement get_options_implied_move tool.

### S065 | LLM Tools - search_stocks
- **Planning**: Map criteria to provider search. Plan criteria schema.
- **Execution**: Implement search_stocks tool.

### S066 | LLM Tools - place_order (Agent)
- **Planning**: Define tool schema. Route to PaperBroker or AlpacaBroker per agent mode.
- **Execution**: Implement place_order, cancel_order tools for agents.

### S067 | LLM Orchestrator
- **Planning**: Plan flow: load expert prompt → inject tools → call LLM → handle tool calls loop.
- **Execution**: Create `app/llm/orchestrator.py`. Implement run_expert(expert_slug, user_input).

### S068 | Goldman Screener Expert
- **Planning**: Write system prompt. Define expected tool usage.
- **Execution**: Create `app/llm/experts/goldman_screener.py`. Add prompt, register expert.

### S069 | Morgan DCF Expert
- **Execution**: Create morgan_dcf.py with prompt and registration.

### S070 | Bridgewater Risk Expert
- **Execution**: Create bridgewater_risk.py with prompt and registration.

### S071 | JPMorgan Earnings Expert
- **Execution**: Create jpmorgan_earnings.py with prompt and registration.

### S072 | BlackRock Portfolio Expert
- **Execution**: Create blackrock_portfolio.py with prompt and registration.

### S073 | Renaissance Patterns Expert
- **Execution**: Create renaissance_patterns.py with prompt and registration.

### S074 | McKinsey Macro Expert
- **Execution**: Create mckinsey_macro.py with prompt and registration.

### S075 | LLM API - Endpoints
- **Planning**: Define route pattern `POST /llm/{expert_slug}`. Body schema per expert.
- **Execution**: Create `app/api/v1/llm.py`. Implement all 7 expert endpoints.

### S076 | Agent Executor
- **Planning**: Plan executor loop: load workflow → for each step → inject context → LLM with tools → execute tool calls.
- **Execution**: Create `app/llm/agent_executor.py`. Implement run_agent(agent_id, mode).

### S077 | Agent Workflow Engine
- **Planning**: Define workflow JSON schema: steps[], triggers, branching.
- **Execution**: Implement workflow interpreter. Drive executor steps.

### S078 | Agents API - CRUD
- **Planning**: Define agent create/update schema.
- **Execution**: Create `app/api/v1/agents.py`. Implement GET/POST/PUT/DELETE /agents.

### S079 | Agents API - Tools List
- **Execution**: Implement `GET /agents/tools` with schema for each tool.

### S080 | Agents API - Run
- **Planning**: Run as background job. Return job_id.
- **Execution**: Implement `POST /agents/{id}/run`. Start agent executor as job.

### S081 | Agents API - Run History
- **Execution**: Implement `GET /agents/{id}/runs`. List agent_runs for agent.

---

## PHASE 4: ML, WebSocket, News, Extensions

### S082 | ML Model Registry
- **Planning**: Plan storage: filesystem path, S3, or DB blob.
- **Execution**: Create `app/ml/registry.py`. Save/load model by id, version.

### S083 | ML Features API
- **Planning**: Define feature list: OHLCV-derived, fundamentals. Plan schema.
- **Execution**: Implement `GET /ml/features`. Return available features with descriptions.

### S084 | XGBoost Trainer
- **Planning**: Define train config: features, target, params.
- **Execution**: Create `app/ml/trainers/xgboost_trainer.py`. Train, save model, return metrics.

### S085 | ML Train API
- **Planning**: Define `POST /ml/train` body.
- **Execution**: Implement train endpoint. Run as job. Return job_id.

### S086 | ML Train Status API
- **Execution**: Implement `GET /ml/train/{job_id}`. Return status, metrics.

### S087 | ML Predict API
- **Execution**: Implement `POST /ml/predict`. Load model, run inference.

### S088 | ML Test API
- **Planning**: Define out-of-sample test flow.
- **Execution**: Implement `POST /ml/test` with model_id, test date range.

### S089 | ML Deploy API
- **Planning**: Define "deployed" state. How strategies reference deployed model.
- **Execution**: Implement `POST /ml/deploy`. Update model status in DB.

### S090 | ML Models List API
- **Execution**: Implement `GET /ml/models`. List with versions, deployment status.

### S091 | WebSocket - Price Stream
- **Planning**: Plan Alpaca stream vs polling. Subscriber model.
- **Execution**: Create `app/api/websocket.py`. Implement `WS /ws/prices`. Subscribe symbols, stream quotes.

### S092 | Health - Deep Checks
- **Execution**: Implement `GET /health/db`, `GET /health/redis`. Test connections.

### S093 | News - Feed Aggregator
- **Planning**: Choose news source (Alpaca news, NewsAPI, etc.). Plan normalization.
- **Execution**: Create `app/services/news.py`. Aggregate headlines. Cache.

### S094 | News API
- **Execution**: Implement `GET /news/feed`, `GET /news/announcements`, `GET /news/sources`.

### S095 | Options Chain - Provider
- **Planning**: Alpaca/Polygon options API. Plan chain structure.
- **Execution**: Add `get_options_chain` to provider or new endpoint. Implement in Alpaca.

### S096 | Options Chain API
- **Execution**: Implement `GET /data/options/chains?symbol=`.

### S097 | Markets Status API
- **Planning**: Define exchange hours. US, EU, Asia. Plan response format.
- **Execution**: Implement `GET /data/markets/status`.

### S098 | Script Execution - Sandbox
- **Planning**: Plan script execution: restricted Python? DSL? Security.
- **Execution**: Create `app/scripts/runner.py`. Sandboxed script execution.

### S099 | Scripts API
- **Execution**: Implement `POST /scripts/run`. Body: script, assets, date_range, mode. Run as job.

### S100 | Signals - Provider Model
- **Planning**: Design signal provider config: URL, auth, parse rules.
- **Execution**: Create `app/db/models/signal_providers.py`. Migration.

### S101 | Signals API
- **Execution**: Implement `GET /signals/providers` CRUD. `POST /signals/fetch`.

### S102 | Strategy Schema Registry
- **Planning**: Define schema per strategy type. Technical, Fundamental, etc.
- **Execution**: Create `app/strategies/schemas.py`. Register schemas per type.

### S103 | Strategy Executors (Technical)
- **Planning**: Plan technical strategy: indicators → signals.
- **Execution**: Create `app/strategies/technical.py`. Generate signals from config.

### S104 | Render Deployment Config
- **Planning**: Define Render blueprint. Env vars, build command, start command.
- **Execution**: Create `render.yaml` or document Render setup. Deploy checklist.

---

## PHASE 5: Client Foundation

### C001 | Frontend Scaffold
- **Planning**: Choose Vite + React + TypeScript. Plan folder structure.
- **Execution**: Create `frontend/` with `npm create vite@latest`. Install React Router, base config.

### C002 | API Client Base
- **Planning**: Choose fetch vs axios. Plan base URL, auth headers (if any), error handling.
- **Execution**: Create `src/api/client.ts`. Base request function, error handling.

### C003 | OpenAPI Types
- **Planning**: Plan type generation from OpenAPI (or manual initially).
- **Execution**: Add script to generate types from backend OpenAPI. Or create `src/types/api.ts` manually.

### C004 | WebSocket Hook
- **Planning**: Plan WS URL, reconnection, message parsing.
- **Execution**: Create `src/hooks/useWebSocket.ts`.

### C005 | Route Structure
- **Planning**: Define routes: /, /dashboard, /strategies, /backtest, /agents, /ml, etc.
- **Execution**: Configure React Router in App.tsx. Create route components placeholder.

### C006 | Theme & Design Tokens
- **Planning**: Define colors, spacing, typography. Dark theme.
- **Execution**: Create CSS variables or theme file. Base styles.

### C007 | Layout Component
- **Planning**: Plan app shell: header, sidebar, main content area.
- **Execution**: Create `src/components/Layout.tsx`. Responsive layout.

### C008 | Asset Picker - API
- **Planning**: Map `GET /data/search` to hook. Plan debounce, caching.
- **Execution**: Create `src/api/data.ts`. `searchSymbols(query, assetClass)`.

### C009 | Asset Picker - Component
- **Planning**: Plan UX: input, dropdown, multi-select, asset class icons.
- **Execution**: Create `src/components/pickers/AssetPicker.tsx`. Debounced search, selection.

### C010 | Date Range Picker
- **Planning**: Plan presets (1D, 1W, 1M, etc.) + custom. Component library or custom.
- **Execution**: Create `src/components/pickers/DateRangePicker.tsx`.

### C011 | Interval Picker
- **Execution**: Create `src/components/pickers/IntervalPicker.tsx`. Options: 1m, 5m, 15m, 1h, 4h, 1d.

### C012 | Exchange Picker
- **Planning**: Map `GET /data/exchanges`.
- **Execution**: Create `src/components/pickers/ExchangePicker.tsx`.

### C013 | Benchmark Picker
- **Planning**: Map `GET /backtest/benchmarks`.
- **Execution**: Create `src/components/pickers/BenchmarkPicker.tsx`.

---

## PHASE 6: Client Dashboard & News

### C014 | Dashboard - Layout
- **Planning**: Plan grid: 3-4 columns, regional sections (Americas, Europe, Asia).
- **Execution**: Create `src/components/dashboard/DashboardGrid.tsx`.

### C015 | Market Card Component
- **Planning**: Plan card content: name, price, % change, mini sparkline.
- **Execution**: Create `src/components/dashboard/MarketCard.tsx`.

### C016 | Dashboard - Quotes
- **Planning**: Plan symbol list for indices + crypto. Fetch or WebSocket.
- **Execution**: Wire MarketCards to `GET /data/quote` or WebSocket. Display real data.

### C017 | Dashboard - Market Hours
- **Planning**: Plan indicator design. Use `GET /data/markets/status`.
- **Execution**: Add market hours indicator to header.

### C018 | News - Feed Component
- **Planning**: Plan layout: ticker vs panel. Filter tabs.
- **Execution**: Create `src/components/news/NewsFeed.tsx`.

### C019 | News - API Integration
- **Execution**: Create `src/api/news.ts`. Fetch `GET /news/feed`. Wire to NewsFeed.

### C020 | News - Filtering
- **Execution**: Add filter tabs: All, Equities, Crypto, Macro, Gov/Exchange.

---

## PHASE 7: Strategy Builder

### C021 | Strategy Type Selector
- **Planning**: Plan strategy types list. Map to backend schema registry.
- **Execution**: Create `src/components/strategy-builder/StrategyTypeSelector.tsx`.

### C022 | Technical Strategy Form
- **Planning**: Plan form fields from Technical schema: indicators, lookback, thresholds.
- **Execution**: Create `src/components/strategy-builder/TechnicalStrategyForm.tsx`.

### C023 | Fundamental Strategy Form
- **Execution**: Create FundamentalStrategyForm.tsx.

### C024 | ML Strategy Form
- **Planning**: Plan form: model picker, features, target.
- **Execution**: Create MLStrategyForm.tsx.

### C025 | LLM Strategy Form
- **Execution**: Create LLMStrategyForm.tsx with expert picker.

### C026 | Arbitrage Strategy Form
- **Execution**: Create ArbitrageStrategyForm.tsx (legs, thresholds).

### C027 | Stat Arb Strategy Form
- **Execution**: Create StatArbStrategyForm.tsx.

### C028 | Delta Neutral Strategy Form
- **Execution**: Create DeltaNeutralStrategyForm.tsx.

### C029 | Options Spread Strategy Form
- **Execution**: Create OptionsSpreadStrategyForm.tsx.

### C030 | Momentum Strategy Form
- **Execution**: Create MomentumStrategyForm.tsx.

### C031 | Mean Reversion Strategy Form
- **Execution**: Create MeanReversionStrategyForm.tsx.

### C032 | Strategy Builder - Asset Selection
- **Planning**: Plan multi-asset picker in builder.
- **Execution**: Add AssetPicker to strategy builder. Multi-select.

### C033 | Strategy Builder - Save
- **Planning**: Define strategy save API. Local state vs server.
- **Execution**: Implement save strategy. POST to backend if endpoint exists.

### C034 | Strategy Builder - Full Flow
- **Execution**: Wire type selector → form → assets → save/run. Navigate to backtest on run.

---

## PHASE 8: AI Agents UI

### C035 | Agents List Page
- **Planning**: Plan list layout. Create, edit, duplicate, delete actions.
- **Execution**: Create `src/components/agents/AgentsList.tsx`. Fetch `GET /agents`.

### C036 | Agent Create/Edit Form
- **Planning**: Plan form fields: name, description, model picker.
- **Execution**: Create `src/components/agents/AgentForm.tsx`.

### C037 | Workflow Configurator
- **Planning**: Plan UI: step list with drag-and-drop. Add/remove steps.
- **Execution**: Create `src/components/agents/WorkflowConfigurator.tsx`.

### C038 | Prompts Editor
- **Planning**: Plan system prompt text area, context prompt. Placeholder docs.
- **Execution**: Create `src/components/agents/PromptsEditor.tsx`.

### C039 | Tool Picker
- **Planning**: Map `GET /agents/tools`. Plan multi-select with descriptions.
- **Execution**: Create `src/components/agents/ToolPicker.tsx`.

### C040 | Agent Run - Paper
- **Planning**: Plan run button, job polling, result display.
- **Execution**: Add "Run (Paper)" button. POST to run, poll job, show result.

### C041 | Agent Run History
- **Planning**: Plan run history table: date, duration, decisions, orders.
- **Execution**: Create `src/components/agents/AgentRunHistory.tsx`. Fetch `GET /agents/{id}/runs`.

### C042 | Agent Run - Live Stream (Optional)
- **Planning**: Plan WebSocket for real-time reasoning stream.
- **Execution**: Implement WS subscription for agent run stream if backend supports.

---

## PHASE 9: Backtest UI

### C043 | Backtest Config Form
- **Planning**: Plan form: strategy picker, assets, date range, interval, fees, benchmark.
- **Execution**: Create `src/components/backtest/BacktestConfigForm.tsx`.

### C044 | Fees Config
- **Planning**: Plan maker/taker inputs (bps or %).
- **Execution**: Add fees fields to backtest form.

### C045 | Backtest Run
- **Planning**: Plan run flow: POST, poll job, display result.
- **Execution**: Implement run button. Poll `GET /jobs/{id}`. On complete, show result.

### C046 | Backtest Results - Metrics
- **Planning**: Plan metrics table layout.
- **Execution**: Create `src/components/backtest/BacktestMetricsTable.tsx`.

### C047 | Backtest Results - Equity Curve
- **Planning**: Plan chart: equity vs benchmark. Use Lightweight Charts or Recharts.
- **Execution**: Create `src/components/backtest/EquityCurveChart.tsx`.

### C048 | Backtest Results - Trades Table
- **Execution**: Create `src/components/backtest/TradesTable.tsx`.

### C049 | Parallel Backtest - Multi-Strategy
- **Planning**: Plan UI: select multiple strategies, same config, run batch.
- **Execution**: Add multi-strategy selection. POST batch. Show comparison.

### C050 | Parallel Backtest - Comparison View
- **Planning**: Plan side-by-side charts, comparison table.
- **Execution**: Create `src/components/backtest/BacktestComparisonView.tsx`.

---

## PHASE 10: Jobs, ML, Scripts

### C051 | useJobs Hook
- **Planning**: Plan poll interval, status parsing, result extraction.
- **Execution**: Create `src/hooks/useJobs.ts`. Poll `GET /jobs/{id}`.

### C052 | Job Progress UI
- **Planning**: Plan progress bar, ETA, spinner.
- **Execution**: Create `src/components/ui/JobProgress.tsx`.

### C053 | ML Pipeline - Build Step
- **Planning**: Plan form: model type, features (multi-select from API), target, data config.
- **Execution**: Create `src/components/ml/MLBuildForm.tsx`. Fetch `GET /ml/features`.

### C054 | ML Pipeline - Train
- **Planning**: Plan train trigger, job polling, metrics display.
- **Execution**: Add train button. POST, poll, show metrics.

### C055 | ML Pipeline - Test
- **Planning**: Plan test form: model picker, test date range.
- **Execution**: Create ML test form. POST test, show result.

### C056 | ML Pipeline - Deploy
- **Planning**: Plan deploy button, confirmation.
- **Execution**: Add deploy button. POST deploy.

### C057 | ML Models List
- **Execution**: Create `src/components/ml/MLModelsList.tsx`. Fetch `GET /ml/models`.

### C058 | Script Editor
- **Planning**: Choose Monaco vs CodeMirror. Plan language (Python).
- **Execution**: Create `src/components/scripts/ScriptEditor.tsx`.

### C059 | Script Run
- **Planning**: Plan run config: assets, date range, interval, mode (backtest/paper).
- **Execution**: Create script run form. POST `POST /scripts/run`. Poll, show result.

### C060 | Script Results
- **Execution**: Create ScriptResultsPanel. Display trades, equity curve, metrics.

---

## PHASE 11: Options, Signals, Paper Trading

### C061 | Options Chain Picker
- **Planning**: Plan UI: symbol → fetch chain → select expiry → select strike/type.
- **Execution**: Create `src/components/pickers/OptionsChainPicker.tsx`. Fetch `GET /data/options/chains`.

### C062 | Multi-Leg Options Builder
- **Planning**: Plan UI: add leg, select option, quantity, role (buy/sell).
- **Execution**: Create `src/components/options/MultiLegBuilder.tsx`.

### C063 | Signals - Provider List
- **Planning**: Plan list, add/edit/remove.
- **Execution**: Create `src/components/signals/SignalProvidersList.tsx`.

### C064 | Signals - Provider Config
- **Planning**: Plan form: URL, auth, parse rules.
- **Execution**: Create SignalProviderConfigForm.tsx.

### C065 | Strategy - Signal Integration
- **Execution**: Add "Add signal provider" to strategy builder. Combine rule picker.

### C066 | Paper Trading Toggle
- **Planning**: Plan global toggle. Store in state/store.
- **Execution**: Add Paper/Live toggle to header or settings. Wire to API client.

### C067 | Portfolio View
- **Planning**: Plan portfolio table: symbol, qty, value, PnL.
- **Execution**: Create `src/components/portfolio/PortfolioView.tsx`. Fetch `GET /portfolio/positions`.

### C068 | Order Form
- **Planning**: Plan form: symbol, side, qty, type (market/limit).
- **Execution**: Create `src/components/portfolio/OrderForm.tsx`. POST order.

### C069 | Paper Indicator
- **Execution**: Add "Paper" badge to portfolio and order form when in paper mode.

---

## PHASE 12: Polish & Testing

### C070 | Loading Skeletons
- **Planning**: Plan skeleton components for cards, tables, forms.
- **Execution**: Create skeleton components. Use in dashboard, tables.

### C071 | Error Boundaries
- **Execution**: Add React error boundaries. Fallback UI.

### C072 | Toast/Banner for Errors
- **Planning**: Choose toast library or custom.
- **Execution**: Implement toast for API errors. Retry button where appropriate.

### C073 | Responsive Layout
- **Execution**: Test and fix responsive behavior. Mobile breakpoints.

### C074 | Accessibility - Pickers
- **Execution**: Add keyboard nav, ARIA to pickers.

### C075 | Unit Tests - Pickers
- **Planning**: Plan test cases: selection, API mock, validation.
- **Execution**: Write Vitest tests for AssetPicker, DateRangePicker.

### C076 | Unit Tests - Hooks
- **Execution**: Write tests for useJobs, useWebSocket with mocked fetch/WS.

### C077 | Unit Tests - Utils
- **Execution**: Write tests for date formatting, number formatting.

### C078 | Integration Test - Dashboard
- **Planning**: Plan E2E flow: load, see data. Use real backend or testcontainers.
- **Execution**: Write Playwright/Cypress test: load dashboard, verify quotes load.

### C079 | Integration Test - Backtest
- **Execution**: E2E: select strategy, run backtest, see result.

### C080 | Integration Test - Agent
- **Execution**: E2E: create agent, run paper, see run history.

### C081 | Contract Test Setup
- **Planning**: Plan OpenAPI spec export, client type generation, contract test.
- **Execution**: Add contract test script. Compare client expectations to OpenAPI.

---

## Additional Server To-Dos (Gaps)

### S105 | News Scrapers - Government
- **Planning**: Plan SEC EDGAR, Fed, Treasury feed parsing.
- **Execution**: Create scrapers for gov feeds. Normalize to common schema.

### S106 | News Scrapers - Exchange
- **Planning**: Plan NYSE, NASDAQ announcement parsing.
- **Execution**: Create exchange feed scrapers.

### S107 | Strategy Executor - Fundamental
- **Execution**: Create `app/strategies/fundamental.py`.

### S108 | Strategy Executor - Pairs
- **Execution**: Create `app/strategies/stat_arb.py`.

### S109 | Strategy Executor - Options
- **Planning**: Plan options backtest with vectorbt or custom.
- **Execution**: Create options strategy executor.

### S110 | LightGBM Trainer
- **Execution**: Add LightGBM trainer to ML pipeline.

### S111 | Scikit-learn Trainer
- **Execution**: Add sklearn trainer (RandomForest, etc.).

---

### S112 | Custom Benchmark CRUD - Validation
- **Planning**: Validate symbol list, weight sum = 100%. Prevent duplicate names.
- **Execution**: Add validation to benchmark create/update.

### S113 | Rate Limiting - Redis
- **Planning**: Plan rate limits per provider (YFinance, Alpaca). Key structure.
- **Execution**: Implement rate limiter in `app/core/rate_limit.py`. Apply to provider calls.

### S114 | Price Cache - TTL Strategy
- **Planning**: Plan TTL: 60s live, longer historical. Cache invalidation.
- **Execution**: Refine cache logic. Add cache hit metrics.

### C082 | Full Chart View (Drill-Down)
- **Planning**: Plan chart page: symbol, date range, interval. Lightweight Charts.
- **Execution**: Create `src/components/charts/FullChart.tsx`. Navigate from MarketCard click.

### C083 | LLM Experts - Route & Tabs
- **Planning**: Plan expert tabs/wizard. Route `/llm/screener`, etc.
- **Execution**: Create LLM experts page with tab selector. Route per expert.

### C084 | LLM Experts - Input Forms
- **Execution**: Create input form per expert (profile, ticker, portfolio). POST to `/llm/{slug}`.

### C085 | LLM Experts - Report Renderer
- **Planning**: Plan markdown rendering. Code blocks, tables.
- **Execution**: Create `src/components/llm/ReportRenderer.tsx`. Render markdown response.

### C086 | Ad-Hoc Trade from News
- **Planning**: Plan "Trade" button on news item. Pre-fill symbol.
- **Execution**: Add quick trade button to news items. Open order form with symbol.

### C087 | Settings - Fee Config
- **Planning**: Plan settings page or modal. Default maker/taker for paper/backtest.
- **Execution**: Create settings UI. Save fee defaults (localStorage or backend).

### C088 | Symbol Validation Before Submit
- **Execution**: Validate selected symbols exist (quick API check) before backtest/order submit.

### C089 | Export Backtest Results
- **Planning**: Plan export: CSV trades, PNG chart, PDF report.
- **Execution**: Add export buttons. Generate and download.

### C090 | Agent - Duplicate Agent
- **Execution**: Add "Duplicate" action. Copy agent config, new name. POST create.

### C091 | Dark/Light Theme Toggle (Optional)
- **Planning**: Plan theme switching. CSS variables.
- **Execution**: Add theme toggle. Persist preference.

---

## Summary

| Phase | Count |
|-------|-------|
| Server (S001-S104) | 104 |
| Server Extensions (S105-S114) | 10 |
| Client (C001-C081) | 81 |
| Client Extensions (C082-C091) | 10 |
| **Total** | **205** |

Each to-do includes a **Planning** stage (design, decide, document) to complete before **Execution**.
