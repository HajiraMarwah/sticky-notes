// components/AddNoteButton.jsx
import React from "react";
import { Plus } from "lucide-react";

export default function AddNoteButton({ onClick }) {
  return (
    <button
      data-testid="add-note-button"
      className="sn-add-btn"
      onClick={onClick}
    >
      <Plus data-testid="icon-add" size={20} />
    </button>
  );
}
