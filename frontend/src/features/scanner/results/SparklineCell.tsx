interface SparklineCellProps {
  data: number[];
  width?: number;
  height?: number;
}

export function SparklineCell({ data, width = 100, height = 30 }: SparklineCellProps) {
  if (!data || data.length < 2) {
    return <svg className="sc-sparkline" width={width} height={height} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * chartWidth;
    const y = padding + (1 - (val - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#3fb950' : '#f85149';

  return (
    <svg className="sc-sparkline" width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
