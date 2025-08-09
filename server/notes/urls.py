from django.urls import path
from .views import NotesView, UpdateNotesView, ArchiveNotesView, TrashNotesView, SharedWithMeView, ShareNoteView

urlpatterns = [
    path("archived/", ArchiveNotesView.as_view()),
    path("trash/", TrashNotesView.as_view()),
    path("<str:note_id>/share", ShareNoteView.as_view()),
    path("shared-with-me/", SharedWithMeView.as_view()),
    path("<str:note_id>/", UpdateNotesView.as_view()),
    path("<str:note_id>/archive", ArchiveNotesView.as_view()),
    path("<str:note_id>/trash", TrashNotesView.as_view()),
    path("", NotesView.as_view(), name="notes"),
]
