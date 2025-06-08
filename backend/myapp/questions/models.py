from django.db import models
from users.models import CustomUser
class QuestionBank(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user.username}"

class Question(models.Model):
    QUESTION_TYPES = (
        ('MCQ', 'Multiple Choice Questions'),
        ('DS', 'Descriptive'),
    )
    bank = models.ForeignKey(QuestionBank, on_delete=models.SET_NULL, null=True, blank=True, related_name="questions")
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=3, choices=QUESTION_TYPES)
    options = models.JSONField(blank=True, null=True)  # For MCQs
    marks = models.FloatField(default=1)
    difficulty = models.CharField(
        max_length=10,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='easy'
    )
    
    # Correct Answer Fields (merged from CorrectAnswer model)
    answer = models.TextField(blank=True, null=True)  # For descriptive questions
    correct_option = models.IntegerField(blank=True, null=True)  # For MCQs

    def __str__(self):
        return self.title


