const projectVersion = "0.3.1-beta";
const badge = document.createElement("span");
badge.className = "project-version";
badge.textContent = "ver. " + projectVersion;
Object.assign(badge.style, {
  position: "fixed",
  right: "calc(12px + env(safe-area-inset-right, 0px))",
  bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
  zIndex: "100",
  padding: "6px 10px",
  border: "1px solid var(--line, #ffffff17)",
  borderRadius: "30px",
  background: "#19231eec",
  color: "var(--text, #f0f0e7)",
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
  fontSize: "11px",
  fontWeight: "600",
  lineHeight: "1.4",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  backdropFilter: "blur(8px)",
  letterSpacing: ".06em",
});
const accent = document.createElement("span");
accent.setAttribute("aria-hidden", "true");
Object.assign(accent.style, {
  display: "inline-block",
  width: "10px",
  height: "1px",
  marginRight: "7px",
  verticalAlign: "middle",
  background: "var(--green, #d6fa76)",
});
badge.prepend(accent);
document.body.append(badge);
