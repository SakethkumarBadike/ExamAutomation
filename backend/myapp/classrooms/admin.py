from django.contrib import admin
from .models import ClassRoom,Announcement,Enrollment

# Register your models here.
admin.site.register(ClassRoom)
admin.site.register(Announcement)
admin.site.register(Enrollment)