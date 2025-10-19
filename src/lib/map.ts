/**
 * Generic lazy map initializer.
 * You can plug your favorite map lib inside `init()`; the helper ensures
 * re-init when container becomes visible (e.g., after tab switch).
 */
export function lazyMap(containerId: string, init: (el: HTMLElement) => void) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        init(el);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(el);

  const onShow = () => init(el);
  document.addEventListener("visibilitychange", onShow);
  window.addEventListener("resize", onShow);

  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", onShow);
    window.removeEventListener("resize", onShow);
  };
}
