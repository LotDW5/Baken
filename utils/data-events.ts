type Listener = () => void;
const listeners: Listener[] = [];

export function onDataChange(fn: Listener) {
  listeners.push(fn);
  try { console.log('[data-events] onDataChange: listener added, total=', listeners.length); } catch (e) {}
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
    try { console.log('[data-events] onDataChange: listener removed, total=', listeners.length); } catch (e) {}
  };
}

export function emitDataChange() {
  try { console.log('[data-events] emitDataChange: emitting to', listeners.length, 'listeners'); } catch (e) {}
  listeners.slice().forEach((fn) => {
    try { fn(); } catch (err) { console.error('[data-events] listener error', err); }
  });
}

export default { onDataChange, emitDataChange };
