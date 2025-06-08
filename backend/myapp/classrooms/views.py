from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import ClassRoom, Enrollment
from .serializers import ClassRoomSerializer, EnrollmentsSerializer,AnouncementSerailizer
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from users.models import CustomUser
from users.serializers import CustomUserSerializer
from tests.serializers import TestViewSerializer
from tests.models import Test
from tests.models import Submission


class ClassroomListView(generics.ListCreateAPIView):
    serializer_class = ClassRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    """
    View for listing and creating classrooms.
    - Teachers can list classrooms they created.
    - Students can list classrooms they are enrolled in.
    """

    def get_queryset(self):
        """
           Returns a queryset of classrooms based on the user's role:
        - Teachers see classrooms they created.
        - Students see classrooms they are enrolled in.
        """   
        try:
            user = self.request.user
            if user.role == 'T':
                return user.classrooms.all()
            return user.enrollments.all()
        except AttributeError:
            return ClassRoom.objects.none()

    def perform_create(self, serializer):
        """
        Saves the classroom with the current user as the creator.
        Raises a ValidationError if saving fails.
        """

        try:
            serializer.save(creator=self.request.user)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ClassTestsView(generics.ListAPIView):
    serializer_class = TestViewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        classroom_code = self.kwargs.get('code')
        classroom = get_object_or_404(ClassRoom, code=classroom_code)  # Get classroom instance
        return Test.objects.filter(classroom=classroom)  # Filter tests by class

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        user = request.user  # Logged-in user

        if not queryset.exists():
            return Response({"message": "No tests found for this class."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize test data and check if a submission exists for each test
        serialized_data = []
        for test in queryset:
            test_data = TestViewSerializer(test).data
            submission_exists = Submission.objects.filter(test=test, student=user).exists()
            test_data["attempted"] = submission_exists  # Add "completed" flag
            serialized_data.append(test_data)

        return Response(serialized_data, status=status.HTTP_200_OK)




class ClassroomDeleteView(generics.DestroyAPIView):
    serializer_class = ClassRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "code"
    def get_queryset(self):
        return ClassRoom.objects.all()

    def destroy(self, request, *args, **kwargs):
        try:
            classroom = self.get_object()
            if classroom.creator != request.user:
                raise PermissionDenied("You are not authorized to delete this classroom.")
            classroom.delete()
            return Response({"message": "Classroom deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except PermissionDenied as e:
            return Response({"message": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ClassRoom.DoesNotExist:
            return Response({"message": "Classroom not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EnrollmentView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnrollmentsSerializer
    permission_classes = [permissions.IsAuthenticated]
    """
    exit a  classroom , currently not updating and retrive ,TODO: update and retrieve 
    """
    def get_queryset(self):
        try:
            return self.request.user.enrollments.all()
        except AttributeError:
            return Enrollment.objects.none()
    
    def get_object(self):
        try:
            class_code = self.kwargs.get("code")
            return get_object_or_404(Enrollment, student=self.request.user, classroom__code=class_code)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentsSerializer
    permission_classes = [permissions.IsAuthenticated]   
    """
    creating an enrollment for a student in a classroom(Joining a classroom)
    
    """
    def create(self, request, *args, **kwargs):
        try:
            student = request.user
            code = kwargs.get("code")
            
            classroom = get_object_or_404(ClassRoom, code=code)
            
            if student.enrollments.filter(classroom=classroom).exists():
                return Response({"message": "You are already enrolled in this class"}, status=status.HTTP_400_BAD_REQUEST)

            Enrollment.objects.create(classroom=classroom, student=student)
            return Response({"message": "You have been enrolled in this class"}, status=status.HTTP_201_CREATED)
        except Http404:
            return Response({"message": "Classroom not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class EnrollmentListView(generics.ListAPIView):
    serializer_class = EnrollmentsSerializer
    permission_classes = [permissions.IsAuthenticated]
    """
    send data of all the classrooms a student is enrolled 
    """

    def get_queryset(self):
        try:
            return self.request.user.enrollments.all()
        except AttributeError:
            return Enrollment.objects.none()
        

class ClassRoomEnrollmentList(generics.ListAPIView):
    serializer_class = EnrollmentsSerializer
    permission_classes = [permissions.IsAuthenticated]
    """
    sends data of students and teacher of a classroom (People tab)

    """
    def get(self, request, *args, **kwargs):
        students=CustomUser.objects.filter(enrollments__classroom__code=kwargs.get("code"))  #check for possible error
        teacher=ClassRoom.objects.get(code=kwargs.get("code")).creator
        students_data=CustomUserSerializer(students,many=True)
        teacher_data=CustomUserSerializer(teacher)
        return Response({"students":students_data.data,"teacher":teacher_data.data})


# anouncement related views

class AnouncementListView(generics.ListCreateAPIView):
    serializer_class=AnouncementSerailizer
    permission_classes=[permissions.IsAuthenticated]

    def get_queryset(self):
        classroom_code=self.kwargs.get('code')
        classroom=get_object_or_404(ClassRoom,code=classroom_code)
        return classroom.anouncements.all()
    
    def perform_create(self, serializer):
        classroom_code=self.kwargs.get('code')
        classroom=get_object_or_404(ClassRoom,code=classroom_code)
        serializer.save(classroom=classroom)

