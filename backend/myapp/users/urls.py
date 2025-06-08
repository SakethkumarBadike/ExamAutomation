from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from django.urls import path
from users.views import RegisterView,LoginView,PasswordResetMailView,SendRegistrationOTPView,VerifyRegistrationOTPView,LogoutView,PasswordResetConfirmView,ChangePasswordView,UserInfoView,CustomTokenObtainPairView
urlpatterns = [
    path('signup/', RegisterView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password_reset/', PasswordResetMailView.as_view(), name='password_reset'),
    path('send_otp/', SendRegistrationOTPView.as_view(), name='send_otp'),
    path('verify_otp/', VerifyRegistrationOTPView.as_view(), name='verify_otp'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password_reset_confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user/', UserInfoView.as_view(), name='user_info'),
    
    
]
