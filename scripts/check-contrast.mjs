// scripts/check-contrast.mjs
// Contrast ratio checker for color tokens defined in devpost/spec.md Section 5.
// Evaluates compliance with WCAG 2.1 AA requirements.

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance({ r, g, b }) {
  const sRGB = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const colorPairs = [
  {
    name: "Primary text on warm off-white background",
    fg: "#1C1B19",
    bg: "#FAFAF7",
    role: "body",
    target: 4.5,
  },
  {
    name: "Primary text on white card surface",
    fg: "#1C1B19",
    bg: "#FFFFFF",
    role: "body",
    target: 4.5,
  },
  {
    name: "Primary text on incident report tinted background",
    fg: "#1C1B19",
    bg: "#F3F1EC",
    role: "body",
    target: 4.5,
  },
  {
    name: "Secondary text on warm off-white background",
    fg: "#5F5C55",
    bg: "#FAFAF7",
    role: "body",
    target: 4.5,
  },
  {
    name: "Secondary text on white card surface",
    fg: "#5F5C55",
    bg: "#FFFFFF",
    role: "body",
    target: 4.5,
  },
  {
    name: "Secondary text on incident report tinted background",
    fg: "#5F5C55",
    bg: "#F3F1EC",
    role: "body",
    target: 4.5,
  },
  {
    name: "White text on solid accent button",
    fg: "#FFFFFF",
    bg: "#C2410C",
    role: "button",
    target: 4.5,
  },
  {
    name: "Accent text on white surface (Moderate badge)",
    fg: "#C2410C",
    bg: "#FFFFFF",
    role: "badge",
    target: 4.5,
  },
  {
    name: "Accent text on light accent tint (Major badge)",
    fg: "#C2410C",
    bg: "#FBE9DF",
    role: "badge-large",
    target: 3.0,
  },
];

console.log("=== WCAG 2.1 Contrast Ratio Verification ===");
console.log("Requirement: Normal text >= 4.5:1 (AA), Large/UI >= 3.0:1 (AA)\n");

let allPassed = true;

for (const pair of colorPairs) {
  const ratio = contrastRatio(pair.fg, pair.bg);
  const passed = ratio >= pair.target;
  if (!passed) allPassed = false;

  const status = passed ? "PASS" : "FAIL";
  console.log(
    `[${status}] ${pair.name}\n` +
      `       Foreground: ${pair.fg} | Background: ${pair.bg}\n` +
      `       Ratio: ${ratio.toFixed(2)}:1 (Target: >= ${pair.target}:1)\n`
  );
}

if (!allPassed) {
  console.error("FAILED: One or more color pairs do not meet the contrast threshold.");
  process.exit(1);
} else {
  console.log("PASSED: All color token pairs meet WCAG AA contrast thresholds.");
}
