interface PlaybackControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalFrames: number;
  speed: number;
  currentDate: string;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onJumpForward: () => void;
  onJumpBack: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onScrub: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export function PlaybackControls({
  isPlaying,
  currentIndex,
  totalFrames,
  speed,
  currentDate,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onJumpForward,
  onJumpBack,
  onGoToStart,
  onGoToEnd,
  onScrub,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="tf-playback">
      <div className="tf-playback-controls">
        <button className="tf-pb-btn" onClick={onGoToStart} title="Go to start">
          |◀
        </button>
        <button className="tf-pb-btn" onClick={onJumpBack} title="Jump back 5 bars">
          ◀◀
        </button>
        <button className="tf-pb-btn" onClick={onStepBack} title="Step back">
          ◀
        </button>
        {isPlaying ? (
          <button className="tf-pb-btn tf-pb-main" onClick={onPause} title="Pause">
            ⏸
          </button>
        ) : (
          <button className="tf-pb-btn tf-pb-main" onClick={onPlay} title="Play">
            ▶
          </button>
        )}
        <button className="tf-pb-btn" onClick={onStepForward} title="Step forward">
          ▶
        </button>
        <button className="tf-pb-btn" onClick={onJumpForward} title="Jump forward 5 bars">
          ▶▶
        </button>
        <button className="tf-pb-btn" onClick={onGoToEnd} title="Go to end">
          ▶|
        </button>

        <div className="tf-pb-speed">
          Speed:
          <select
            className="bt-select tf-pb-speed-select"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}\u00D7
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tf-playback-scrubber">
        <input
          type="range"
          className="tf-scrubber-range"
          min={0}
          max={Math.max(0, totalFrames - 1)}
          value={currentIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
        />
        <div className="tf-scrubber-info">
          <span className="tf-scrubber-date">{currentDate.slice(0, 10)}</span>
          <span className="tf-scrubber-pos">
            {currentIndex + 1} / {totalFrames}
          </span>
        </div>
      </div>
    </div>
  );
}
