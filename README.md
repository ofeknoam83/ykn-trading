# YKN Trading Platform

Research and trading platform with data providers (YFinance, Alpaca, CCXT), backtesting, LLM experts, and AI agents.

## Quick Start

### Backend

```bash
# Start database and Redis
docker compose up -d

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

API: http://localhost:8000
Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### Environment

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL + TimescaleDB
- `REDIS_URL` - Redis
- `ALPACA_API_KEY` / `ALPACA_API_SECRET` - Alpaca (paper trading)
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` - LLM experts

## API Endpoints

| Area | Endpoints |
|------|-----------|
| Data | `GET /api/v1/data/quote/{symbol}`, `/data/historical`, `/data/search` |
| Portfolio | `GET /api/v1/portfolio/positions`, `/portfolio/account` |
| Backtest | `POST /api/v1/backtest/run`, `GET /api/v1/backtest/{job_id}` |
| Jobs | `GET /api/v1/jobs/{job_id}` |
| LLM | `POST /api/v1/llm/screener`, `/valuation`, `/risk-assessment`, etc. |
| Agents | `GET/POST /api/v1/agents`, `GET /api/v1/agents/tools` |
| News | `GET /api/v1/news/feed` |

## Structure

- `backend/` - FastAPI, providers, brokers, backtest, LLM
- `frontend/` - React, Vite, dashboard, backtest UI, agents
- `docker-compose.yml` - TimescaleDB, Redis
