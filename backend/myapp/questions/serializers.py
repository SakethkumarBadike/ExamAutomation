from .models import Question
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Question, QuestionBank

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'  # Includes 'answer' and 'correct_option' now
    def validate(self, data):
        """
        Validate that MCQ questions do not have an 'answer' field.
        """
        question_type = data.get('type')
        answer = data.get('answer')

        # If the question is MCQ, ensure 'answer' is not provided
        # if question_type == 'MCQ' and answer:
        #     raise serializers.ValidationError({
        #         'answer': "MCQ questions cannot have an 'answer' field. Use 'correct_option' instead."
        #     })

        # # If the question is Descriptive, ensure 'correct_option' is not provided
        # if question_type == 'DS' and data.get('correct_option') is not None:
        #     raise serializers.ValidationError({
        #         'correct_option': "Descriptive questions cannot have a 'correct_option' field. Use 'answer' instead."
        #     })

        return data
    

class QuestionBankSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    class Meta:
        model = QuestionBank
        fields = ['id', 'user', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        question_bank = QuestionBank.objects.create(**validated_data)
        for question_data in questions_data:
            question = Question.objects.create(**question_data)
            question_bank.questions.add(question)
        return question_bank
