/**
 * ============================================================================
 * File: public/scripts/boot.js
 *
 * Purpose:
 *   Central policy bootstrap for layout, text, and flip behaviors.
 *
 * Primary Responsibility:
 *   Activate all policy engines in a single deterministic entry point.
 *
 * Design Intent:
 *   - Maintain architectural clarity via centralized initialization.
 *   - Keep policy activation decoupled from HTML.
 *   - Ensure clean teardown support.
 *
 * Non-Goals:
 *   - Does not implement business logic.
 *   - Does not contain layout or animation logic directly.
 *
 * Dependencies:
 *   - layout-policy.js
 *   - text-fit.js
 *   - flip-cards.js
 *
 * Constraints & Assumptions:
 *   - DOM is ready before policy activation.
 *
 * Extension Points:
 *   - Toggle policies on/off via configuration.
 * ============================================================================
 */

import { enableLayoutPolicy } from "./layout-policy.js";
import { enableFitText } from "./text-fit.js";
import { enableFlipCards } from "./flip-cards.js";

const cleanups = [];

/**
 * Initialize all UI policies.
 */
function main() {
  const cardsContainer = document.querySelector('[data-layout-policy="cards"]');

  if (cardsContainer) {
    cleanups.push(enableLayoutPolicy(cardsContainer, { gapPx: 16 }));
  }

  cleanups.push(enableFitText('[data-fit-text="on"]'));

  cleanups.push(enableFlipCards({
    flipSelector: "[data-flip]",
    allowCardClick: true,
  }));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main, { once: true });
} else {
  main();
}

window.__POLICY_CLEANUP__ = () => cleanups.forEach((fn) => fn?.());