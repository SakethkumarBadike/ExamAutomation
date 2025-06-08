from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    class Meta:
        db_table='users_customuser'
        
    ROLE_CHOICES = (
        ('S', 'Student'),
        ('T', 'Teacher'),
        ('A', 'Admin'),
    )
    role=models.CharField(max_length=1,choices=ROLE_CHOICES,default='S')
    email=models.EmailField(unique=True)
    username = models.CharField(max_length=50,null=True,blank=True)  
    USERNAME_FIELD = 'email'  
    REQUIRED_FIELDS=[]
    objects=CustomUserManager()
    
    def __str__(self):
        return self.email


class OTP(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
