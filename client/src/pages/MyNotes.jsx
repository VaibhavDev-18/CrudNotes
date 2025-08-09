import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteModal from "../components/EditNoteModal";
import { filterNotesByQuery } from "../utils/filterNotes";
import ShareIcon from "@mui/icons-material/Share";
import ShareModal from "../components/SharedModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [editingNote, setEditingNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteToShare, setNoteToShare] = useState(null);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}api/notes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotes(data.notes);
    } catch (err) {
      toast.error("Failed to load notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newNote.title && !newNote.content) {
      toast.error("Note title or content is required.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}api/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note_title: newNote.title,
          note_content: newNote.content,
          tags: newNote.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Note created!");
        setNotes([data.note, ...notes]);
        setNewNote({ title: "", content: "", tags: "" });
      } else {
        toast.error(data.message || "Failed to create note.");
      }
    } catch (err) {
      toast.error("Server error while creating note.");
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setShowEditModal(true);
  };

  const handleUpdateNote = async (updatedFields) => {
    const token = localStorage.getItem("token");
    console.log("in handle update note");
    try {
      const res = await fetch(`${BASE_URL}api/notes/${editingNote.note_id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });
      console.log("try block done");

      if (res.ok) {
        toast.success("Note updated");
        setShowEditModal(false);
        setEditingNote(null);
        fetchNotes();
      } else {
        toast.error("Failed to update note");
      }
    } catch (err) {
      console.error("Fetch error: ", err);
      toast.error("Error updating note");
    }
  };

  const handleArchive = async (noteId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/archive`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Note archived");
        setNotes(notes.filter((n) => n.note_id !== noteId));
      }
    } catch (err) {
      console.error("error: ", err);
      toast.error("Error archiving note");
    }
  };

  const handleTrash = async (noteId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/trash`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Note moved to trash");
        setNotes(notes.filter((n) => n.note_id !== noteId));
      }
    } catch (err) {
      console.error("trash note error: ", err);
      toast.error("Error trashing note: ", err);
    }
  };

  const filteredNotes = filterNotesByQuery(notes, searchQuery);

  const openShareModal = (note) => {
    setNoteToShare(note);
    setShowShareModal(true);
  };

  const handleShare = async (noteId, email) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Note shared successfully");
        setShowShareModal(false);
        setNoteToShare(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to share note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        My Notes
      </h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <form
        onSubmit={handleCreateNote}
        className="mb-10 bg-white shadow-md rounded-lg p-6 w-full max-w-2xl mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
          Create a New Note
        </h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          placeholder="Content"
          className="w-full border p-2 mb-3 rounded resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
          rows={4}
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={newNote.tags}
          onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-500"
          >
            Create Note
          </button>
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.note_id}
            className="bg-white shadow p-4 rounded relative group transition hover:shadow-lg"
          >
            <h3 className="font-bold text-lg text-gray-800">{note.title}</h3>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">
              {note.content}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Tags: {note.tags?.join(", ") || "None"}
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditClick(note)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => handleArchive(note.note_id)}
                className="text-green-600 hover:text-green-800"
                title="Archive"
              >
                <ArchiveIcon />
              </button>
              <button onClick={() => openShareModal(note)} title="Share">
                <ShareIcon />
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
      <EditNoteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        note={editingNote}
        onSave={handleUpdateNote}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        note={noteToShare}
        onShare={handleShare}
      />
    </div>
  );
};

export default MyNotes;
