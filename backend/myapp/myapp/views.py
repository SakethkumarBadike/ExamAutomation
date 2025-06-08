# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated

# from quiz.serializers import ClassRoomSerializer,EnrollmentsSerializer
# from django.shortcuts import get_object_or_404
# from rest_framework import generics
# from django.contrib.auth import get_user_model
# from quiz.serializers import CustomUserSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView

# class LoginView(TokenObtainPairView):
#     pass  # Uses the default JWT login behavior


# User = get_user_model()

# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = CustomUserSerializer



# class ClassroomListView(generics.ListCreateAPIView):
#     serializer_class = ClassRoomSerializer
#     permission_classes = [IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(creator=self.request.user)

#     def get_queryset(self):
#         user=self.request.user
#         print(user,user.role)
        
#         if(user.role=='T'):
#             return user.classrooms.all()
#         return user.enrollments.all()
    
 
# class ClassroomByEmailView(generics.ListAPIView):
  
#     serializer_class = ClassRoomSerializer
#     def get_queryset(self):
#          # user=CustomUser.objects.get(email=self.kwargs['email'])
#         # email=self.kwargs['email']
#         # return user.classrooms.all()
        
#         email=self.kwargs['email']
#         user = get_object_or_404(CustomUser, email=email)
#         return ClassRoom.objects.filter(creator=user)
# class  ClassroomJoinView(generics.CreateAPIView):
#     serializer_class =  EnrollmentsSerializer
#     permission_classes = [IsAuthenticated]
#     def perform_create(self, serializer):
#         serializer.save(students=self.request.user)
    
