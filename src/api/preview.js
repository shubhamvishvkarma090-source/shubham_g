/**
 * Dev/demo helpers for screenshots and QA:
 *   ?state=loading | error | empty   → force a UI state for data sections
 *   ?demo=levelup                    → open the level-up celebration on load
 */
function param(name) {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

export function getPreviewState() {
  const v = param('state');
  return ['loading', 'error', 'empty'].includes(v) ? v : null;
}

export function isLevelUpDemo() {
  return param('demo') === 'levelup';
}
