import { Outlet, NavLink } from 'react-router-dom';

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo">YKN Trading</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/portfolio" className={({ isActive }) => (isActive ? 'active' : '')}>
            Portfolio
          </NavLink>
          <NavLink to="/strategies" className={({ isActive }) => (isActive ? 'active' : '')}>
            Strategies
          </NavLink>
          <NavLink to="/backtest" className={({ isActive }) => (isActive ? 'active' : '')}>
            Backtest
          </NavLink>
          <NavLink to="/llm" className={({ isActive }) => (isActive ? 'active' : '')}>
            LLM Experts
          </NavLink>
          <NavLink to="/agents" className={({ isActive }) => (isActive ? 'active' : '')}>
            AI Agents
          </NavLink>
          <NavLink to="/scanner" className={({ isActive }) => (isActive ? 'active' : '')}>
            Scanner
          </NavLink>
          <NavLink to="/sentiment" className={({ isActive }) => (isActive ? 'active' : '')}>
            Sentiment
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
