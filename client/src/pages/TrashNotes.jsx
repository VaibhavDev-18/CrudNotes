import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { filterNotesByQuery } from "../utils/filterNotes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TrashedNotes = () => {
  const token = localStorage.getItem("token");
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const fetchTrashedNotes = async () => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/trash/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTrashedNotes(data.notes);
      } else {
        toast.error("Failed to fetch trashed notes");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error fetching trashed notes");
    }
  };

  const handleRestore = async (noteId) => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/trash`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTrashed: false }),
      });

      if (res.ok) {
        toast.success("Note restored");
        setTrashedNotes(trashedNotes.filter((n) => n.note_id !== noteId));
      } else {
        toast.error("Failed to restore note");
      }
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Error restoring note");
    }
  };

  const handlePermanentDelete = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this note? This action cannot be undone. "
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/trash`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Note permanently deleted");
        setTrashedNotes(trashedNotes.filter((n) => n.note_id !== noteId));
      } else {
        toast.error("Failed to delete note");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting note");
    }
  };

  const filteredNotes = filterNotesByQuery(trashedNotes, searchQuery);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trashed Notes</h1>
      <input
        type="text"
        placeholder="Search notes..."
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredNotes.length === 0 ? (
        <p className="text-gray-600">No notes in trash.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.note_id}
              className="bg-white shadow p-4 rounded relative"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Title:
              </h3>
              <p className="text-gray-700">{note.title}</p>

              <h4 className="text-sm font-semibold text-gray-600 mt-3">
                Content:
              </h4>
              <p className="text-gray-700">{note.content}</p>

              <h4 className="text-sm font-semibold text-gray-600 mt-3">
                Tags:
              </h4>
              <p className="text-xs text-gray-500">
                {note.tags?.join(", ") || "None"}
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleRestore(note.note_id)}
                  title="Restore"
                  className="text-green-600 hover:text-green-800"
                >
                  <RestoreFromTrashIcon />
                </button>

                <button
                  onClick={() => handlePermanentDelete(note.note_id)}
                  title="Delete Forever"
                  className="text-red-600 hover:text-red-800"
                >
                  <DeleteForeverIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashedNotes;
