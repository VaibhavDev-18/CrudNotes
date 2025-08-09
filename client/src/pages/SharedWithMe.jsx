import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SharedWithMe = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async () => {
    try {
      const res = await fetch(`${BASE_URL}api/notes/shared-with-me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSharedNotes(data.notes);
      } else {
        toast.error("Failed to fetch shared notes");
      }
    } catch (err) {
      toast.error("Error fetching shared notes");
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notes Shared With Me</h1>

      {sharedNotes.length === 0 ? (
        <p className="text-gray-500">No notes have been shared with you.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sharedNotes.map((note) => (
            <div
              key={note.note_id}
              className="bg-white shadow p-4 rounded border border-gray-200"
            >
              <h3 className="font-semibold text-lg text-indigo-700 mb-1">
                {note.title}
              </h3>
              <p className="text-sm text-gray-700">{note.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                Tags: {note.tags?.join(", ") || "None"}
              </p>
              <p className="text-xs text-gray-400 mt-1 italic">
                Shared by: {note.sharedByEmail || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
