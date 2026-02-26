import { useState, useEffect, useCallback } from 'react';
import type { BacktestResult, TradeRecord } from '../../../types/backtest';
import type { EnrichedTradeRecord, TradeReplayFrame } from '../../../types/forensics';
import { ReplayChart } from './ReplayChart';
import { IndicatorValuesPanel } from './IndicatorValuesPanel';
import { NewsContextPanel } from './NewsContextPanel';
import { PlaybackControls } from './PlaybackControls';

interface TradeReplayProps {
  result: BacktestResult;
  trade: TradeRecord | null;
  enrichedTrade: EnrichedTradeRecord | null;
  loading: boolean;
  error: string | null;
}

export function TradeReplay({ trade, enrichedTrade, loading, error }: TradeReplayProps) {
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Build frames from enriched trade
  const frames: TradeReplayFrame[] = enrichedTrade
    ? enrichedTrade.chart_data.map((d, i) => ({
        date: d.date,
        bar_index: i,
        ohlcv: { o: d.o, h: d.h, l: d.l, c: d.c, v: d.v },
        indicators: enrichedTrade.entry_indicators.map((ind) => ({
          ...ind,
          value: d.indicators[ind.name] ?? ind.value,
        })),
        signals_fired: [],
        is_entry: d.date === enrichedTrade.entry_date,
        is_exit: d.date === enrichedTrade.exit_date,
      }))
    : [];

  // Current frame for playback mode
  const currentFrame = playbackIndex !== null ? frames[playbackIndex] ?? null : null;
  const totalFrames = frames.length;

  // Reset playback when trade changes
  useEffect(() => {
    setPlaybackIndex(null);
    setIsPlaying(false);
  }, [trade?.id]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || playbackIndex === null) return;
    const interval = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev === null || prev >= totalFrames - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackIndex, totalFrames, playbackSpeed]);

  const handlePlay = useCallback(() => {
    if (playbackIndex === null) setPlaybackIndex(0);
    setIsPlaying(true);
  }, [playbackIndex]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStepForward = useCallback(() => {
    setPlaybackIndex((prev) => {
      if (prev === null) return 0;
      return Math.min(prev + 1, totalFrames - 1);
    });
    setIsPlaying(false);
  }, [totalFrames]);

  const handleStepBack = useCallback(() => {
    setPlaybackIndex((prev) => {
      if (prev === null) return 0;
      return Math.max(prev - 1, 0);
    });
    setIsPlaying(false);
  }, []);

  const handleJumpForward = useCallback(() => {
    setPlaybackIndex((prev) => {
      if (prev === null) return 0;
      return Math.min(prev + 5, totalFrames - 1);
    });
    setIsPlaying(false);
  }, [totalFrames]);

  const handleJumpBack = useCallback(() => {
    setPlaybackIndex((prev) => {
      if (prev === null) return 0;
      return Math.max(prev - 5, 0);
    });
    setIsPlaying(false);
  }, []);

  const handleGoToStart = useCallback(() => {
    setPlaybackIndex(0);
    setIsPlaying(false);
  }, []);

  const handleGoToEnd = useCallback(() => {
    setPlaybackIndex(totalFrames - 1);
    setIsPlaying(false);
  }, [totalFrames]);

  const handleScrub = useCallback((index: number) => {
    setPlaybackIndex(index);
    setIsPlaying(false);
  }, []);

  if (!trade) {
    return (
      <div className="tf-replay">
        <div className="tf-empty-state">
          Select a trade from the sidebar to view its replay.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tf-replay">
        <div className="tf-loading">Loading trade replay data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-replay">
        <div className="tf-error">Failed to load replay: {error}</div>
      </div>
    );
  }

  return (
    <div className="tf-replay">
      <div className="tf-replay-header">
        <h4>
          Trade Replay: {trade.symbol} {trade.side === 'long' ? 'BUY' : 'SHORT'}{' '}
          {trade.entry_date.slice(0, 10)} → {trade.exit_date.slice(0, 10)}
        </h4>
      </div>

      <ReplayChart
        trade={trade}
        enrichedTrade={enrichedTrade}
        playbackIndex={playbackIndex}
      />

      <div className="tf-replay-panels">
        <div className="tf-panel tf-trade-details">
          <h5>Trade Details</h5>
          <div className="tf-detail-grid">
            <div className="tf-detail-row">
              <span className="tf-detail-label">Symbol</span>
              <span className="tf-detail-value mono">{trade.symbol}</span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">Side</span>
              <span className="tf-detail-value">{trade.side === 'long' ? 'Long' : 'Short'}</span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">Entry</span>
              <span className="tf-detail-value mono">{trade.entry_date.slice(0, 10)}, ${trade.entry_price.toFixed(2)}</span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">Exit</span>
              <span className="tf-detail-value mono">{trade.exit_date.slice(0, 10)}, ${trade.exit_price.toFixed(2)}</span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">Duration</span>
              <span className="tf-detail-value">{trade.duration_days} days</span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">P&L</span>
              <span className={`tf-detail-value mono ${trade.pnl >= 0 ? 'bt-metric-positive' : 'bt-metric-negative'}`}>
                ${trade.pnl.toFixed(2)} ({(trade.pnl_pct * 100).toFixed(2)}%)
              </span>
            </div>
            <div className="tf-detail-row">
              <span className="tf-detail-label">Fees</span>
              <span className="tf-detail-value mono">${trade.fees.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <IndicatorValuesPanel
          title="Context at Entry"
          indicators={enrichedTrade?.entry_indicators ?? []}
          entrySignal={enrichedTrade?.entry_signal ?? null}
          currentFrame={currentFrame}
          showCurrent={playbackIndex !== null}
        />

        <IndicatorValuesPanel
          title="Context at Exit"
          indicators={enrichedTrade?.exit_indicators ?? []}
          entrySignal={enrichedTrade?.exit_signal ?? null}
          currentFrame={null}
          showCurrent={false}
        />

        <NewsContextPanel
          entryDate={trade.entry_date}
          exitDate={trade.exit_date}
          entryNews={[]}
          exitNews={[]}
        />
      </div>

      {frames.length > 0 && (
        <PlaybackControls
          isPlaying={isPlaying}
          currentIndex={playbackIndex ?? 0}
          totalFrames={totalFrames}
          speed={playbackSpeed}
          currentDate={currentFrame?.date ?? trade.entry_date}
          onPlay={handlePlay}
          onPause={handlePause}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          onJumpForward={handleJumpForward}
          onJumpBack={handleJumpBack}
          onGoToStart={handleGoToStart}
          onGoToEnd={handleGoToEnd}
          onScrub={handleScrub}
          onSpeedChange={setPlaybackSpeed}
        />
      )}
    </div>
  );
}
