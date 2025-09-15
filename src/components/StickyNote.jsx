// components/StickyNote.jsx
import React from "react";
import { X } from "lucide-react";

export default function StickyNote({
  note,
  isDragging,
  onMouseDown,
  onRemove,
  onTextChange,
  onFocus,
}) {
  return (
    <div
      key={note.id}
      data-testid="sticky-note"
      className={`sn-note ${isDragging ? "dragging" : ""}`}
      onMouseDown={e => onMouseDown(e, note)}
      style={{
        left: note.left,
        top: note.top,
        background: note.color,
        zIndex: note.zIndex,
      }}
    >
      <div className="note-header">
        <button
          data-testid="close-button"
          className="sn-close-btn"
          onClick={() => onRemove(note.id)}
        >
          <X data-testid="icon-close" size={14} />
        </button>
      </div>
      <div className="note-body">
        <textarea
          data-testid="note-textarea"
          placeholder="Enter Text"
          value={note.text}
          onChange={e => onTextChange(note.id, e.target.value)}
          onFocus={() => onFocus(note.id)}
          onMouseDown={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
