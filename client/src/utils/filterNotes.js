export const filterNotesByQuery = (notes, query) => {
  if (!query) return notes;

  const q = query.toLowerCase();

  return notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  });
};
