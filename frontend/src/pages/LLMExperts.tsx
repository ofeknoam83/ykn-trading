import { useState, useEffect } from 'react';
import { runLLMExpert, getLLMExperts } from '../api/client';

interface Expert {
  slug: string;
  name: string;
  description: string;
  prompt: string;
}

const PLACEHOLDERS: Record<string, string> = {
  screener: 'e.g. Tech stocks with P/E < 25, revenue growth > 10%',
  valuation: 'e.g. AAPL fair value estimate',
  'risk-assessment': 'e.g. Portfolio risk for 60/40 stocks/bonds',
  earnings: 'e.g. AAPL Q4 earnings outlook',
  'portfolio-builder': 'e.g. Diversified growth portfolio, 80% stocks',
  'pattern-finder': 'e.g. Momentum patterns in SPY',
  macro: 'e.g. Fed rate impact on equities',
};

const FALLBACK_EXPERTS: Expert[] = [
  { slug: 'screener', name: 'Stock Screener', description: 'Goldman-style screening.', prompt: '' },
  { slug: 'valuation', name: 'DCF Valuation', description: 'Morgan Stanley DCF.', prompt: '' },
  { slug: 'risk-assessment', name: 'Risk Assessment', description: 'Bridgewater-style risk analysis.', prompt: '' },
  { slug: 'earnings', name: 'Earnings Analysis', description: 'JPMorgan earnings insights.', prompt: '' },
  { slug: 'portfolio-builder', name: 'Portfolio Builder', description: 'BlackRock portfolio construction.', prompt: '' },
  { slug: 'pattern-finder', name: 'Pattern Finder', description: 'Renaissance quant patterns.', prompt: '' },
  { slug: 'macro', name: 'Macro Report', description: 'McKinsey macro analysis.', prompt: '' },
];

export function LLMExperts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [input, setInput] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    getLLMExperts()
      .then((r) => setExperts(r.experts?.length ? r.experts : FALLBACK_EXPERTS))
      .catch(() => setExperts(FALLBACK_EXPERTS));
  }, []);

  const expert = experts[activeTab] || { slug: '', name: '', description: '', prompt: '' };
  const placeholder = expert?.slug ? PLACEHOLDERS[expert.slug] || '' : '';

  async function handleRun() {
    if (!input.trim()) {
      setReport('Please enter your question above.');
      return;
    }
    if (!expert?.slug) return;
    setLoading(true);
    setReport('');
    try {
      const res = await runLLMExpert(expert.slug, input.trim());
      const r = res?.report ?? res;
      setReport(typeof r === 'string' ? r : JSON.stringify(r, null, 2));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setReport(`Error: ${msg}`);
      console.error('runLLMExpert failed:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="llm-experts">
      <h2>LLM Experts</h2>
      <p className="llm-intro">AI analysts powered by real market data. Select an expert and describe your question.</p>

      {experts.length === 0 && <p className="llm-loading">Loading experts...</p>}
      <div className="llm-tabs">
        {experts.map((e, i) => (
          <button
            key={e.slug}
            type="button"
            className={activeTab === i ? 'active' : ''}
            onClick={() => setActiveTab(i)}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div className="llm-panel">
        <div className="llm-form">
          <h3>{expert.name || 'Select an expert'}</h3>
          <p className="expert-desc">{expert.description}</p>
          {expert.prompt && (
            <div className="expert-prompt-section">
              <button
                type="button"
                className="prompt-toggle"
                onClick={() => setShowPrompt((s) => !s)}
                aria-expanded={showPrompt}
              >
                {showPrompt ? 'Hide' : 'Show'} System Prompt
              </button>
              {showPrompt && (
                <pre className="expert-prompt">{expert.prompt}</pre>
              )}
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={4}
            disabled={loading}
          />
          <button onClick={handleRun} disabled={loading}>
            {loading ? 'Running...' : 'Run Expert'}
          </button>
        </div>

        {report && (
          <div className="llm-report">
            <h3>Report</h3>
            <div className="report-content">
              {report.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
