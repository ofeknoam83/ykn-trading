import { convergenceLabel } from '../utils/convergenceCalculator';
import type { CompositeSentiment } from '../types/sentiment.types';

interface Props {
  profile: CompositeSentiment;
}

export function CrossSignalNote({ profile }: Props) {
  if (profile.convergenceType === 'neutral') return null;

  const isWarning = profile.convergenceType === 'divergent' || profile.convergenceType === 'crowd_fade';
  const isPositive = profile.convergenceType === 'full_bullish' || profile.convergenceType === 'smart_money_divergence' || profile.convergenceType === 'catalyst_setup';

  return (
    <div className={isWarning ? 'sent-warning' : ''} style={!isWarning ? {
      padding: '10px 14px',
      background: isPositive ? '#3fb95015' : '#21262d',
      border: `1px solid ${isPositive ? '#3fb95040' : '#30363d'}`,
      borderRadius: 6,
      fontSize: 12,
      color: '#e6edf3',
      marginBottom: 12,
    } : undefined}>
      <span style={{ fontWeight: 700 }}>
        {isWarning ? '\u26A0\uFE0F' : isPositive ? '\u{1F7E2}' : '\u{1F535}'}{' '}
        {convergenceLabel(profile.convergenceType)} Detected
      </span>
      <span style={{ color: '#8b949e', marginLeft: 8 }}>
        (Score: {profile.convergenceScore.toFixed(2)})
      </span>
      <div style={{ marginTop: 4, color: '#8b949e' }}>
        {profile.convergenceType === 'smart_money_divergence' && (
          'News and social are bearish but institutional flow is strongly bullish. Historically this pattern suggests potential recovery.'
        )}
        {profile.convergenceType === 'full_bullish' && (
          'All signals are aligned positively. High conviction setup.'
        )}
        {profile.convergenceType === 'full_bearish' && (
          'All signals are aligned negatively. Caution warranted.'
        )}
        {profile.convergenceType === 'crowd_fade' && (
          'Extreme social bullishness against weak technicals. Potential contrarian sell signal.'
        )}
        {profile.convergenceType === 'catalyst_setup' && (
          'Positive sentiment arriving at a technical inflection point.'
        )}
        {profile.convergenceType === 'divergent' && (
          'Quantitative and sentiment signals disagree. Mixed signals suggest waiting for resolution.'
        )}
      </div>
    </div>
  );
}
