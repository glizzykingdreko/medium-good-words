const CDN_URL = "https://cdn-client.medium.com/lite/static/goodwords";
const ASSET_VERSION = "?v=6eeb79b5190c";
const SIZE = 5;
const CELLS = SIZE * SIZE;
const MIN_LENGTH = 4;
const POINTS = [0, 0, 0, 0, 1, 2, 4, 8, 15, 25, 40];

const ADJACENT = Array.from({ length: CELLS }, (_, cell) => {
  const row = Math.floor(cell / SIZE);
  const column = cell % SIZE;
  const result = [];
  for (let rowStep = -1; rowStep <= 1; rowStep++) {
    for (let columnStep = -1; columnStep <= 1; columnStep++) {
      const nextRow = row + rowStep;
      const nextColumn = column + columnStep;
      if ((rowStep || columnStep) && nextRow >= 0 && nextRow < SIZE && nextColumn >= 0 && nextColumn < SIZE) {
        result.push(nextRow * SIZE + nextColumn);
      }
    }
  }
  return result;
});

let dictionary = null;
let dictionaryLoading = null;

function points(word) {
  if (word.length < MIN_LENGTH) {
    return 0;
  }
  return word.length < POINTS.length ? POINTS[word.length] : 60;
}

function buildTrie(words) {
  const root = Object.create(null);
  for (const word of words) {
    let node = root;
    for (const letter of word) {
      node = node[letter] || (node[letter] = Object.create(null));
    }
    node.$ = word;
  }
  return root;
}

// Same three files and version tag the game fetches, so the browser cache usually has them.
function loadDictionary() {
  if (dictionaryLoading) {
    return dictionaryLoading;
  }
  dictionaryLoading = Promise.all([
    fetch(`${CDN_URL}/words.txt${ASSET_VERSION}`).then((response) => response.text()),
    fetch(`${CDN_URL}/freq.bin${ASSET_VERSION}`).then((response) => response.arrayBuffer()),
    fetch(`${CDN_URL}/vocab.json${ASSET_VERSION}`).then((response) => response.json()).catch(() => null),
  ]).then(([wordsText, frequencyBuffer, vocab]) => {
    const words = wordsText.trim().split("\n");
    const frequency = new Uint8Array(frequencyBuffer);
    dictionary = {
      trie: buildTrie(words),
      // freq.bin holds one byte per words.txt line, the client divides it by 32.
      zipf: new Map(words.map((word, index) => [word, frequency[index] / 32])),
      vocab,
    };
  });
  return dictionaryLoading;
}

function solve(tiles) {
  const lowered = tiles.map((tile) => tile.toLowerCase());
  const found = new Map();
  const used = new Uint8Array(CELLS);
  const path = [];

  function walk(cell, node) {
    // A QU tile has to match both letters before the walk moves on.
    for (const letter of lowered[cell]) {
      node = node[letter];
      if (!node) {
        return;
      }
    }
    used[cell] = 1;
    path.push(cell);
    if (node.$ && node.$.length >= MIN_LENGTH && !found.has(node.$)) {
      found.set(node.$, path.slice());
    }
    for (const neighbour of ADJACENT[cell]) {
      if (!used[neighbour]) {
        walk(neighbour, node);
      }
    }
    path.pop();
    used[cell] = 0;
  }

  for (let cell = 0; cell < CELLS; cell++) {
    walk(cell, dictionary.trie);
  }
  const zipf = (word) => dictionary.zipf.get(word) || 0;
  return [...found]
    .map(([word, wordPath]) => ({
      word,
      points: points(word),
      path: wordPath,
    }))
    .sort((left, right) => right.points - left.points || zipf(right.word) - zipf(left.word) || left.word.localeCompare(right.word));
}

// Inflected forms point at their lemma, which is where the definition lives.
function gloss(word) {
  const vocab = dictionary.vocab;
  if (!vocab) {
    return null;
  }
  const entry = vocab.defs[vocab.lemmaOf[word] || word];
  return entry ? entry.split("|")[1] : null;
}
