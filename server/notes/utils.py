import jwt
import os
from dotenv import load_dotenv

load_dotenv()
def get_user_id_from_request(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        return decoded.get("user_id")
    except:
        return None