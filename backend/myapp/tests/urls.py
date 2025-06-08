from django.urls import path
from . import views
from questions.views import AddQuestionBankView, ListQuestionBankView

urlpatterns = [
    path('create-test/',views.TestListCreateView.as_view(),name='test'),
    path('attempt/<int:id>/',views.AttemptTestView.as_view(),name='test-detail'),
    path('submit-test/',views.SubmitTestView.as_view(),name='test-submit'),
    path('all-tests/',views.StudentTestView.as_view(),name='all-tests'),
    path('test-result/<int:id>/',views.TestResultView.as_view(),name='test-result'),
    path('add_to_bank/', AddQuestionBankView.as_view(), name='add_to_bank'),
    path('list_question_bank/', ListQuestionBankView.as_view(), name='list_question_bank'),
]