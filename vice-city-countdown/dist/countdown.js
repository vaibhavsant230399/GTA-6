// Calendar-date countdown. Local midnight is a display convention, not a confirmed unlock time.
export function getReleaseTarget() {
  return new Date(2026, 10, 19, 0, 0, 0, 0).getTime();
}
export function getRemaining(target, now = Date.now()) {
  const total = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    complete: total === 0
  };
}
