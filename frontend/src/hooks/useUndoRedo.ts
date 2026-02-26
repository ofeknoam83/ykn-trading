import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initial: T, maxHistory = 50) {
  const [state, setState] = useState(initial);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof newState === 'function' ? (newState as (p: T) => T)(prev) : newState;
      setPast(p => [...p.slice(-maxHistory + 1), prev]);
      setFuture([]);
      return next;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setState(current => {
        setFuture(f => [current, ...f]);
        return previous;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setState(current => {
        setPast(p => [...p, current]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setState(newState);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
