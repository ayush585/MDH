// MV3 service worker — minimal, just handles extension install lifecycle
chrome.runtime.onInstalled.addListener(() => {
  console.log('[DOM Hijacker] Extension installed.');
});
