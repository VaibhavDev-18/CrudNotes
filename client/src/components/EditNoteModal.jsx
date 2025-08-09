import React, { useState, useEffect } from "react";

const EditNoteModal = ({ isOpen, onClose, note, onSave }) => {
  const [editedNote, setEditedNote] = useState({
    title: "",
    content: "",
    tags: "",
  });

  useEffect(() => {
    if (note) {
      setEditedNote({
        title: note.title,
        content: note.content,
        tags: note.tags?.join(", ") || "",
      });
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...editedNote,
      tags: editedNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="title"
              className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Title"
              value={editedNote.title}
              onChange={(e) =>
                setEditedNote({ ...editedNote, title: e.target.value })
              }
            />
            <label
              htmlFor="title"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Title
            </label>
          </div>

          <div className="relative">
            <textarea
              id="content"
              className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Content"
              rows="4"
              value={editedNote.content}
              onChange={(e) =>
                setEditedNote({ ...editedNote, content: e.target.value })
              }
            />
            <label
              htmlFor="content"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Content
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="tags"
              className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Tags (comma separated)"
              value={editedNote.tags}
              onChange={(e) =>
                setEditedNote({ ...editedNote, tags: e.target.value })
              }
            />
            <label
              htmlFor="tags"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Tags (comma separated)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;
