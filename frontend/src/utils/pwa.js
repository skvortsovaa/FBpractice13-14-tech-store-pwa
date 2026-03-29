export function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function isSafariBrowser() {
  return /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
}
