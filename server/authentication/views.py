from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from django.conf import settings
import os
from dotenv import load_dotenv
from mailjet_rest import Client
from db_connections import user_collection, otp_collection
import random
import bcrypt
import jwt
from datetime import datetime, timedelta, UTC
load_dotenv()

MAILJET_API_KEY = os.getenv("MAILJET_API_KEY")
MAILJET_SECRET_KEY = os.getenv("MAILJET_SECRET_KEY")
mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY), version="v3.1")


class SendOTPView(APIView):
    def post(self, request, *args, **kwargs):
        print("in sendotp view")
        full_name = request.data.get("fullName")
        email = request.data.get("email").lower()
        print(f"email: {email}, full_name: {full_name}")

        if not email or not full_name:
            print("email or full name not found")
            return JsonResponse({"message": "Full name and email are required."}, status=400)
        
        if user_collection.find_one({"email": email}):
            print("user already found")
            return JsonResponse({"message": "User already exists."}, status=400)

        verification_code = str(random.randint(100000, 999999))
        expiry_time = datetime.now(UTC) + timedelta(minutes=10)

        otp_collection.delete_many({"email": email})
        
        otp_collection.insert_one({
            "email": email,
            "otp": verification_code,
            "expires_at": expiry_time
        })

        data = {
            "Messages": [
                {
                    "From": {"Email": os.getenv("EMAIL")},
                    "To": [{"Email": email, "Name": full_name}],
                    "Subject": "Verify your email",
                    "TextPart": f"Your verification code is {verification_code}",
                    "HTMLPart": f"<h3>Your verification code: <strong>{verification_code}</strong></h3>",
                }
            ]
        }

        print(f"data is => {data}")
        response = mailjet.send.create(data=data)
        print(f"response from mailjet => {response}")

        if response.status_code == 200:
            print("response is 200 status code", response.status_code)
            return JsonResponse({"message": "OTP sent to your email"}, status=200)
        else:
            return JsonResponse({"error": "Failed to send OTP"}, status=500)

class UserSignupView(APIView):
    def post(self, request, *args, **kwargs):
        full_name = request.data.get("fullName")
        email = request.data.get("email").lower()
        otp = request.data.get("otp")
        password = request.data.get("password")
        confirm_password = request.data.get("confirmPassword")

        if not all([full_name, email, otp, password, confirm_password]):
            return JsonResponse({"message": "All fields are required."}, status=400)

        if password != confirm_password:
            return JsonResponse({"message": "Passwords do not match."}, status=400)

        otp_data = otp_collection.find_one({"email": email})
        if not otp_data:
            return JsonResponse({"message": "OTP not found. Please resend."}, status=400)

        otp_expiry = otp_data.get("expires_at")
        if otp_expiry.tzinfo is None:
            otp_expiry = otp_expiry.replace(tzinfo=UTC)

        if datetime.now(UTC) > otp_expiry:
            return JsonResponse({"message": "OTP expired. Please request again."}, status=400)

        if otp_data.get("otp") != otp:
            return JsonResponse({"message": "Invalid OTP."}, status=400)

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

        result = user_collection.insert_one({
            "fullName": full_name,
            "email": email,
            "password": hashed_password,
            "createdAt": datetime.now(UTC)
        })

        user_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"user_id": str(result.inserted_id)}}
        )

        otp_collection.delete_many({"email": email})

        return JsonResponse({"message": "Signup successful!"}, status=201)

class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email').lower()
        password = request.data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and Password required"}, status=400)

        user = user_collection.find_one({"email": email})
        if not user:
            return JsonResponse({"error": "Invalid Credentials"}, status=401)
        stored_hashed_pw = user['password']
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_pw.encode('utf-8')):
            payload = {
                "user_id": str(user["user_id"]),
                "fullName": user["fullName"],
                "email": user["email"],
                "exp": datetime.now(UTC) + timedelta(hours=2),
            }
            access_token = jwt.encode(payload, os.getenv("JWT_SECRET_KEY"), algorithm='HS256')

            return JsonResponse({
                "message": "Login successful!",
                "access": access_token,
                "user": {
                    "user_id": str(user["user_id"]),
                    "fullName": user["fullName"],
                    "email": user["email"]
                }
            })
        else:
            return JsonResponse({"error": "Invalid Credentials"}, status=401)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email", "").lower()

        if not email:
            return JsonResponse({"error": "Email is required."}, status=400)

        user = user_collection.find_one({"email": email})
        if not user:
            return JsonResponse({"error": "No user found with this email."}, status=404)
        reset_token = jwt.encode(
            {
                "email": email,
                "exp": datetime.now(UTC) + timedelta(minutes=15),
            },
            os.getenv("JWT_SECRET_KEY"),
            algorithm="HS256"
        )

        frontend_url = os.getenv("FRONTEND_BASE_URL")
        reset_link = f"{frontend_url}/reset-password/{reset_token}"

        data = {
            "Messages": [
                {
                    "From": {"Email": os.getenv("EMAIL")},
                    "To": [{"Email": email}],
                    "Subject": "Password Reset Request",
                    "HTMLPart": f"""
                        <h3>Password Reset</h3>
                        <p>Click the link below to reset your password. This link is valid for 15 minutes:</p>
                        <a href="{reset_link}">{reset_link}</a>
                        <br /><br />
                        If you didn't request this, you can safely ignore this email.
                    """,
                }
            ]
        }

        try:
            response = mailjet.send.create(data=data)
            if response.status_code == 200:
                return JsonResponse({"message": "Password reset link sent to your email."}, status=200)
            else:
                return JsonResponse({"error": "Failed to send reset email"}, status=500)
        except Exception as e:
            print("Mailjet error:", e)
            return JsonResponse({"error": "Mail sending failed"}, status=500)
        
class ResetPasswordView(APIView):
    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return JsonResponse({"error": "Invalid request"}, status=400)

        try:
            payload = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
            email = payload.get("email")
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Reset link has expired"}, status=400)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=400)

        user = user_collection.find_one({"email": email})
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)

        hashed_pw = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())

        user_collection.update_one(
            {"email": email},
            {"$set": {"password": hashed_pw.decode()}}
        )

        return JsonResponse({"message": "Password has been reset successfully"}, status=200)