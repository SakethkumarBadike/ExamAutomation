from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
import random
from datetime import timedelta
from django.utils import timezone
from .models import OTP  # Assuming you have an OTP model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from .serializers import PasswordResetConfirmSerializer, ChangePasswordSerializer
from rest_framework import permissions


User = get_user_model()

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(username=request.data['username'])
            response.data['user'] = {
                'id': user.id,
                'role': user.role  # Add any user fields you need
            }
        return response

class LoginView(TokenObtainPairView):
  serializer_class = CustomTokenObtainPairSerializer

@method_decorator(csrf_exempt, name='dispatch')  # Only disable CSRF for testing (enable in production)
class LogoutView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            logout(request)  # Django's built-in logout (clears session)
            return Response({"message": "Logged out successfully"})
        return Response({"error": "User not logged in"}, status=400)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        try:
            email = self.request.data['email']
            if email.endswith('@gmail.com'):
                serializer.save(role='S')
            else:
                serializer.save(role='T')
        except KeyError:                           #If you try to access a key that hasn't been defined in the dictionary, Python raises a KeyError.
            raise serializers.ValidationError({"email": "Email field is required."})
        except Exception as e:
            # Handle other unexpected exceptions
            raise serializers.ValidationError({"error": str(e)}) #or log the error.

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    


class PasswordResetMailView(generics.GenericAPIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)

            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

            send_mail(
                subject="Reset your password",
                message=f"Click the link to reset your password: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        except User.DoesNotExist:
            # Silently pass to prevent email enumeration
            pass

        return Response(
            {'message': 'If this email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK
        )



class SendRegistrationOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] 
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For registration, we should NOT find an existing user
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already registered. Please login instead.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Delete any existing OTPs for this email (prevent multiple active OTPs)
        OTP.objects.filter(email=email, is_used=False).delete()
        
        # Save OTP (note: we're saving email instead of user since user doesn't exist yet)
        OTP.objects.create(email=email, code=otp_code)
        
        # Send OTP by email
        send_mail(
            subject="Your Registration OTP",
            message=f"Your registration OTP is: {otp_code}\nThis code will expire in 5 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response(
            {'message': 'OTP has been sent to your email. Valid for 5 minutes.'}, 
            status=status.HTTP_200_OK
        )

class VerifyRegistrationOTPView(generics.GenericAPIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email is already registered
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already registered'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get latest unused OTP for this email
        otp_instance = OTP.objects.filter(
            email=email, 
            code=otp, 
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp_instance:
            return Response(
                {'error': 'Invalid or expired OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if OTP expired (5 minutes validity)
        expiry_time = otp_instance.created_at + timedelta(minutes=5)
        if timezone.now() > expiry_time:
            return Response(
                {'error': 'OTP has expired'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark OTP as used
        otp_instance.is_used = True
        otp_instance.save()
        
        return Response(
            {
                'message': 'OTP verified successfully',
                'email': email,
                'otp_verified': True
            }, 
            status=status.HTTP_200_OK
        )
    

class PasswordResetConfirmView(APIView):
    """
    Handles password reset confirmation with UID and token
    """
    
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Decode uid to get user
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
            
            # Verify token
            if not default_token_generator.check_token(user, serializer.validated_data['token']):
                return Response(
                    {"error": "Invalid or expired token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"message": "Password has been reset successfully"},
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            return Response(
                {"error": "Invalid user identifier"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    # lookup_field='id'
    def get_object(self):
        return self.request.user
    def post(self,request,*args,**kwargs):
        serializer=self.get_serializer(data=request.data)
        # if(not serializer.is_valid()):
        #     return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        serializer.is_valid(raise_exception=True)
        user=self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message":"Password changed successfully"},status=status.HTTP_200_OK)
    
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'role': user.role,  # Assumes your User model has a 'role' field
        }, status=status.HTTP_200_OK)