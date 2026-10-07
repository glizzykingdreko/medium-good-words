const PREFS_KEY = "gw-solver-ui";

const PANEL_CSS = `
:host { all: initial; }
.panel {
  --bg: oklch(0.992 0.004 95);
  --bg-2: oklch(0.968 0.006 95);
  --line: oklch(0.912 0.007 95);
  --ink: oklch(0.235 0.012 95);
  --mute: oklch(0.54 0.012 95);
  --faint: oklch(0.72 0.01 95);
  --accent: oklch(0.53 0.135 148);
  --accent-ink: oklch(0.985 0.01 148);
  --accent-soft: oklch(0.94 0.045 148);
  --gold: oklch(0.955 0.06 92);
  --gold-ink: oklch(0.42 0.09 80);
  --bad: oklch(0.6 0.19 27);
  --bad-soft: oklch(0.95 0.035 27);
  --shadow: 0 1px 2px oklch(0.2 0.01 95 / 0.06), 0 12px 32px -8px oklch(0.2 0.01 95 / 0.18);
  position: fixed;
  z-index: 2147483647;
  width: 288px;
  max-height: calc(100vh - 112px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
  font: 13px/1.4 sohne, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  .panel {
    --bg: oklch(0.215 0.008 95);
    --bg-2: oklch(0.25 0.009 95);
    --line: oklch(0.32 0.01 95);
    --ink: oklch(0.94 0.008 95);
    --mute: oklch(0.7 0.01 95);
    --faint: oklch(0.5 0.01 95);
    --accent: oklch(0.68 0.14 148);
    --accent-ink: oklch(0.2 0.03 148);
    --accent-soft: oklch(0.32 0.05 148);
    --gold: oklch(0.33 0.05 85);
    --gold-ink: oklch(0.86 0.09 88);
    --bad: oklch(0.7 0.16 27);
    --bad-soft: oklch(0.33 0.06 27);
    --shadow: 0 12px 32px -8px oklch(0 0 0 / 0.5);
  }
}
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }

.bar { display: flex; align-items: center; gap: 8px; padding: 12px 12px 0 16px; cursor: grab; user-select: none; }
.bar:active { cursor: grabbing; }
.title { font-weight: 600; }
.count { color: var(--mute); font-variant-numeric: tabular-nums; }
.collapse { margin-left: auto; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 6px; color: var(--mute); transition: background 0.15s, color 0.15s; }
.collapse:hover { background: var(--bg-2); color: var(--ink); }
.collapse svg { transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.minimized .collapse svg { transform: rotate(180deg); }
.bar, .score, .meter, .actions { flex-shrink: 0; }

.score { display: flex; align-items: baseline; gap: 6px; padding: 10px 16px 0; font-variant-numeric: tabular-nums; }
.score b { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
.score span { color: var(--mute); }
.meter { height: 4px; margin: 8px 16px 0; border-radius: 99px; background: var(--bg-2); overflow: hidden; }
.meter i { display: block; height: 100%; background: var(--accent); transform-origin: left; transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }

.actions { display: flex; align-items: center; gap: 12px; margin: 14px 16px; }
.minimized .actions { margin-bottom: 12px; }
.play-all { flex: 1; height: 36px; border-radius: 8px; overflow: hidden; background: var(--accent); color: var(--accent-ink); font-weight: 600; transition: filter 0.15s, background 0.15s; }
.play-all:hover { filter: brightness(1.06); }
.play-all:active { filter: brightness(0.96); }
.play-all.running { background: var(--ink); color: var(--bg); }
.play-all:disabled { background: var(--bg-2); color: var(--faint); cursor: default; filter: none; }
.minimized .body { display: none; }
.auto { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--mute); }
.auto[aria-checked="true"] { color: var(--ink); }
.switch { position: relative; width: 28px; height: 16px; border-radius: 99px; background: var(--line); transition: background 0.15s; }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--bg); box-shadow: 0 1px 2px oklch(0.2 0.01 95 / 0.25); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
.auto[aria-checked="true"] .switch { background: var(--accent); }
.auto[aria-checked="true"] .switch::after { transform: translateX(12px); }

.body { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--line); }
.bonus { display: block; width: 100%; padding: 12px 16px; text-align: left; background: var(--gold); border-bottom: 1px solid var(--line); transition: filter 0.15s; }
.bonus:hover { filter: brightness(0.98); }
.bonus[hidden] { display: none; }
.bonus small { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold-ink); }
.bonus strong { display: block; margin-top: 2px; font-size: 16px; font-weight: 600; }
.bonus p { margin: 2px 0 0; color: var(--mute); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bonus.found strong::after { content: " \\2713"; color: var(--accent); }

.tools { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; font-size: 12px; color: var(--mute); }
.chip { padding: 3px 8px; border: 1px solid var(--line); border-radius: 99px; transition: background 0.15s, border-color 0.15s, color 0.15s; }
.chip[aria-pressed="true"] { background: var(--accent-soft); border-color: transparent; color: var(--ink); }

.list { overflow: auto; padding: 0 8px 8px; overscroll-behavior: contain; }
.group { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; padding: 8px 8px 4px; background: var(--bg); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mute); font-variant-numeric: tabular-nums; }
.group.done { color: var(--accent); }
.row { display: flex; align-items: center; width: 100%; padding: 5px 8px; border-radius: 6px; text-align: left; font-size: 14px; transition: background 0.12s, color 0.2s; }
.row:hover { background: var(--bg-2); }
.row .state { margin-left: auto; font-size: 11px; color: var(--faint); opacity: 0; transition: opacity 0.15s; }
.row:hover .state, .row:focus-visible .state { opacity: 1; }
.row.sent .state { opacity: 1; color: var(--mute); }
.row.found { color: var(--faint); cursor: default; }
.row.found:hover { background: none; }
.row.found .state { opacity: 1; color: var(--accent); }
.row.rejected { background: var(--bad-soft); }
.row.rejected .state { opacity: 1; color: var(--bad); }
.hide-found .row.found, .hide-found .group.done { display: none; }

.skeleton { height: 22px; margin: 4px 8px; border-radius: 6px; background: var(--bg-2); animation: pulse 1.2s ease-in-out infinite; }
.skeleton:nth-child(2n) { width: 60%; }
.empty { padding: 24px 16px; text-align: center; color: var(--mute); }
@keyframes pulse { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

const PANEL_HTML = `
<style>${PANEL_CSS}</style>
<section class="panel" role="complementary" aria-label="Good Words solver">
  <div class="bar">
    <span class="title">Good Words</span>
    <span class="count"></span>
    <button class="collapse" type="button" aria-label="Collapse">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg>
    </button>
  </div>
  <div class="score"><b>0</b><span></span></div>
  <div class="meter"><i></i></div>
  <div class="actions">
    <button class="play-all" type="button"><span></span></button>
    <button class="auto" type="button" role="switch" aria-checked="false" title="Play every new board as soon as it is dealt"><span class="switch"></span>Auto</button>
  </div>
  <div class="body">
    <button class="bonus" type="button" hidden><small>Bonus word, double points</small><strong></strong><p></p></button>
    <div class="tools">
      <span>Hover to trace, click to play</span>
      <button class="chip" type="button" aria-pressed="false">Hide found</button>
    </div>
    <div class="list"></div>
  </div>
</section>
`;

const prefs = loadPrefs();
const sentAt = new Map();
const rejected = new Set();

let solution = [];
let boardKey = null;
let autoPlayedKey = null;
let host = null;
let ui = null;
let rows = [];
let groups = [];
let autoTimer = null;
let autoLeft = 0;

function loadPrefs() {
  const defaults = {
    top: 88,
    right: 16,
    hideFound: false,
    autoPlay: false,
  };
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem(PREFS_KEY)),
    };
  } catch {
    return defaults;
  }
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

function mountPanel() {
  if (ui) {
    return;
  }
  // A shadow root keeps Medium's CSS out, and our updates never reach the page observer.
  host = document.createElement("gw-solver");
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = PANEL_HTML;
  document.body.appendChild(host);

  const find = (selector) => root.querySelector(selector);
  ui = {
    panel: find(".panel"),
    bar: find(".bar"),
    count: find(".count"),
    collapse: find(".collapse"),
    score: find(".score b"),
    scoreDetail: find(".score span"),
    meter: find(".meter i"),
    playAll: find(".play-all"),
    playAllLabel: find(".play-all span"),
    auto: find(".auto"),
    bonus: find(".bonus"),
    chip: find(".chip"),
    list: find(".list"),
  };

  ui.panel.style.top = `${prefs.top}px`;
  ui.panel.style.right = `${prefs.right}px`;
  // Always opens collapsed, only position, filters and Auto are remembered.
  ui.panel.classList.add("minimized");
  ui.collapse.setAttribute("aria-label", "Expand");
  ui.list.classList.toggle("hide-found", prefs.hideFound);
  ui.chip.setAttribute("aria-pressed", String(prefs.hideFound));

  ui.collapse.addEventListener("click", () => {
    const minimized = ui.panel.classList.toggle("minimized");
    ui.collapse.setAttribute("aria-label", minimized ? "Expand" : "Collapse");
  });
  ui.chip.addEventListener("click", () => {
    prefs.hideFound = !prefs.hideFound;
    ui.list.classList.toggle("hide-found", prefs.hideFound);
    ui.chip.setAttribute("aria-pressed", String(prefs.hideFound));
    savePrefs();
  });
  ui.playAll.addEventListener("click", togglePlayAll);
  ui.auto.setAttribute("aria-checked", String(prefs.autoPlay));
  ui.auto.addEventListener("click", () => {
    prefs.autoPlay = !prefs.autoPlay;
    ui.auto.setAttribute("aria-checked", String(prefs.autoPlay));
    savePrefs();
    if (!prefs.autoPlay && autoTimer) {
      stopPlayAll();
    }
    maybeAutoPlay();
  });
  ui.bonus.addEventListener("click", () => play(Number(ui.bonus.dataset.index)));
  ui.list.addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (row) {
      play(Number(row.dataset.index));
    }
  });

  const trace = (event) => {
    const index = event.target.closest("[data-index]")?.dataset.index;
    highlightPath(index != null && solution[index] ? solution[index].path : []);
  };
  const clearTrace = () => highlightPath([]);
  ui.list.addEventListener("mouseover", trace);
  ui.list.addEventListener("focusin", trace);
  ui.list.addEventListener("mouseleave", clearTrace);
  ui.bonus.addEventListener("mouseenter", trace);
  ui.bonus.addEventListener("mouseleave", clearTrace);

  ui.bar.addEventListener("pointerdown", startDrag);
}

function startDrag(event) {
  if (event.target.closest("button")) {
    return;
  }
  const box = ui.panel.getBoundingClientRect();
  const offsetX = event.clientX - box.left;
  const offsetY = event.clientY - box.top;
  ui.bar.setPointerCapture(event.pointerId);
  const move = (moveEvent) => {
    prefs.top = Math.max(8, Math.min(innerHeight - 60, moveEvent.clientY - offsetY));
    prefs.right = Math.max(8, Math.min(innerWidth - box.width - 8, innerWidth - (moveEvent.clientX - offsetX) - box.width));
    ui.panel.style.top = `${prefs.top}px`;
    ui.panel.style.right = `${prefs.right}px`;
  };
  ui.bar.addEventListener("pointermove", move);
  ui.bar.addEventListener(
    "pointerup",
    () => {
      ui.bar.removeEventListener("pointermove", move);
      savePrefs();
    },
    { once: true },
  );
}

function play(index) {
  const entry = solution[index];
  if (!entry || foundOnPage().has(entry.word)) {
    return;
  }
  if (sendWord(entry.word)) {
    sentAt.set(entry.word, Date.now());
    rejected.delete(entry.word);
  } else {
    rejected.add(entry.word);
    setTimeout(() => {
      rejected.delete(entry.word);
      paint();
    }, 900);
  }
  paint();
}

function stopPlayAll() {
  clearTimeout(autoTimer);
  autoTimer = null;
  autoLeft = 0;
  paint();
}

// Best words first, with a random gap so the submissions don't land on a fixed beat.
function togglePlayAll() {
  if (autoTimer) {
    stopPlayAll();
    return;
  }
  const queue = solution.map((entry) => entry.word);
  const step = () => {
    const found = foundOnPage();
    let word = queue.shift();
    while (word && found.has(word)) {
      word = queue.shift();
    }
    if (!word || !sendWord(word)) {
      stopPlayAll();
      return;
    }
    sentAt.set(word, Date.now());
    autoLeft = queue.length;
    autoTimer = setTimeout(step, 250 + Math.random() * 450);
    paint();
  };
  step();
}

function showSkeleton() {
  ui.count.textContent = "loading";
  ui.list.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton"></div>').join("");
}

// Rows are built once per board. paint() only flips their state.
function buildRows() {
  ui.list.innerHTML = "";
  rows = [];
  groups = [];
  sentAt.clear();
  rejected.clear();
  ui.count.textContent = `${solution.length} words`;
  if (!solution.length) {
    ui.list.innerHTML = '<div class="empty">No words on this board.</div>';
    return;
  }
  let group = null;
  solution.forEach((entry, index) => {
    const length = Math.min(entry.word.length, 11);
    if (!group || group.length !== length) {
      group = {
        length,
        points: entry.points,
        element: document.createElement("div"),
        members: [],
      };
      group.element.className = "group";
      ui.list.appendChild(group.element);
      groups.push(group);
    }
    const row = document.createElement("button");
    row.type = "button";
    row.className = "row";
    row.dataset.index = index;
    row.title = gloss(entry.word) || "";
    row.innerHTML = '<span></span><span class="state"></span>';
    row.firstChild.textContent = entry.word;
    ui.list.appendChild(row);
    rows.push(row);
    group.members.push(index);
  });
}

function paint() {
  if (!ui || rows.length !== solution.length) {
    return;
  }
  const found = foundOnPage();
  const now = Date.now();
  let scored = 0;
  let foundCount = 0;

  solution.forEach((entry, index) => {
    const isFound = found.has(entry.word);
    if (isFound) {
      scored += entry.points;
      foundCount++;
      sentAt.delete(entry.word);
    }
    // A word sent but never confirmed within 2.5s is treated as dropped.
    const isSent = !isFound && sentAt.has(entry.word) && now - sentAt.get(entry.word) < 2500;
    const isRejected = rejected.has(entry.word);
    const row = rows[index];
    row.classList.toggle("found", isFound);
    row.classList.toggle("sent", isSent);
    row.classList.toggle("rejected", isRejected);
    row.lastChild.textContent = isFound ? "✓" : isSent ? "sent" : isRejected ? "round over" : `+${entry.points}`;
  });

  for (const group of groups) {
    const done = group.members.filter((index) => found.has(solution[index].word)).length;
    const label = group.length >= 11 ? "11+" : group.length;
    group.element.classList.toggle("done", done === group.members.length);
    group.element.innerHTML = `<span>${label} letters, ${group.points} pt${group.points > 1 ? "s" : ""}</span><span>${done}/${group.members.length}</span>`;
  }

  const total = solution.reduce((sum, entry) => sum + entry.points, 0);
  ui.score.textContent = scored.toLocaleString();
  ui.scoreDetail.textContent = `of ${total.toLocaleString()} pts, ${foundCount}/${solution.length} found`;
  ui.meter.style.transform = `scaleX(${total ? scored / total : 0})`;

  const bonusIndex = findBonus(solution);
  ui.bonus.hidden = bonusIndex < 0;
  if (bonusIndex >= 0) {
    const bonusWord = solution[bonusIndex].word;
    ui.bonus.dataset.index = bonusIndex;
    ui.bonus.querySelector("strong").textContent = bonusWord;
    ui.bonus.querySelector("p").textContent = gloss(bonusWord);
    ui.bonus.classList.toggle("found", found.has(bonusWord));
  }

  const left = solution.length - foundCount;
  const live = isRoundLive();
  ui.playAll.classList.toggle("running", Boolean(autoTimer));
  if (autoTimer) {
    ui.playAll.disabled = false;
    ui.playAllLabel.textContent = `Stop, ${autoLeft} left`;
  } else {
    ui.playAll.disabled = !live || left === 0;
    ui.playAllLabel.textContent = !live ? "Waiting for the next round" : left === 0 ? "Board cleared" : `Submit all ${left}`;
  }
}

// Auto starts once per board. Pressing Stop holds it until the next deal.
function maybeAutoPlay() {
  if (!prefs.autoPlay || autoTimer || autoPlayedKey === boardKey || !solution.length || !isRoundLive()) {
    return;
  }
  autoPlayedKey = boardKey;
  togglePlayAll();
}

async function tick() {
  const current = readBoard();
  if (!current) {
    if (host) {
      host.style.display = "none";
    }
    return;
  }
  mountPanel();
  host.style.display = "";
  if (!dictionary) {
    showSkeleton();
    await loadDictionary();
  }
  // The tiles are the key. A new deal on the same DOM nodes still changes it.
  const key = readBoard()?.tiles.join("") ?? null;
  if (key && key !== boardKey) {
    boardKey = key;
    stopPlayAll();
    solution = solve(readBoard().tiles);
    buildRows();
  }
  paint();
  maybeAutoPlay();
}

let tickQueued = false;

function queueTick() {
  if (tickQueued) {
    return;
  }
  tickQueued = true;
  setTimeout(() => {
    tickQueued = false;
    tick();
  }, 250);
}

new MutationObserver(queueTick).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});
// Medium is a SPA and React sometimes swaps the board quietly, so poll as a fallback.
setInterval(queueTick, 1000);
queueTick();
