import { useState, useMemo } from 'react';
import type { Position, GroupingMode } from '../../../types/portfolio';
import { PositionRow } from './PositionRow';
import { PositionGroupHeader } from './PositionGroupHeader';

interface Props {
  positions: Position[];
  grouping: GroupingMode;
  onGroupingChange: (g: GroupingMode) => void;
  onRefresh: () => void;
}

type SortKey = 'symbol' | 'market_value' | 'day_pnl' | 'total_pnl' | 'weight_pct' | 'quantity' | 'current_price';
type SortDir = 'asc' | 'desc';

function groupPositions(positions: Position[], mode: GroupingMode) {
  if (mode === 'none') return { Positions: positions };

  const groups: Record<string, Position[]> = {};
  for (const pos of positions) {
    let key: string;
    switch (mode) {
      case 'source':
        if (pos.attributions.length === 0) {
          key = 'Manual Trades';
        } else if (pos.attributions.length === 1) {
          key = pos.attributions[0].source_name;
        } else {
          // Position has multiple attributions — put under each source
          for (const attr of pos.attributions) {
            const k = attr.source_name;
            if (!groups[k]) groups[k] = [];
            groups[k].push(pos);
          }
          continue;
        }
        break;
      case 'asset_class':
        key = pos.asset_class.charAt(0).toUpperCase() + pos.asset_class.slice(1) + 's';
        break;
      case 'sector':
        key = 'General'; // Sector info not always available; fallback
        break;
      default:
        key = 'All';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(pos);
  }
  return groups;
}

export function PositionsPanel({ positions, grouping, onGroupingChange, onRefresh }: Props) {
  const [searchFilter, setSearchFilter] = useState('');
  const [assetClassFilter, setAssetClassFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('market_value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const filteredPositions = useMemo(() => {
    let filtered = positions;

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (p) => p.symbol.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
      );
    }

    if (assetClassFilter !== 'all') {
      filtered = filtered.filter((p) => p.asset_class === assetClassFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case 'market_value':
          cmp = a.market_value - b.market_value;
          break;
        case 'day_pnl':
          cmp = a.day_pnl.amount - b.day_pnl.amount;
          break;
        case 'total_pnl':
          cmp = a.total_pnl.amount - b.total_pnl.amount;
          break;
        case 'weight_pct':
          cmp = a.weight_pct - b.weight_pct;
          break;
        case 'quantity':
          cmp = a.quantity - b.quantity;
          break;
        case 'current_price':
          cmp = a.current_price - b.current_price;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return filtered;
  }, [positions, searchFilter, assetClassFilter, sortKey, sortDir]);

  const groups = useMemo(() => groupPositions(filteredPositions, grouping), [filteredPositions, grouping]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function toggleGroup(name: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const assetClasses = useMemo(() => {
    const classes = new Set(positions.map((p) => p.asset_class));
    return ['all', ...Array.from(classes)];
  }, [positions]);

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '';

  if (positions.length === 0) {
    return (
      <div className="poc-positions-panel">
        <div className="poc-positions-toolbar">
          <h3 className="poc-panel-title">Positions</h3>
        </div>
        <div className="poc-positions-empty">
          <div className="poc-empty-icon">&#x1F4C2;</div>
          <p className="poc-empty-title">No open positions</p>
          <p className="poc-empty-desc">Start by creating a strategy or placing a manual trade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poc-positions-panel">
      <div className="poc-positions-toolbar">
        <h3 className="poc-panel-title">Positions ({positions.length})</h3>
        <div className="poc-positions-controls">
          <input
            className="poc-search-input"
            type="text"
            placeholder="Search symbol or name..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <div className="poc-filter-pills">
            {assetClasses.map((ac) => (
              <button
                key={ac}
                className={`poc-filter-pill ${assetClassFilter === ac ? 'active' : ''}`}
                onClick={() => setAssetClassFilter(ac)}
              >
                {ac === 'all' ? 'All' : ac.charAt(0).toUpperCase() + ac.slice(1) + 's'}
              </button>
            ))}
          </div>
          <select
            className="poc-group-select"
            value={grouping}
            onChange={(e) => onGroupingChange(e.target.value as GroupingMode)}
          >
            <option value="source">Group by Strategy/Agent</option>
            <option value="asset_class">Group by Asset Class</option>
            <option value="sector">Group by Sector</option>
            <option value="none">No Grouping</option>
          </select>
        </div>
      </div>

      <div className="poc-positions-table-wrap">
        <table className="poc-positions-table">
          <thead>
            <tr>
              <th className="poc-th-sortable" onClick={() => handleSort('symbol')}>
                Symbol{sortIndicator('symbol')}
              </th>
              <th>Name</th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('quantity')}>
                Qty{sortIndicator('quantity')}
              </th>
              <th>Side</th>
              <th className="poc-th-right">Avg Cost</th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('current_price')}>
                Price{sortIndicator('current_price')}
              </th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('market_value')}>
                Mkt Value{sortIndicator('market_value')}
              </th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('weight_pct')}>
                Weight{sortIndicator('weight_pct')}
              </th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('day_pnl')}>
                Day P&L{sortIndicator('day_pnl')}
              </th>
              <th className="poc-th-sortable poc-th-right" onClick={() => handleSort('total_pnl')}>
                Total P&L{sortIndicator('total_pnl')}
              </th>
              <th className="poc-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([groupName, groupPositions]) => {
              const isCollapsed = collapsedGroups.has(groupName);
              const groupPnl = groupPositions.reduce((sum, p) => sum + p.day_pnl.amount, 0);
              return (
                <PositionGroupHeader
                  key={groupName}
                  name={groupName}
                  count={groupPositions.length}
                  dayPnl={groupPnl}
                  collapsed={isCollapsed}
                  onToggle={() => toggleGroup(groupName)}
                  showHeader={grouping !== 'none'}
                >
                  {!isCollapsed &&
                    groupPositions.map((pos) => (
                      <PositionRow
                        key={pos.id}
                        position={pos}
                        expanded={expandedId === pos.id}
                        onToggleExpand={() =>
                          setExpandedId((prev) => (prev === pos.id ? null : pos.id))
                        }
                        onRefresh={onRefresh}
                      />
                    ))}
                </PositionGroupHeader>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
