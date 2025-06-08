from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from users.models import CustomUser
from classrooms.models import ClassRoom
from questions.models import Question

class Test(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=255)
    description = models.TextField()
    total_marks = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.IntegerField(help_text='Duration in minutes')
    num_questions = models.PositiveIntegerField(default=0)  # Number of questions in the test

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()

        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be earlier than end time.")

        time_diff_minutes = (self.end_time - self.start_time).total_seconds() // 60
        if self.duration > time_diff_minutes:
            raise ValidationError("Duration cannot exceed the time difference between start and end time.")
    

class TestQuestion(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.PositiveIntegerField() 

    class Meta:
        unique_together = (('test', 'question'), ('test', 'order'))
        ordering = ('order',)

    def __str__(self):
        return f"{self.test.title} - Question {self.order}: {self.question.title}"

class Submission(models.Model):
    test=models.ForeignKey(Test,on_delete=models.CASCADE,related_name='submissions')
    question=models.ForeignKey(Question,on_delete=models.CASCADE,related_name='submissions')
    student=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='submissions')
    answer_text = models.TextField(null=True, blank=True)
    marks_obtained = models.FloatField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    selected_option=models.PositiveIntegerField(null=True,blank=True)
   
    def save(self, *args, **kwargs):
        if self.question.type == 'MCQ' and self.answer_text:
            raise ValidationError('MCQ questions cannot have text answers')
        if self.question.type == 'DS' and self.selected_option is not None:
            raise ValidationError('Descriptive questions cannot have selected options')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Submission by {self.student.email} for {self.test.title}"
