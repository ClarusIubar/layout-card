/**
 * @file layout-policy.js
 * @description
 *  "minmax 하드코딩"을 줄이기 위한 레이아웃 정책 엔진.
 *
 *  설계 의도:
 *  - grid의 minmax(min, 1fr)에서 min 값을 직접 박는 대신
 *    컨테이너 폭을 기준으로 "정책(Policy)"에 따라 자동 계산해 CSS 변수로 주입한다.
 *  - 사용자는 "열 수 정책"만 정한다. (예: 좁으면 1열, 넓으면 4열 등)
 *
 *  핵심 출력:
 *  - 대상 요소에 `--card-min` CSS 변수를 설정한다.
 *
 *  사용법:
 *  - cards 컨테이너에 `data-layout-policy="cards"` 부여
 *  - boot.js에서 enableLayoutPolicy() 호출
 */

/**
 * Compute column count based on container width.
 * This is a *policy* function: tune thresholds here, not in CSS scattered values.
 *
 * @param {number} width - Container content width in px.
 * @returns {number} columns
 */
export function chooseColumns(width){
  if (width < 520) return 1;
  if (width < 900) return 2;
  if (width < 1200) return 3;
  if (width < 1600) return 4;
  return 5;
}

/**
 * Compute a safe card minimum width given container width and desired columns.
 * Gap is approximated from CSS token fallback; JS keeps it stable even before CSS computed.
 *
 * @param {number} width - Container content width in px.
 * @param {number} cols - Desired number of columns.
 * @param {number} gapPx - Gap between columns in px.
 * @returns {number} minCardPx - Minimum card width in px.
 */
export function computeCardMin(width, cols, gapPx = 16){
  const totalGaps = gapPx * Math.max(0, cols - 1);
  const raw = Math.floor((width - totalGaps) / cols);
  // 안전장치: 너무 작으면 텍스트가 붕괴 -> 최소 240px로 클램프
  return Math.max(raw, 240);
}

/**
 * Enable responsive layout policy for a grid-like container.
 *
 * @param {HTMLElement} el - Target container (e.g., .cards)
 * @param {Object} [opts]
 * @param {number} [opts.gapPx=16] - Column gap approximation in px.
 * @returns {() => void} cleanup - Disconnect observer.
 */
export function enableLayoutPolicy(el, opts = {}){
  const gapPx = typeof opts.gapPx === "number" ? opts.gapPx : 16;

  if (!(el instanceof HTMLElement)){
    throw new TypeError("enableLayoutPolicy: el must be an HTMLElement");
  }

  const ro = new ResizeObserver((entries) => {
    const entry = entries[0];
    const w = entry.contentRect.width;

    const cols = chooseColumns(w);
    const minPx = computeCardMin(w, cols, gapPx);

    el.style.setProperty("--card-min", `${minPx}px`);
    el.style.setProperty("--_policy-cols", String(cols)); // 디버그/관찰용
  });

  ro.observe(el);

  return () => ro.disconnect();
}