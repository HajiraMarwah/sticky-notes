// utils/notesUtils.js
export const PASTEL_COLORS = [
  "#FFEDD5",
  "#FDE68A",
  "#D1FAE5",
  "#DBEAFE",
  "#FCE7F3",
  "#E6E6FA",
];

export const STORAGE_KEY = "sticky_notes_app_v1";

export function generateId() {
  return "note_" + Math.random().toString(36).slice(2, 9);
}

export function createNoteObject({ id, index, topZ }) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const GAP_X = 20;
  const GAP_Y = 20;
  const WIDTH = 220;
  const HEIGHT = 160;
  const left = col * (WIDTH + GAP_X);
  const top = row * (HEIGHT + GAP_Y);

  return {
    id: id ?? generateId(),
    text: "",
    color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    top,
    left,
    width: WIDTH,
    height: HEIGHT,
    zIndex: ++topZ.current,
  };
}
