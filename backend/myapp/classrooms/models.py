from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from users.models import CustomUser
import random
import string

def generate_unique_code():
    length = 6  # Length of the random code
    while True:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=length))
        if not ClassRoom.objects.filter(code=code).exists():
            return code
class ClassRoom(models.Model):
    name=models.CharField(max_length=40)
    code=models.CharField(max_length=10,unique=True,default=generate_unique_code)
    creator=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='classrooms')

    def __str__(self):
        return '{}-{}'.format(self.name,self.creator.email)


class Announcement(models.Model):
    classroom=models.ForeignKey(ClassRoom,on_delete=models.CASCADE,related_name='anouncements')
    title=models.CharField(max_length=255)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    

class Enrollment(models.Model):
    student=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='enrollments')
    classroom=models.ForeignKey(ClassRoom,on_delete=models.CASCADE,related_name='enrollments')
    date_joined=models.DateTimeField(auto_now_add=True)
    

    class Meta:
        unique_together=('student','classroom')
    
    def __str__(self):
        return '{}-{}'.format(self.student.email,self.classroom.name)

