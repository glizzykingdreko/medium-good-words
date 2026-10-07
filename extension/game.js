function distanceToForm(board) {
  let element = board;
  let depth = 0;
  while (element && !element.querySelector("form input")) {
    element = element.parentElement;
    depth++;
  }
  return element ? depth : Infinity;
}

// The results modal and the history list draw old boards too. The live one sits next to the word form.
function liveBoard() {
  const boards = [...document.querySelectorAll('[data-testid="goodWordsBoard"]')];
  if (!boards.length) {
    return null;
  }
  return boards.reduce((best, element) => (distanceToForm(element) < distanceToForm(best) ? element : best));
}

function readBoard() {
  const board = liveBoard();
  if (!board) {
    return null;
  }
  // data-cell is the unrotated index, so the space bar rotation never changes what we read.
  const tiles = new Array(CELLS).fill(null);
  for (const element of board.querySelectorAll("[data-cell]")) {
    const cell = Number(element.dataset.cell);
    if (Number.isInteger(cell) && cell < CELLS) {
      tiles[cell] = element.textContent.trim().toUpperCase();
    }
  }
  if (!tiles.every((tile) => tile && /^[A-Z]+$/.test(tile))) {
    return null;
  }
  return {
    board,
    tiles,
  };
}

function foundOnPage() {
  const heading = [...document.querySelectorAll("h1, h2, h3, h4, span, p")].find((element) => element.textContent.trim() === "Found words");
  let container = heading;
  while (container && !container.querySelector("ul")) {
    container = container.parentElement;
  }
  const list = container ? container.querySelector("ul") : null;
  if (!list) {
    return new Set();
  }
  return new Set([...list.querySelectorAll("li > span:first-child")].map((element) => element.textContent.trim().toLowerCase()));
}

function gameInput() {
  let element = liveBoard();
  while (element && !element.querySelector("form input")) {
    element = element.parentElement;
  }
  return element ? element.querySelector("form input") : null;
}

function isRoundLive() {
  const input = gameInput();
  return Boolean(input) && !input.matches(":disabled");
}

function sendWord(word) {
  const input = gameInput();
  if (!input || input.matches(":disabled")) {
    return false;
  }
  // React tracks the value itself, the native setter plus an input event is what fires onChange.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, word);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  // onSubmit reads React state, so wait a frame for the new value to commit.
  requestAnimationFrame(() => input.form.requestSubmit());
  return true;
}

// The bonus clue is a WordNet gloss printed on the page, so match it against each solution word.
function findBonus(solution) {
  if (!isRoundLive()) {
    return -1;
  }
  const pageText = document.body.innerText;
  return solution.findIndex((entry) => {
    const text = gloss(entry.word);
    return Boolean(text) && pageText.includes(text);
  });
}

function highlightPath(path) {
  const current = readBoard();
  if (!current) {
    return;
  }
  for (const element of current.board.querySelectorAll("[data-cell]")) {
    const step = path.indexOf(Number(element.dataset.cell));
    element.style.boxShadow = step < 0 ? "" : `inset 0 0 0 ${step === 0 ? 4 : 2}px oklch(0.53 0.135 148)`;
  }
}
