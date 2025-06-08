from django.contrib import admin
from .models import Test,TestQuestion,Submission
# Register your models here.
admin.site.register(Test)
admin.site.register(TestQuestion)
admin.site.register(Submission)
