from rest_framework import serializers
from .models import Test, TestQuestion
from classrooms.models import ClassRoom
from questions.models import Question
from django.core.exceptions import ValidationError
from .models import Submission
from users.models import CustomUser
from classrooms.models import Enrollment
from classrooms.serializers import ClassRoomSerializer
from questions.serializers import QuestionSerializer 


class TestQuestionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()

    class Meta:
        model = TestQuestion
        fields = ['question', 'order']
    """
    While validated_data behaves like a dictionary, it's technically an instance of OrderedDict. This means it preserves the order of the keys as they were defined in the serializer.
    
    """
    def create(self, validated_data):
        question_data = validated_data.pop('question')
        # Create the Question instance
        question = Question.objects.create(**question_data)
        # Create the TestQuestion instance
        return TestQuestion.objects.create(question=question, **validated_data)


class TestSerializer(serializers.ModelSerializer):
    test_questions = TestQuestionSerializer(many=True)

    class Meta:
        model = Test
        fields = [
            'title', 'description', 'total_marks', 'start_time',
                  'end_time', 'duration', 'num_questions', 'test_questions']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        classroom_code = request.data.get('classroom_code')

        try:
            classroom = ClassRoom.objects.get(code=classroom_code)
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError("Invalid classroom code")

        test_questions_data = validated_data.pop('test_questions')
        test = Test.objects.create(classroom=classroom, **validated_data)

        try:
            test.full_clean()  # Call full_clean to enforce validation rules
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)  # Raise as DRF ValidationError

        if len(test_questions_data) != test.num_questions:
            raise serializers.ValidationError(
                "Number of questions does not match num_questions field"
            )

        for order, question_data in enumerate(test_questions_data, start=1):
            print(question_data)
            question_serializer = QuestionSerializer(data=question_data['question'])
            question_serializer.is_valid(raise_exception=True)
            question = question_serializer.save()

            TestQuestion.objects.create(test=test, question=question, order=order)

        return test

    def update(self, instance, validated_data):
        test_questions_data = validated_data.pop('test_questions',)

        # Update Test instance fields
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.total_marks = validated_data.get('total_marks', instance.total_marks)
        instance.start_time = validated_data.get('start_time', instance.start_time)
        instance.end_time = validated_data.get('end_time', instance.end_time)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.num_questions = validated_data.get('num_questions', instance.num_questions)

        try:
            instance.full_clean()  # Call full_clean to enforce validation rules
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)  # Raise as DRF ValidationError

        instance.save()

        # Update or create TestQuestion objects
        for order, question_data in enumerate(test_questions_data, start=1):
            question_serializer = QuestionSerializer(data=question_data['question'])
            question_serializer.is_valid(raise_exception=True)
            question = question_serializer.save()

            test_question, created = TestQuestion.objects.get_or_create(
                test=instance, order=order, defaults={'question': question}
            )

            if not created:
                test_question.question = question
                test_question.save()

        return instance
    

class TestViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Test
        fields = '__all__'

    def get_queryset(self):
        code=self.kwargs.get('code')
        return Test.objects.filter(classroom__code=code)
    
class AttemptQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'title', 'type', 'options', 'marks', 'difficulty']  # Add 'id'

class AttemptTestSerializer(serializers.ModelSerializer):
    test_questions = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ['id', 'title', 'description', 'total_marks', 'start_time',
                  'end_time', 'duration', 'num_questions', 'test_questions']

    def get_test_questions(self, obj):
        test_questions = TestQuestion.objects.filter(test=obj).order_by('order')
        questions = [test_question.question for test_question in test_questions]
        return AttemptQuestionSerializer(questions, many=True).data



class AnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.IntegerField(required=False, allow_null=True)
    answer_text = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        question = Question.objects.filter(id=data['question_id']).first()
        if not question:
            raise serializers.ValidationError("Invalid question ID")

        if question.type == 'MCQ' and data.get('answer_text'):
            raise serializers.ValidationError("MCQ questions cannot have text answers")
        if question.type == 'DS' and data.get('selected_option') is not None:
            raise serializers.ValidationError("Descriptive questions cannot have selected options")

        return data


class SubmissionSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    answers = AnswerSerializer(many=True)

    def validate_test_id(self, value):
        if not Test.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid test ID")
        return value


## serializers related to showing all tests to students
class StudentTestSerializer(serializers.ModelSerializer):
    classroom=serializers.SerializerMethodField()
    def get_classroom(self,obj):
        classroom=ClassRoom.objects.filter(code=obj.classroom.code)
        return ClassRoomSerializer(classroom,many=True).data
    class Meta:
        model=Test
        fields=['id','title','description','total_marks','start_time','end_time','duration','classroom']
    
class StudentAllTestSerializer(serializers.ModelSerializer):
    tests=serializers.SerializerMethodField()
    def get_tests(self,obj):
        enrollments=Enrollment.objects.filter(student=obj.id)
        tests=[]
        for enrollment in enrollments:
            classroom=enrollment.classroom
            classroom_tests=StudentTestSerializer(Test.objects.filter(classroom=classroom),many=True).data
            # print(classroom_tests)
            if(len(classroom_tests)>0):
                tests.extend(classroom_tests)
        return tests
    class Meta:
        model=CustomUser
        fields=['tests']


class TestResultSerializer(serializers.ModelSerializer):
    total_marks = serializers.SerializerMethodField()
    obtained_marks = serializers.SerializerMethodField()
    correct_answers = serializers.SerializerMethodField()
    wrong_answers = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='test.end_time', format="%Y-%m-%d", read_only=True)
    classroom_name = serializers.CharField(source='test.classroom.name', read_only=True)

    def get_percentage(self, obj):
        obtained_marks = self.get_obtained_marks(obj)
        total_marks = self.get_total_marks(obj)
        if total_marks == 0:
            return 0
        return (obtained_marks / total_marks) * 100

    def get_wrong_answers(self, obj):
        user=self.context['request'].user
        submissions = Submission.objects.filter(test=obj.id, student=user)
        wrong_answers = 0
        for submission in submissions:
            if submission.marks_obtained == 0:
                wrong_answers += 1
        return wrong_answers
    
    def get_correct_answers(self, obj):
        user=self.context['request'].user
        submissions = Submission.objects.filter(test=obj.id, student=user)
        correct_answers = 0
        for submission in submissions:
            if submission.marks_obtained > 0:
                correct_answers += 1
        return correct_answers
    
    def get_total_marks(self, obj):
        questions = TestQuestion.objects.filter(test=obj.id)
        total_marks = 0
        for question in questions:
            total_marks += question.question.marks
        return total_marks

    def get_obtained_marks(self, obj):
        user=self.context['request'].user
        submissions = Submission.objects.filter(test=obj.id, student=user)
        obtained_marks = 0
        for submission in submissions:
            obtained_marks += submission.marks_obtained
        return obtained_marks
        
    class Meta:
        model = Test
        fields = [
            'id',
            'title',
            'total_marks',
            'obtained_marks',
            'percentage',
            'correct_answers',
            'wrong_answers',
            'date',
            'classroom_name'
        ]