import type { Config } from "tailwindcss";
/** 채널 삼값 토큰을 알파와 함께 받는다 — 이래야 `bg-accent/40` 이 동작한다. */
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;
/** 흑연 + 신호 앰버 — 우산·RadiMeter 와 같은 계열을 쓴다.
 *  ★ 앰버는 활성·포커스·기준선 전용이다. 판정 의미(좋다/나쁘다)에 쓰지 않는다. */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: c("--c-ink"), muted: c("--c-ink-muted"), faint: c("--c-ink-faint") },
        surface: c("--c-surface"),
        panel: c("--c-panel"),
        line: c("--c-line"),
        accent: { DEFAULT: c("--c-accent"), soft: c("--c-accent-soft") },
        warn: c("--c-warn"),
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { content: "72rem" },
    },
  },
} satisfies Config;
