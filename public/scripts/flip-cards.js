/**
 * ============================================================================
 * File: public/scripts/flip-cards.js
 *
 * Purpose:
 *   Provide deterministic card flip behavior by toggling a state class.
 *
 * Primary Responsibility:
 *   Manage `.is-flipped` state for card elements in response to user input.
 *
 * Design Intent:
 *   - Separate Policy from Mechanism:
 *       Policy: `.is-flipped` state class
 *       Mechanism: CSS 3D transform in components-cards.css
 *   - Use event delegation to avoid per-card listeners.
 *   - Maintain accessibility via keyboard support.
 *
 * Non-Goals:
 *   - Does not implement animation (CSS handles transitions).
 *   - Does not manage routing, persistence, or business logic.
 *
 * Dependencies:
 *   - DOM APIs
 *
 * Constraints & Assumptions:
 *   - Card root is identifiable via `[data-card]` or `.card-node`.
 *   - Flip controls use `[data-flip]`.
 *
 * Extension Points:
 *   - Custom flip trigger selector.
 *   - Disable card-wide click toggle.
 * ============================================================================
 */

/**
 * Locate nearest card container from a DOM element.
 *
 * @param {Element | null} el - Starting element.
 * @returns {HTMLElement | null} Card container or null.
 */
function findCard(el) {
  if (!(el instanceof Element)) return null;
  return el.closest("[data-card], .card-node");
}

/**
 * Toggle flip state on a card element.
 *
 * Purpose:
 *   Switch `.is-flipped` class on/off.
 *
 * Design Intent:
 *   Keep flip logic state-based and declarative.
 *
 * @param {HTMLElement} card - Card root element.
 */
function toggle(card) {
  card.classList.toggle("is-flipped");
}

/**
 * Enable flip behavior globally.
 *
 * Purpose:
 *   Attach delegated click and keyboard handlers.
 *
 * Design Intent:
 *   Single registration point to maintain architectural clarity.
 *
 * @param {Object} [options]
 * @param {string} [options.flipSelector="[data-flip]"]
 * @param {boolean} [options.allowCardClick=true]
 * @returns {Function} Cleanup function.
 */
export function enableFlipCards(options = {}) {
  const {
    flipSelector = "[data-flip]",
    allowCardClick = true,
  } = options;

  function handleClick(ev) {
    const target = ev.target;
    if (!(target instanceof Element)) return;

    const flipControl = target.closest(flipSelector);
    if (flipControl) {
      const card = findCard(flipControl);
      if (card) toggle(card);
      return;
    }

    if (allowCardClick) {
      const card = findCard(target);
      if (card) toggle(card);
    }
  }

  function handleKeydown(ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;

    const target = ev.target;
    if (!(target instanceof Element)) return;

    const flipControl = target.closest(flipSelector);
    if (!flipControl) return;

    ev.preventDefault();

    const card = findCard(flipControl);
    if (card) toggle(card);
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("click", handleClick);
    document.removeEventListener("keydown", handleKeydown);
  };
}