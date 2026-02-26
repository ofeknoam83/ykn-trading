import { useSentimentStore } from '../stores/sentimentStore';
import { sentimentColor, scoreToWidth } from '../utils/sentimentColorScale';

export function SectorSentimentHeatmap() {
  const sectors = useSentimentStore((s) => s.sectorHeatmap);

  return (
    <div className="sent-card">
      <div className="sent-card-header">
        <span className="sent-card-title">Sector Sentiment Heatmap</span>
      </div>
      <div className="sent-card-body">
        {sectors.length === 0 ? (
          <div className="sent-empty">No sector data available</div>
        ) : (
          sectors.map((sector) => (
            <div key={sector.sector} className="sent-sector-row">
              <span className="sent-sector-name">{sector.sector}</span>
              <div className="sent-sector-bar">
                <div
                  className="sent-sector-fill"
                  style={{
                    width: scoreToWidth(sector.score),
                    background: sentimentColor(sector.score),
                  }}
                />
              </div>
              <span
                className="sent-sector-score"
                style={{ color: sentimentColor(sector.score) }}
              >
                {sector.score}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
