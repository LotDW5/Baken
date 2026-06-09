type Listener = () => void;
const listeners: Listener[] = [];

export function onThemeChange(fn: Listener) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitThemeChange() {
  listeners.slice().forEach((fn) => fn());
}

export default { onThemeChange, emitThemeChange };
