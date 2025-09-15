// hooks/useStickyNotes.js
import { useState, useEffect, useRef } from "react";
import { STORAGE_KEY, createNoteObject } from "../utils/notesUtils";

export default function useStickyNotes() {
  const containerRef = useRef(null);
  const topZ = useRef(1);

  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [createNoteObject({ index: 0, topZ })];
  });

  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  function addNote() {
    setNotes(prev => [...prev, createNoteObject({ index: prev.length, topZ })]);
  }

  function removeNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function updateText(id, value) {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, text: value } : n)));
  }

  function focusNote(id) {
    topZ.current += 1;
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, zIndex: topZ.current } : n)));
  }

  function startDrag(e, note) {
    if (e.target.tagName === "TEXTAREA") return;
    e.preventDefault();

    const containerRect = containerRef.current.getBoundingClientRect();
    const noteRect = e.currentTarget.getBoundingClientRect();

    setNotes(prev =>
      prev.map(n => (n.id === note.id ? { ...n, zIndex: ++topZ.current } : n))
    );

    setDragState({
      id: note.id,
      offsetX: e.clientX - noteRect.left,
      offsetY: e.clientY - noteRect.top,
      containerRect,
    });
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragState) return;
      const { id, offsetX, offsetY, containerRect } = dragState;
      const container = containerRef.current;
      const left = e.clientX - containerRect.left - offsetX + container.scrollLeft;
      const top = e.clientY - containerRect.top - offsetY + container.scrollTop;

      setNotes(prev =>
        prev.map(n =>
          n.id === id
            ? {
                ...n,
                left: Math.min(Math.max(0, left), container.scrollWidth - n.width),
                top: Math.min(Math.max(0, top), container.scrollHeight - n.height),
              }
            : n
        )
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

  return {
    containerRef,
    notes,
    dragState,
    addNote,
    removeNote,
    updateText,
    focusNote,
    startDrag,
  };
}
