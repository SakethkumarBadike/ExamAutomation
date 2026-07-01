from rest_framework import generics
from .models import Test
from .serializers import AttemptTestSerializer, TestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from questions.models import Question
from .serializers import SubmissionSerializer,StudentTestSerializer,TestResultSerializer
from .models import Submission
from users.models import CustomUser
from classrooms.models import Enrollment

class TestListCreateView(generics.ListCreateAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    

class TestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AttemptTestView(generics.RetrieveAPIView):
    lookup_field = 'id'
    queryset = Test.objects.all()
    serializer_class = AttemptTestSerializer
    class Meta:
        model = Test
        fields = '__all__'




class SubmitTestView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = SubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        test = Test.objects.get(id=serializer.validated_data['test_id'])
        user = request.user
        answers = serializer.validated_data['answers']

        submissions = []
        for answer in answers:
            question = Question.objects.get(id=answer['question_id'])
            marks=0
            if(question.type == 'MCQ'):
                if question.correct_option == answer['selected_option']:
                    marks = question.marks
                else:
                    marks= 0
            submission = Submission.objects.create(
                test=test,
                question=question,
                student=user,
                selected_option=answer.get('selected_option'),
                answer_text=answer.get('answer_text'),
                marks_obtained=marks
            )
            submissions.append(submission)

        return Response({"message": "Test submitted successfully"}, status=status.HTTP_201_CREATED)


class StudentTestView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentTestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "T":
            classroom_ids = user.classrooms.values_list("id", flat=True)
            return Test.objects.filter(classroom_id__in=classroom_ids).select_related("classroom").distinct()

        enrolled_classroom_ids = Enrollment.objects.filter(student_id=user.id).values_list("classroom_id", flat=True)
        return Test.objects.filter(classroom_id__in=enrolled_classroom_ids).select_related("classroom").distinct()
      
class TestResultView(generics.RetrieveAPIView):
    lookup_field = 'id'
    serializer_class = TestResultSerializer
    def get_queryset(self):
        print(self.request.user,self.kwargs.get('id'))
        user = self.request.user
        test_id = self.kwargs.get('id')
        return Test.objects.filter(id=test_id)