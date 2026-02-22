/**
 * @file text-fit.js
 * @description
 *  Fit-to-box 텍스트 정책.
 *
 *  문제:
 *  - CSS만으로 "모든 화면에서 텍스트가 절대 깨지지 않게"를 100% 보장할 수 없다.
 *  - 특정 영역은 오버플로우가 발생하면 폰트를 자동으로 줄여 맞춰야 한다.
 *
 *  설계 의도:
 *  - data-fit-text="on" 요소만 대상으로 한다.
 *  - ResizeObserver로 요소/부모 변화에 반응한다.
 *  - 이분탐색으로 font-size를 빠르게 결정한다.
 *
 *  안전장치:
 *  - min/max 폰트 크기 제한 (data-fit-min, data-fit-max)
 *  - 너무 많은 요소에 무차별 적용 금지(정책적으로 필요한 곳만)
 */

/**
 * Fit text to its element height/width constraints by decreasing font size.
 *
 * @param {HTMLElement} el
 * @param {Object} [opts]
 * @param {number} [opts.minPx=12]
 * @param {number} [opts.maxPx=28]
 */
export function fitText(el, opts = {}){
  const minPx = typeof opts.minPx === "number" ? opts.minPx : 12;
  const maxPx = typeof opts.maxPx === "number" ? opts.maxPx : 28;

  // Reset to max first, then shrink
  el.style.fontSize = `${maxPx}px`;

  // If it already fits, done.
  if (isOverflowing(el) === false) return;

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;

  while (lo <= hi){
    const mid = Math.floor((lo + hi) / 2);
    el.style.fontSize = `${mid}px`;

    if (isOverflowing(el)){
      hi = mid - 1;
    } else {
      best = mid;
      lo = mid + 1;
    }
  }

  el.style.fontSize = `${best}px`;
}

/**
 * Overflow check based on scroll size vs client size.
 * Note: This checks both height and width.
 *
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function isOverflowing(el){
  const overflowH = el.scrollHeight - el.clientHeight > 1;
  const overflowW = el.scrollWidth - el.clientWidth > 1;
  return overflowH || overflowW;
}

/**
 * Enable fit-text policy on all elements matching selector.
 *
 * @param {string} selector
 * @returns {() => void} cleanup
 */
export function enableFitText(selector = '[data-fit-text="on"]'){
  const targets = Array.from(document.querySelectorAll(selector));

  const observers = targets.map((el) => {
    const minPx = parseInt(el.getAttribute("data-fit-min") || "12", 10);
    const maxPx = parseInt(el.getAttribute("data-fit-max") || "28", 10);

    // 첫 적용
    queueMicrotask(() => fitText(el, { minPx, maxPx }));

    // 변화 감지
    const ro = new ResizeObserver(() => fitText(el, { minPx, maxPx }));
    ro.observe(el);

    // 폰트 로딩 지연 대응(폰트가 늦게 로드되면 치수가 바뀜)
    if (document.fonts && typeof document.fonts.ready?.then === "function"){
      document.fonts.ready.then(() => fitText(el, { minPx, maxPx })).catch(() => {});
    }

    return ro;
  });

  return () => observers.forEach((ro) => ro.disconnect());
}