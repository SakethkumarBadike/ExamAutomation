from django.shortcuts import render
from rest_framework import generics
from .models import Question,QuestionBank
from .serializers import QuestionSerializer, QuestionBankSerializer
from users.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class AddQuestionView(generics.CreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=self.request.user
        if(CustomUser.objects.filter(id=user.id).exists()):
            data=serializer.validated_data
            question = Question.objects.create(
                user=user,
                title=data['title'],
                type=data['type'],
                options=data.get('options', None),
                marks=data.get('marks', 1),
                difficulty=data.get('difficulty', 'easy'),
                answer=data.get('answer', None),
                correct_option=data.get('correct_option', None)
            )
            question.save()
            question_bank = QuestionBank.objects.create(user=user)
            question_bank.questions.add(question)
            question_bank.save()
        else:
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AddQuestionBankView(generics.CreateAPIView):
    serializer_class = QuestionBankSerializer
    permission_classes = [IsAuthenticated]  

    def post(self, request, *args, **kwargs):
        user = request.user

        if not CustomUser.objects.filter(id=user.id).exists():
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        question_data = request.data

      
        question_serializer = QuestionSerializer(data=question_data)
        question_serializer.is_valid(raise_exception=True)
        question = question_serializer.save()  

        
        question_bank, _ = QuestionBank.objects.get_or_create(user=user)

       
        question_bank.questions.add(question)

        
        bank_serializer = self.get_serializer(question_bank)
        return Response(bank_serializer.data, status=status.HTTP_201_CREATED)


class ListQuestionBankView(generics.ListAPIView):
    serializer_class = QuestionBankSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user=self.request.user
        if(CustomUser.objects.filter(id=user.id).exists()):
            question_banks = QuestionBank.objects.filter(user=user)
            serializer = self.get_serializer(question_banks, many=True)
        else:
            return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.data, status=status.HTTP_200_OK)