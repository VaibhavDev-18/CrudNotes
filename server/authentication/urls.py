from django.urls import path
from authentication.views import SendOTPView, UserSignupView, UserLoginView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path("send-otp/", SendOTPView.as_view(), name="send_otp"),
    path("signup/", UserSignupView.as_view(), name="user_signup"),
    path("login/", UserLoginView.as_view(), name="user_login"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]