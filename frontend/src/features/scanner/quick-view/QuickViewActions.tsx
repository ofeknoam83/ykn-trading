import { useState } from 'react';
import { ActionMenu } from '../pipeline/ActionMenu';
import type { ScanResult } from '../types/scanner.types';

interface QuickViewActionsProps {
  result: ScanResult;
}

export function QuickViewActions({ result }: QuickViewActionsProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);

  return (
    <>
      <div className="sc-quick-view-actions">
        <button className="sc-quick-view-action-btn" onClick={() => setShowActionMenu(true)}>
          Act on {result.symbol}
        </button>
      </div>

      {showActionMenu && (
        <ActionMenu
          result={result}
          onClose={() => setShowActionMenu(false)}
        />
      )}
    </>
  );
}
