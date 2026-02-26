import { sentimentColor } from '../utils/sentimentColorScale';
import type { EarningsProfile } from '../types/sentiment.types';

interface Props {
  profile: EarningsProfile;
  expanded: boolean;
  onToggle: () => void;
}

export function EarningsCard({ profile, expanded, onToggle }: Props) {
  const scoreColor = profile.earningsScore >= 60 ? '#3fb950' : profile.earningsScore >= 40 ? '#d29922' : '#f85149';

  return (
    <div className="sent-earnings-card">
      <div className="sent-earnings-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="sent-flex sent-gap-8 sent-flex-center">
          <span className="sent-earnings-symbol">{profile.symbol}</span>
          <span className="sent-text-muted sent-text-sm">
            {profile.nextEarningsTime === 'pre_market' ? 'Before Open' :
              profile.nextEarningsTime === 'after_close' ? 'After Close' : 'During Hours'}
          </span>
          <span className="sent-text-muted sent-text-sm">
            Days: {profile.daysUntilEarnings}
          </span>
        </div>
        <span className="sent-score-badge" style={{ background: `${scoreColor}20`, color: scoreColor }}>
          {profile.earningsScoreLabel}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          <div className="sent-earnings-grid sent-mb-8">
            <div>
              <div className="sent-earnings-label">Consensus EPS</div>
              <div className="sent-earnings-value">${profile.epsEstimate.toFixed(2)}</div>
            </div>
            <div>
              <div className="sent-earnings-label">Revenue Est.</div>
              <div className="sent-earnings-value">${(profile.revenueEstimate / 1e9).toFixed(1)}B</div>
            </div>
            {profile.epsWhisper && (
              <div>
                <div className="sent-earnings-label">Whisper EPS</div>
                <div className="sent-earnings-value">${profile.epsWhisper.toFixed(2)}</div>
              </div>
            )}
            <div>
              <div className="sent-earnings-label">Revisions (30d)</div>
              <div className="sent-earnings-value">
                <span className="sent-text-positive">{profile.estimateRevisions.epsUp} up</span>{' '}
                <span className="sent-text-negative">{profile.estimateRevisions.epsDown} down</span>
              </div>
            </div>
          </div>

          <div className="sent-earnings-grid sent-mb-8">
            <div>
              <div className="sent-earnings-label">Beat Rate (EPS)</div>
              <div className="sent-earnings-value">
                {profile.beatRate.eps.beats}/{profile.beatRate.eps.total} ({profile.beatRate.eps.pct.toFixed(0)}%)
              </div>
            </div>
            <div>
              <div className="sent-earnings-label">Avg Surprise (EPS)</div>
              <div className="sent-earnings-value" style={{ color: profile.avgSurprise.eps >= 0 ? '#3fb950' : '#f85149' }}>
                {profile.avgSurprise.eps >= 0 ? '+' : ''}{profile.avgSurprise.eps.toFixed(1)}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: 10, background: '#0d1117', borderRadius: 6 }}>
            <div className="sent-text-sm sent-font-bold sent-mb-8">Options View</div>
            <div className="sent-earnings-grid">
              <div>
                <div className="sent-earnings-label">Implied Move</div>
                <div className="sent-earnings-value">&plusmn;{profile.impliedMove.toFixed(1)}%</div>
              </div>
              <div>
                <div className="sent-earnings-label">Historical Avg Move</div>
                <div className="sent-earnings-value">&plusmn;{profile.historicalAvgMove.toFixed(1)}%</div>
              </div>
              <div>
                <div className="sent-earnings-label">Implied/Realized</div>
                <div className="sent-earnings-value" style={{
                  color: profile.impliedVsRealized < 1 ? '#3fb950' : '#f85149',
                }}>
                  {profile.impliedVsRealized.toFixed(2)}
                  {profile.impliedVsRealized < 1 && ' — options may be cheap'}
                  {profile.impliedVsRealized > 1.2 && ' — options expensive'}
                </div>
              </div>
              <div>
                <div className="sent-earnings-label">Post-Earnings Drift (beat)</div>
                <div className="sent-earnings-value">
                  +5d: {profile.postEarningsDrift.day5 >= 0 ? '+' : ''}{profile.postEarningsDrift.day5.toFixed(1)}%{' '}
                  +10d: {profile.postEarningsDrift.day10 >= 0 ? '+' : ''}{profile.postEarningsDrift.day10.toFixed(1)}%{' '}
                  +20d: {profile.postEarningsDrift.day20 >= 0 ? '+' : ''}{profile.postEarningsDrift.day20.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <span className="sent-text-sm sent-text-muted">Pre-Earnings Sentiment: </span>
            <span style={{ color: sentimentColor(profile.preEarningsSentiment), fontWeight: 600 }}>
              {profile.preEarningsSentiment}
            </span>
            <span className="sent-text-sm sent-text-muted"> | Revision Trend: </span>
            <span style={{ color: profile.analystRevisionTrend === 'up' ? '#3fb950' : profile.analystRevisionTrend === 'down' ? '#f85149' : '#8b949e', fontWeight: 600 }}>
              {profile.analystRevisionTrend}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
