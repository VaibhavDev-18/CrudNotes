from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
if not MONGO_URL:
    raise EnvironmentError("MONGO_URL is not set in env.")

try:
    client = MongoClient(MONGO_URL)
    client.admin.command('ping')
    print("[MongoDB] Connection successful.")
except Exception as e:
    print("[MongoDB] Connection failed:", e)
    raise

notes_app_users = client['notes_app_users']
notes_app_notes = client['notes_app_notes']

user_collection = notes_app_users['users']
otp_collection = notes_app_users['otp']
notes_collection = notes_app_notes['notes']