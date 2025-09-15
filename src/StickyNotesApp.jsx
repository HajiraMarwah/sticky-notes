import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

const PASTEL_COLORS = [
  "#FFEDD5",
  "#FDE68A",
  "#D1FAE5",
  "#DBEAFE",
  "#FCE7F3",
  "#E6E6FA",
];

const STORAGE_KEY = "sticky_notes_app_v1";

function generateId() {
  return "note_" + Math.random().toString(36).slice(2, 9);
}

export default function StickyNotesApp() {
  const containerRef = useRef(null);
  const topZ = useRef(1);

  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [createNoteObject({ id: generateId(), index: 0 })];
  });

  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .sn-app { font-family: Inter, sans-serif; height:100vh; display:flex; flex-direction:column; }
      .sn-container-wrap { flex:1; padding:20px; box-sizing:border-box; }
      .sn-container { border:2px dashed #e2e8f0; border-radius:10px; height:100%; position:relative; overflow:auto; background:#fafafa; }
      .sn-note { position:absolute; width:220px; min-height:140px; box-shadow:0 6px 14px rgba(15,23,42,0.12); border-radius:8px; padding:10px; box-sizing:border-box; cursor:grab; display:flex; flex-direction:column; }
      .sn-note.dragging { cursor:grabbing; opacity:0.95; }
      .sn-note .note-header { display:flex; justify-content:flex-end; }
      .sn-note .note-body { flex:1; margin-top:6px; }
      .sn-note textarea { width:100%; height:100%; resize:none; border:none; outline:none; background:transparent; font-size:14px; font-family:inherit; }
      .sn-add-btn { position:fixed; right:24px; bottom:24px; width:56px; height:56px; border-radius:999px; background:#111827; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(15,23,42,0.32); border:none; cursor:pointer; }
      .sn-close-btn { background:rgba(0,0,0,0.06); border:none; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  function createNoteObject({ id = generateId(), index = 0 } = {}) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const GAP_X = 20;
    const GAP_Y = 20;
    const WIDTH = 220;
    const HEIGHT = 160;
    const left = col * (WIDTH + GAP_X);
    const top = row * (HEIGHT + GAP_Y);
    return {
      id,
      text: "",
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      top,
      left,
      width: WIDTH,
      height: HEIGHT,
      zIndex: ++topZ.current,
    };
  }

  function handleAddNote() {
    setNotes(prev => {
      const newNote = createNoteObject({ index: prev.length });
      const next = [...prev, newNote];
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 10);
      return next;
    });
  }

  function handleRemoveNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function onNoteMouseDown(e, note) {
    if (e.target.tagName === "TEXTAREA") return;
    e.preventDefault();
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const noteRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - noteRect.left;
    const offsetY = e.clientY - noteRect.top;
    topZ.current += 1;
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, zIndex: topZ.current } : n));
    setDragState({ id: note.id, offsetX, offsetY, containerRect });
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragState) return;
      const { id, offsetX, offsetY, containerRect } = dragState;
      const container = containerRef.current;
      const left = e.clientX - containerRect.left - offsetX + container.scrollLeft;
      const top = e.clientY - containerRect.top - offsetY + container.scrollTop;
      setNotes(prev =>
        prev.map(n => {
          if (n.id !== id) return n;
          const clampedLeft = Math.min(Math.max(0, left), container.scrollWidth - n.width);
          const clampedTop = Math.min(Math.max(0, top), container.scrollHeight - n.height);
          return { ...n, left: clampedLeft, top: clampedTop };
        })
      );
    }
    function onMouseUp() {
      setDragState(null);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState]);

  function handleTextChange(id, value) {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, text: value } : n)));
  }

  function handleTextareaFocus(id) {
    topZ.current += 1;
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, zIndex: topZ.current } : n)));
  }

  return (
    <div className="sn-app">
      <div className="sn-container-wrap">
        <div ref={containerRef} data-testid="sticky-notes-container" className="sn-container">
          {notes.map(note => (
            <div
              key={note.id}
              data-testid="sticky-note"
              className={`sn-note ${dragState?.id === note.id ? "dragging" : ""}`}
              onMouseDown={e => onNoteMouseDown(e, note)}
              style={{ left: note.left, top: note.top, background: note.color, zIndex: note.zIndex }}
            >
              <div className="note-header">
                <button
                  data-testid="close-button"
                  className="sn-close-btn"
                  onClick={() => handleRemoveNote(note.id)}
                >
                  <X data-testid="icon-close" size={14} />
                </button>
              </div>
              <div className="note-body">
                <textarea
                  data-testid="note-textarea"
                  placeholder="Enter Text"
                  value={note.text}
                  onChange={e => handleTextChange(note.id, e.target.value)}
                  onFocus={() => handleTextareaFocus(note.id)}
                  onMouseDown={e => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        data-testid="add-note-button"
        className="sn-add-btn"
        onClick={handleAddNote}
      >
        <Plus data-testid="icon-add" size={20} />
      </button>
    </div>
  );
}
