// components/StickyNotesApp.jsx
import React, { useEffect } from "react";
import StickyNote from "./StickyNote";
import AddNoteButton from "./AddNoteButton";
import useStickyNotes from "../hooks/useStickyNotes";
import "../styles/stickyNotes.css";

export default function StickyNotesApp() {
  const {
    containerRef,
    notes,
    dragState,
    addNote,
    removeNote,
    updateText,
    focusNote,
    startDrag,
  } = useStickyNotes();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body { margin:0; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="sn-app">
      <div className="sn-container-wrap">
        <div ref={containerRef} data-testid="sticky-notes-container" className="sn-container">
          {notes.map(note => (
            <StickyNote
              key={note.id}
              note={note}
              isDragging={dragState?.id === note.id}
              onMouseDown={startDrag}
              onRemove={removeNote}
              onTextChange={updateText}
              onFocus={focusNote}
            />
          ))}
        </div>
      </div>
      <AddNoteButton onClick={addNote} />
    </div>
  );
}
