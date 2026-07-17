import { TILE_COLORS } from '../theme/colors';

export const BOARD_SIZE = 7;
export const MAX_TURNS = 18;

export function createBoard(size = BOARD_SIZE) {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({
      id: `${r}-${c}`,
      row: r,
      col: c,
      color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
      owner: null,
    }))
  );
}

export function getStartPositions(count, size = BOARD_SIZE) {
  const corners = [
    { row: 0, col: 0 },
    { row: size - 1, col: size - 1 },
    { row: 0, col: size - 1 },
    { row: size - 1, col: 0 },
  ];
  return corners.slice(0, count);
}

export function setupPlayers(mode, playerCount) {
  if (mode === 'single') {
    return [
      { id: 1, name: 'You', score: 1, type: 'human' },
      { id: 2, name: 'AI', score: 1, type: 'ai' },
    ];
  }
  return Array.from({ length: playerCount }, (_, i) => ({ id: i + 1, name: `Player ${i + 1}`, score: 1, type: 'human' }));
}

export function initializeOwners(board, players) {
  const next = cloneBoard(board);
  const starts = getStartPositions(players.length, board.length);
  starts.forEach((pos, i) => {
    next[pos.row][pos.col].owner = players[i].id;
  });
  return next;
}

export function cloneBoard(board) {
  return board.map(row => row.map(cell => ({ ...cell })));
}

function neighbours(cell, size) {
  return [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
    { row: cell.row, col: cell.col + 1 },
  ].filter(p => p.row >= 0 && p.col >= 0 && p.row < size && p.col < size);
}

export function getOwnedCells(board, playerId) {
  return board.flat().filter(cell => cell.owner === playerId);
}

export function findMatchingTiles(board, selected, playerId) {
  const size = board.length;
  const targetColor = selected.color;
  const visited = new Set();
  const queue = [selected];
  const matches = [];

  while (queue.length) {
    const cell = queue.shift();
    const key = `${cell.row}-${cell.col}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (cell.color !== targetColor) continue;
    matches.push(cell);
    neighbours(cell, size).forEach(n => {
      const next = board[n.row][n.col];
      if (!visited.has(`${next.row}-${next.col}`) && next.color === targetColor && next.owner !== playerId) {
        queue.push(next);
      }
    });
  }
  return matches;
}

export function isSelectable(board, cell, playerId) {
  if (cell.owner === playerId) return true;
  return neighbours(cell, board.length).some(n => board[n.row][n.col].owner === playerId);
}

export function applyMove(board, selected, playerId) {
  if (!isSelectable(board, selected, playerId)) return { board, gained: 0, matches: [] };
  const matches = findMatchingTiles(board, selected, playerId);
  const next = cloneBoard(board);
  matches.forEach(cell => {
    next[cell.row][cell.col].owner = playerId;
  });
  return { board: next, gained: matches.length, matches };
}

export function updateScores(players, board) {
  return players.map(p => ({ ...p, score: getOwnedCells(board, p.id).length }));
}

export function getAiMove(board, playerId) {
  const candidates = board.flat().filter(cell => isSelectable(board, cell, playerId) && cell.owner !== playerId);
  if (!candidates.length) return board.flat().find(c => c.owner === playerId);
  let best = candidates[0];
  let bestScore = -1;
  candidates.forEach(cell => {
    const count = findMatchingTiles(board, cell, playerId).length;
    if (count > bestScore) {
      bestScore = count;
      best = cell;
    }
  });
  return best;
}

export function getWinner(players) {
  return [...players].sort((a, b) => b.score - a.score)[0];
}
