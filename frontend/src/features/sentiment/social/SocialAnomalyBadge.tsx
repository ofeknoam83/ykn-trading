interface Props {
  botFilteredPct: number;
}

export function SocialAnomalyBadge({ botFilteredPct }: Props) {
  if (botFilteredPct <= 15) return null;

  return (
    <span className="sent-badge sent-badge--bearish" style={{ fontSize: 10 }}>
      {'\u26A0\uFE0F'} {botFilteredPct.toFixed(0)}% bot/spam filtered
    </span>
  );
}
