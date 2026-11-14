const projectVersion = "0.3.1-beta";
const badge = document.createElement("span");
badge.className = "project-version";
badge.textContent = "ver. " + projectVersion;
Object.assign(badge.style, {
  position: "fixed",
  right: "calc(12px + env(safe-area-inset-right, 0px))",
  bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
  zIndex: "100",
  padding: "5px 10px",
  border: "1px solid var(--line, #ffffff17)",
  borderRadius: "999px",
  background: "var(--panel, #18201d)",
  color: "var(--green, #d6fa76)",
  fontFamily: "var(--heading, system-ui), sans-serif",
  fontSize: "11px",
  fontWeight: "600",
  lineHeight: "1.4",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  pointerEvents: "none",
});
document.body.append(badge);
