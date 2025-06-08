from django.urls import path,include 
from classrooms.views import ClassroomListView
from classrooms.views import ClassroomDeleteView,EnrollmentCreateView,EnrollmentView,EnrollmentListView,ClassRoomEnrollmentList,ClassTestsView,AnouncementListView

urlpatterns = [
    path('', ClassroomListView.as_view(), name='classroom-list'),
    path("<str:code>/", ClassroomDeleteView.as_view(), name="classroom-delete"),
    path('join/<str:code>/', EnrollmentCreateView.as_view(), name='classroom-join'),
    path('student/enrollments/', EnrollmentListView.as_view(), name='enrollment-create'),
    path('enrollments/<str:code>/', EnrollmentView.as_view(), name='enrollment-exit'),
    path('people/<str:code>/',ClassRoomEnrollmentList.as_view(),name='classroom-enrollments'),
    path('tests/<str:code>', ClassTestsView.as_view(), name='test-list'),
    path('announcements/<str:code>',AnouncementListView.as_view(),name='classroom-announcements')
]
