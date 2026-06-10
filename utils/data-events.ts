type Listener = () => void;
const listeners: Listener[] = [];

export function onDataChange(fn: Listener) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitDataChange() {
  listeners.slice().forEach((fn) => fn());
}

export default { onDataChange, emitDataChange };
