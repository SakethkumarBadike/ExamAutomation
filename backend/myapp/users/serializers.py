from rest_framework import serializers
# from quiz.models import ClassRoom,Enrollment/
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role') # add role to fields
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["role"] = user.role  # Include user role
        token["id"] = user.id  # Include user ID

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user=self.user
        user.last_login=timezone.now()
        user.save(update_fields=['last_login'])
        data["role"] = self.user.role
        data["id"] = self.user.id
        
        return data

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # print(attrs)
        if(attrs["new_password"] != attrs['confirm_password']):
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password=serializers.CharField(required=True)
    new_password=serializers.CharField(required=True)
    confirm_password=serializers.CharField(required=True)
    def validate(self,attr):
        user=self.context['request'].user
        if not user:
            raise serializers.ValidationError("User not found.")
        if not user.is_authenticated:
            raise serializers.ValidationError("User not authenticated.")
        
        
        if not user.check_password(attr['old_password']):
            raise serializers.ValidationError("Old password is incorrect.")
        if(attr['new_password']!=attr['confirm_password']):
            raise serializers.ValidationError("Password do not match.")
        return attr
