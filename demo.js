"use strict";
(() => {
  const board = document.getElementById("providers");
  let replay = 0;
  const examples = [
    [
      "claude",
      "Claude",
      "Max · 예시",
      [
        ["Session", 72],
        ["Weekly", 91],
      ],
    ],
    [
      "codex",
      "Codex",
      "ChatGPT Pro · 예시",
      [
        ["5-hour", 84],
        ["Weekly", 63],
      ],
    ],
    [
      "gemini",
      "Gemini",
      "Standard · 예시",
      [
        ["Pro model tier", 88],
        ["Flash model tier", 96],
      ],
    ],
    ["grok", "Grok", "플랜 알 수 없음", [["사용량", null]]],
  ];
  const el = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  function render() {
    board.replaceChildren();
    const scenario = document.getElementById("scenario").value;
    for (const [id, name, plan, windows] of examples) {
      const article = el(
        "article",
        "",
        `provider ${scenario === "stale" ? "is-stale" : ""}`,
      );
      const header = el("div", "", "provider-header"),
        title = el("div", "", "provider-title"),
        icon = el("img", "", "provider-icon");
      icon.src = `icons/${id}.svg`;
      icon.alt = "";
      const identity = el("div");
      identity.append(el("h3", name), el("div", plan, "plan"));
      title.append(icon, identity);
      header.append(
        title,
        el("span", scenario === "stale" ? "DEMO · STALE" : "DEMO", "badge"),
      );
      article.append(header);
      for (const [label, value] of windows) {
        const amount = scenario === "unknown" ? null : value;
        const row = el("div", "", "window"),
          heading = el("div", "", "window-heading");
        heading.append(
          el("span", label),
          el("strong", amount === null ? "알 수 없음" : `${amount}% 남음`),
        );
        row.append(heading);
        if (amount !== null) {
          const bar = el("progress", "", "track");
          bar.max = 100;
          bar.value = amount;
          bar.setAttribute("aria-label", `${name} ${label} 예시 남은 사용량`);
          bar.setAttribute("aria-valuetext", `${amount}% 남음${scenario === "stale" ? " · 오래된 예시, 현재 사용량 아님" : " · 고정 예시"}`);
          row.append(bar);
        } else
          row.append(el("p", "측정된 사용량 없음 · 추정 막대 없음", "unknown"));
        row.append(el("p", "리셋 · 예시에서는 제공하지 않음", "reset"));
        article.append(row);
      }
      article.append(
        el(
          "div",
          scenario === "stale"
            ? "DEMO · 오래된 고정 예시 / 실제 관측 없음"
            : "DEMO · 고정 예시 / 실제 관측 없음",
          "source",
        ),
      );
      board.append(article);
    }
    document.getElementById("demo-status").textContent =
      scenario === "unknown"
        ? "DEMO · 알 수 없음은 0%가 아닙니다"
        : scenario === "stale"
          ? "DEMO · 오래된 관측 상태의 예시입니다. 현재 사용량이 아닙니다"
          : "DEMO · 고정 예시 데이터입니다. 실시간 연결 없음";
  }
  document.getElementById("scenario").addEventListener("change", render);
  document.getElementById("demo-refresh").addEventListener("click", () => {
    render();
    document.getElementById("demo-status").textContent +=
      ` · 예시 다시 보기 ${++replay}회 (네트워크 갱신 없음)`;
  });
  render();
})();
