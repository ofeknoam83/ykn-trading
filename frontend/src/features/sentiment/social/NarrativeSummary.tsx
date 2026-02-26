interface Props {
  narrative: string;
  keywords: string[];
}

export function NarrativeSummary({ narrative, keywords }: Props) {
  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Dominant Narrative</span>
      </div>
      <div className="sent-card-body">
        <div style={{ fontSize: 12, color: '#e6edf3', lineHeight: 1.5, marginBottom: 12 }}>
          {narrative || 'No dominant narrative detected.'}
        </div>
        {keywords.length > 0 && (
          <div>
            <div className="sent-text-sm sent-text-muted sent-mb-8">Top Keywords</div>
            <div className="sent-flex" style={{ gap: 6, flexWrap: 'wrap' }}>
              {keywords.map((kw) => (
                <span key={kw} className="sent-badge sent-badge--info">{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
