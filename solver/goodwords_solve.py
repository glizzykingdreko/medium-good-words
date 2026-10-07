import json
import os
import time

import requests

CDN_URL = "https://cdn-client.medium.com/lite/static/goodwords"
ASSET_VERSION = "?v=6eeb79b5190c"
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")

# None solves the current round's solo board, or paste 25 tiles like "S T QU A ..."
BOARD = None

SIZE = 5
CELLS = SIZE * SIZE
MIN_LENGTH = 4
ROUND_MS = 180_000 + 30_000

# Big Boggle dice, in the client's order
DICE = [
    "AAAFRS",
    "AAEEEE",
    "AAFIRS",
    "ADENNN",
    "AEEEEM",
    "AEEGMU",
    "AEGMNN",
    "AFIRSY",
    "BJKQXZ",
    "CCNSTW",
    "CEIILT",
    "CEILPT",
    "CEIPST",
    "DDLNOR",
    "DHHLOR",
    "DHHNOT",
    "DHLNOR",
    "EIIITT",
    "EMOTTT",
    "ENSSSU",
    "FIPRSY",
    "GORRVW",
    "HIPRRY",
    "NOOTUW",
    "OOOTTU",
]

POINTS = [0, 0, 0, 0, 1, 2, 4, 8, 15, 25, 40]


def points(word: str) -> int:
    if len(word) < MIN_LENGTH:
        return 0
    return POINTS[len(word)] if len(word) < len(POINTS) else 60


def neighbours(cell: int) -> list:
    row, column = divmod(cell, SIZE)
    result = []
    for row_step in (-1, 0, 1):
        for column_step in (-1, 0, 1):
            next_row = row + row_step
            next_column = column + column_step
            if (row_step or column_step) and 0 <= next_row < SIZE and 0 <= next_column < SIZE:
                result.append(next_row * SIZE + next_column)
    return result


ADJACENT = [neighbours(cell) for cell in range(CELLS)]


def u32(value: int) -> int:
    return value & 0xFFFFFFFF


def imul(left: int, right: int) -> int:
    return u32(u32(left) * u32(right))


def seed_hash(seed: int) -> int:
    # Port of the client's jt(), a 32 bit integer finaliser over the round number.
    value = u32(seed + 2654435769)
    value = imul(value ^ (value >> 16), 569420461)
    value = imul(value ^ (value >> 15), 1935289751)
    return u32(value ^ (value >> 15))


def seeded_random(seed: int):
    # Port of the client's Rt(), a mulberry32 PRNG returning floats in [0, 1).
    state = u32(seed)

    def next_float() -> float:
        nonlocal state
        state = u32(state + 1831565813)
        mixed = imul(state ^ (state >> 15), 1 | state)
        mixed = u32(mixed + imul(mixed ^ (mixed >> 7), 61 | mixed)) ^ mixed
        return u32(mixed ^ (mixed >> 14)) / 4294967296

    return next_float


def board_for_round(round_number: int) -> list:
    # The client deals this exact board whenever the websocket is down.
    next_float = seeded_random(seed_hash(round_number))
    dice = list(DICE)
    for index in range(len(dice) - 1, 0, -1):
        swap = int(next_float() * (index + 1))
        dice[index], dice[swap] = dice[swap], dice[index]
    tiles = []
    for die in dice:
        face = die[int(next_float() * len(die))]
        tiles.append("QU" if face == "Q" else face)
    return tiles


def parse_board(text: str) -> list:
    tiles = text.upper().replace(",", " ").split()
    if len(tiles) != CELLS:
        tiles = ["QU" if letter == "Q" else letter for letter in "".join(tiles).replace("QU", "Q")]
    if len(tiles) != CELLS:
        raise ValueError(f"Need {CELLS} tiles, got {len(tiles)}")
    return ["QU" if tile == "Q" else tile for tile in tiles]


def solve(tiles: list, trie: dict) -> dict:
    lowered = [tile.lower() for tile in tiles]
    found = {}
    used = [False] * CELLS
    path = []

    def walk(cell: int, node: dict):
        # A QU tile has to match both letters before the walk moves on.
        for letter in lowered[cell]:
            node = node.get(letter)
            if node is None:
                return
        used[cell] = True
        path.append(cell)
        word = node.get("$")
        if word and len(word) >= MIN_LENGTH and word not in found:
            found[word] = list(path)
        for neighbour in ADJACENT[cell]:
            if not used[neighbour]:
                walk(neighbour, node)
        path.pop()
        used[cell] = False

    for cell in range(CELLS):
        walk(cell, trie)
    return found


if __name__ == "__main__":
    # [1] Download the same dictionary files the game loads
    print("[1] Loading words.txt, freq.bin and vocab.json...")
    os.makedirs(CACHE_DIR, exist_ok=True)
    assets = {}
    for name in ("words.txt", "freq.bin", "vocab.json"):
        path = os.path.join(CACHE_DIR, name)
        if not os.path.exists(path):
            asset_response = requests.get(
                f"{CDN_URL}/{name}{ASSET_VERSION}",
                headers={
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
                    "referer": "https://medium.com/",
                },
                timeout=30,
            )
            if asset_response.status_code != 200:
                raise RuntimeError(f"{name} failed [{asset_response.status_code}]")
            with open(path, "wb") as file:
                file.write(asset_response.content)
        with open(path, "rb") as file:
            assets[name] = file.read()

    words = assets["words.txt"].decode().strip().split("\n")
    # freq.bin holds one byte per words.txt line, the client divides it by 32 for a zipf score.
    zipf = {word: assets["freq.bin"][index] / 32 for index, word in enumerate(words) if index < len(assets["freq.bin"])}
    vocab = json.loads(assets["vocab.json"])
    trie = {}
    for word in words:
        node = trie
        for letter in word:
            node = node.setdefault(letter, {})
        node["$"] = word
    print(f"    words={len(words)}")
    print(f"    definitions={len(vocab['defs'])}\n")

    # [2] Build the board
    if BOARD:
        print("[2] Parsing the board...")
        tiles = parse_board(BOARD)
    else:
        round_number, into_round = divmod(int(time.time() * 1000), ROUND_MS)
        print(f"[2] Dealing the solo board for round {round_number}...")
        print(f"    phase={'playing' if into_round < 180_000 else 'break'}")
        tiles = board_for_round(round_number)
    for row in range(SIZE):
        print("    " + " ".join(f"{tile:<2}" for tile in tiles[row * SIZE:(row + 1) * SIZE]))
    print()

    # [3] Walk the board against the trie
    print("[3] Solving...")
    started = time.perf_counter()
    found = solve(tiles, trie)
    elapsed_ms = (time.perf_counter() - started) * 1000
    ranked = sorted(found, key=lambda word: (-points(word), -zipf.get(word, 0), word))
    total = sum(points(word) for word in ranked)
    print(f"    words={len(ranked)}")
    print(f"    points={total}")
    print(f"    elapsed={elapsed_ms:.1f}ms\n")
    for word in ranked:
        # Inflected forms point at their lemma, which is where the definition lives.
        entry = vocab["defs"].get(vocab["lemmaOf"].get(word, word), "")
        gloss = entry.partition("|")[2]
        print(f"    {points(word):>3}  {word:<14} {gloss[:70]}")

    print(f"\n[PASS] {len(ranked)} words, {total} points")
