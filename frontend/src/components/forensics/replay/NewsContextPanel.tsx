import type { NewsHeadline } from '../../../types/forensics';

interface NewsContextPanelProps {
  entryDate: string;
  exitDate: string;
  entryNews: NewsHeadline[];
  exitNews: NewsHeadline[];
}

export function NewsContextPanel({
  entryDate,
  exitDate,
  entryNews,
  exitNews,
}: NewsContextPanelProps) {
  const hasAnyNews = entryNews.length > 0 || exitNews.length > 0;

  return (
    <div className="tf-panel tf-news-panel">
      <h5>News Context</h5>

      {!hasAnyNews && (
        <div className="tf-empty-state">
          Historical news not available for this date range.
        </div>
      )}

      {entryNews.length > 0 && (
        <div className="tf-news-section">
          <div className="tf-news-section-label">
            Entry window (\u00B12 days of {entryDate.slice(0, 10)})
          </div>
          {entryNews.map((n, i) => (
            <NewsItem key={i} headline={n} />
          ))}
        </div>
      )}

      {exitNews.length > 0 && (
        <div className="tf-news-section">
          <div className="tf-news-section-label">
            Exit window (\u00B12 days of {exitDate.slice(0, 10)})
          </div>
          {exitNews.map((n, i) => (
            <NewsItem key={i} headline={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsItem({ headline }: { headline: NewsHeadline }) {
  const sentimentIcon =
    headline.sentiment === 'positive'
      ? '\u{1F4C8}'
      : headline.sentiment === 'negative'
        ? '\u{1F4C9}'
        : '\u{1F4F0}';

  return (
    <div className="tf-news-item">
      <span className="tf-news-icon">{sentimentIcon}</span>
      <div className="tf-news-content">
        <span className="tf-news-date">{headline.date.slice(0, 10)}</span>
        {headline.url ? (
          <a
            href={headline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="tf-news-title"
          >
            {headline.title}
          </a>
        ) : (
          <span className="tf-news-title">{headline.title}</span>
        )}
        <span className="tf-news-source">{headline.source}</span>
      </div>
    </div>
  );
}
