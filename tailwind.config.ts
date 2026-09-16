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
        paper: c("--c-paper"),
        surface: c("--c-surface"),
        panel: c("--c-panel"),
        line: { DEFAULT: c("--c-line"), strong: c("--c-line-strong") },
        accent: { DEFAULT: c("--c-accent"), soft: c("--c-accent-soft") },
        warn: c("--c-warn"),
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      /* ★★ **칸 폭은 플랫폼 정본이다**(2026-09-16). 우산 1048 · RadiMeter 1024(+20 여백) 는
         둘 다 **글줄 984px** 이고 1280px 에서 **좌측 148px** 에서 시작하는데, 이 lab 만
         1152 에 좌측 80px 이었다 — 오리진을 넘나들 때 글줄이 68px 왼쪽으로 튀었다.
         값은 우산과 **같은 1048px**(좌우 32px 여백 포함 = 글줄 984px)이다. */
      maxWidth: { content: "1048px" },
    },
  },
} satisfies Config;
