from django.urls import path
from tasks import views

urlpatterns = [
    path('register', views.register),
    path('login', views.login),
    path('me', views.me),

    path('tasks', views.TasksListCreate.as_view()),
    path('tasks/<int:pk>', views.TaskDetail.as_view()),
    path('tasks/<int:pk>/conclude', views.ConcludeTask.as_view()),
]
