from rest_framework.views import APIView
from django.http import JsonResponse
from .utils import get_user_id_from_request
from db_connections import notes_collection, user_collection
from django.utils import timezone

class NotesView(APIView):
    def get(self, request, *args, **kwargs):
        user_id = get_user_id_from_request(request)

        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        notes_cursor = notes_collection.find({
            "user_id": str(user_id),
            "isArchived": False,
            "isTrashed": False
        }).sort("updatedAt", -1)

        notes = []
        for note in notes_cursor:
            note["note_id"] = str(note["_id"])
            note["user_id"] = str(note["user_id"])
            del note["_id"]
            notes.append(note)

        return JsonResponse({"notes": notes}, status=200)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        user_id = get_user_id_from_request(request)

        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        result = notes_collection.insert_one({
            "user_id": str(user_id),
            "title": data.get("note_title", "").strip(),
            "content": data.get("note_content", "").strip(),
            "tags": data.get("tags", []),
            "isArchived": False,
            "isTrashed": False,
            "createdAt": timezone.now(),
            "updatedAt": timezone.now()
        })
        notes_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"note_id": str(result.inserted_id)}}
        )
        inserted_note = notes_collection.find_one({"_id": result.inserted_id})

        inserted_note["note_id"] = str(inserted_note["_id"])
        inserted_note["user_id"] = str(inserted_note["user_id"])
        del inserted_note["_id"]

        return JsonResponse({"message": "Note created", "note": inserted_note}, status=201)

class UpdateNotesView(APIView):
    def patch(self, request, note_id):
        print("in patch updatenotes")
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        data = request.data
        update_data = {
            "title": data.get("title"),
            "content": data.get("content"),
            "tags": data.get("tags", []),
            "updatedAt": timezone.now()
        }

        result = notes_collection.update_one(
            {"note_id": note_id, "user_id": str(user_id)},
            {"$set": update_data}
        )

        if result.modified_count == 1:
            return JsonResponse({"message": "Note updated successfully"}, status=200)
        return JsonResponse({"error": "Note not found or update failed"}, status=404)

class ArchiveNotesView(APIView):
    def get(self, request, *args, **kwargs):
        print("in get archived")
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        notes = list(notes_collection.find({
            "user_id": str(user_id),
            "isArchived": True,
            "isTrashed": False
        }).sort("updatedAt", -1))

        for note in notes:
            note["note_id"] = str(note["_id"])
            del note["_id"]

        return JsonResponse({"notes": notes}, status=200)
    
    def patch(self, request, note_id):
        print("in patch archived")
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        data = request.data
        is_archived = data.get("isArchived", True)
        is_trash = data.get("isTrashed", False)

        result = notes_collection.update_one(
            {"note_id": note_id, "user_id": str(user_id)},
            {"$set": {"isArchived": is_archived, "updatedAt": timezone.now(), "is_trashed": is_trash}}
        )

        if result.modified_count == 1:
            msg = "Note archived" if is_archived else "Note unarchived"
            return JsonResponse({"message": msg}, status=200)
        return JsonResponse({"error": "Note not found"}, status=404)

class TrashNotesView(APIView):
    def get(self, request, *args, **kwargs):
        print("in get trash")
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        notes = list(notes_collection.find({
            "user_id": str(user_id),
            "isArchived": False,
            "isTrashed": True
        }).sort("updatedAt", -1))

        for note in notes:
            note["note_id"] = str(note["_id"])
            del note["_id"]
        return JsonResponse({"notes": notes}, status=200)
    
    def patch(self, request, note_id, *args, **kwargs):
        print("in patch trash")
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        data = request.data
        print("data received: ", data)
        is_trashed = data.get("isTrashed", True)
        is_archived = data.get("isArchived", False)
        print("is_trash: ", is_trashed)


        result = notes_collection.update_one(
            {"note_id": note_id, "user_id": str(user_id)},
            {"$set": {"isTrashed": is_trashed, "updatedAt": timezone.now(), "isArchived": is_archived}}
        )

        if result.modified_count == 1:
            msg = "Note Restored" if is_trashed else "Note not in trash"
            return JsonResponse({"message": msg}, status=200)
        return JsonResponse({"error": "Note not found"}, status=404)

    def delete(self, request, note_id, *args, **kwargs):
        print("in delete trash")
        user_id = get_user_id_from_request(request)
        
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)
        result = notes_collection.delete_one({
            "note_id": note_id,
            "user_id": str(user_id)
        })
        if result.deleted_count == 1:
            return JsonResponse({"message": "Note permanently deleted"}, status=200)
        return JsonResponse({"error": "Note not found"}, status=404)

class ShareNoteView(APIView):
    def post(self, request, note_id):
        user_id = get_user_id_from_request(request)
        recipient_email = request.data.get("email").lower()

        if not user_id or not recipient_email:
            return JsonResponse({"error": "Unauthorized or missing data"}, status=400)

        recipient = user_collection.find_one({"email": recipient_email})
        if not recipient:
            return JsonResponse({"error": "Recipient not found"}, status=404)

        result = notes_collection.update_one(
            {"note_id": note_id, "user_id": str(user_id)},
            {"$addToSet": {"sharedWith": recipient["user_id"]}}
        )

        if result.modified_count == 1:
            return JsonResponse({"message": "Note shared successfully"}, status=200)
        return JsonResponse({"error": "Note not found or already shared"}, status=404)

class SharedWithMeView(APIView):
    def get(self, request):
        user_id = get_user_id_from_request(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        notes = list(notes_collection.find({
            "sharedWith": str(user_id),
            "isTrashed": False
        }).sort("updatedAt", -1))

        for note in notes:
            note["note_id"] = str(note["_id"])
            sharer = user_collection.find_one({"user_id": note.get("user_id")})
            note["sharedByEmail"] = sharer["email"] if sharer and "email" in sharer else "Unknown"
            del note["_id"]

        return JsonResponse({"notes": notes}, status=200)