from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    concluded = models.BooleanField(default=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Tasks")

    def __str__(self): return self.title