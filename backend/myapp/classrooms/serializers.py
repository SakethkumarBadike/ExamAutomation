from rest_framework import serializers
from classrooms.models import ClassRoom,Enrollment,Announcement
# from django.contrib.auth import get_user_model

'''
newuser@mail.com
abcd
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MDkxMDk3NiwiaWF0IjoxNzQwODI0NTc2LCJqdGkiOiJjYTM2NDljZGUzZjY0NTUxYTI0MmI2YjMwYmJlNWQ4MCIsInVzZXJfaWQiOjR9.a0b1gQXvVpTsfxG-olR37QscV2R4nK_UatdCrpl0lVg",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwODMxMzM1LCJpYXQiOjE3NDA4MjQ1NzYsImp0aSI6IjBiYTU5MGUyMTM4ODQ2MDY4MDkxNWRkMWY1MDExN2ExIiwidXNlcl9pZCI6NH0.9Iq-u6GDetEGMv0r3Ei9wDPba4oZc8ZbZYg5gyxyPug"
}

saketh
postgres--username
postgres--dbname
newpassword
'''


class EnrollmentsSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    code = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ["classroom", "name", "date_joined", "creator_name", "student", "code"]
        read_only_fields = ["name", "creator_name", "code"]

    def get_name(self, obj):
        # Safely access classroom.name
        print(obj.classroom)
        if obj.classroom:                   #if we return None , it might break the databse integrity and it throws the error
            return obj.classroom.name
        return None

    def get_creator_name(self, obj):
        # Safely access classroom.creator.username
        if obj.classroom and obj.classroom.creator:
            return obj.classroom.creator.username
        return None

    def get_code(self, obj):
        # Safely access classroom.code
        if obj.classroom:
            return obj.classroom.code
        return None


class ClassRoomSerializer(serializers.ModelSerializer):
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = ["id", "name", "code", "creator", "creator_name"]
        read_only_fields = ["creator", "creator_name"]

    def get_creator_name(self, obj):
        # Safely access creator.username
        if obj.creator:
            return obj.creator.username
        return None

# anouncement related serializers


class AnouncementSerailizer(serializers.ModelSerializer):
    creator=serializers.SerializerMethodField()
    def get_creator(self,obj):
        return obj.classroom.creator.username
        
    class Meta:
        model=Announcement
        fields=['title','content','created_at','creator']
    

