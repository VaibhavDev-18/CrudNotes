import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteIcon from "@mui/icons-material/Delete";
import { filterNotesByQuery } from "../utils/filterNotes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ArchivedNotes = () => {
  const token = localStorage.getItem("token");
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/archived/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setArchivedNotes(data.notes);
      } else {
        toast.error("Failed to fetch archived notes");
      }
    } catch (err) {
      console.error("error: ", err);
      toast.error("Error fetching archived notes");
    }
  };

  const handleUnarchive = async (noteId) => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/archive`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: false }),
      });
      if (res.ok) {
        toast.success("Note unarchived");
        setArchivedNotes((prev) =>
          prev.filter((note) => note.note_id !== noteId)
        );
      } else {
        toast.error("Failed to unarchive note");
      }
    } catch (err) {
      console.error("error: ", err);
      toast.error("Error unarchiving note");
    }
  };

  const handleTrash = async (noteId) => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/trash`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: false, isTrashed: true }),
      });
      if (res.ok) {
        toast.success("Moved to trash");
        setArchivedNotes((prev) =>
          prev.filter((note) => note.note_id !== noteId)
        );
      } else {
        toast.error("Failed to move to trash");
      }
    } catch (err) {
      console.error("error: ", err);
      toast.error("Error moving note to trash");
    }
  };

  const filteredNotes = filterNotesByQuery(archivedNotes, searchQuery);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Archived Notes</h1>

      <input
        type="text"
        placeholder="Search notes..."
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredNotes.length === 0 ? (
        <p className="text-gray-500">No archived notes.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.note_id}
              className="bg-white shadow p-4 rounded relative group"
            >
              <div className="mb-2">
                <label className="font-semibold text-gray-600">Title:</label>
                <h2 className="text-lg text-gray-800">{note.title}</h2>
              </div>

              <div className="mb-2">
                <label className="font-semibold text-gray-600">Tags:</label>
                <p className="text-sm text-gray-700">
                  {note.tags?.join(", ") || "None"}
                </p>
              </div>

              <div className="mb-4">
                <label className="font-semibold text-gray-600">Content:</label>
                <p className="text-sm text-gray-700">{note.content}</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleUnarchive(note.note_id)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Unarchive"
                >
                  <UnarchiveIcon />
                </button>

                <button
                  onClick={() => handleTrash(note.note_id)}
                  className="text-red-600 hover:text-red-800"
                  title="Move to Trash"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedNotes;
