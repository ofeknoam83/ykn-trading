import { sentimentColor } from '../utils/sentimentColorScale';
import type { CompositeSentiment } from '../types/sentiment.types';

interface Props {
  profile: CompositeSentiment;
}

const COMPONENTS: { key: keyof CompositeSentiment['components']; label: string }[] = [
  { key: 'news', label: 'News' },
  { key: 'social', label: 'Social' },
  { key: 'institutional', label: 'Institutional' },
  { key: 'options', label: 'Options' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'event', label: 'Events' },
];

export function SignalBreakdownTable({ profile }: Props) {
  return (
    <div className="sent-card sent-mb-16">
      <div className="sent-card-header">
        <span className="sent-card-title">Signal Breakdown</span>
      </div>
      <div className="sent-card-body">
        <table className="sent-signal-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Score</th>
              <th>Visual</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map(({ key, label }) => {
              const score = profile.components[key];
              return (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <span className="sent-score-badge" style={{
                      background: `${sentimentColor(score)}20`,
                      color: sentimentColor(score),
                    }}>
                      {score}
                    </span>
                  </td>
                  <td style={{ width: '50%' }}>
                    <div className="sent-bar" style={{ width: '100%' }}>
                      <div
                        className="sent-bar-fill"
                        style={{
                          width: `${score}%`,
                          background: sentimentColor(score),
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td style={{ fontWeight: 700 }}>COMPOSITE</td>
              <td>
                <span className="sent-score-badge" style={{
                  background: `${sentimentColor(profile.composite)}20`,
                  color: sentimentColor(profile.composite),
                  fontSize: 14,
                }}>
                  {profile.composite}
                </span>
              </td>
              <td>
                <div className="sent-bar" style={{ width: '100%', height: 8 }}>
                  <div
                    className="sent-bar-fill"
                    style={{
                      width: `${profile.composite}%`,
                      background: sentimentColor(profile.composite),
                      height: 8,
                    }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
