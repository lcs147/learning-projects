from rest_framework import serializers
from .models import Task
from .models import User

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'content', 'concluded', 'user']
        read_only_fields = ['user']

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'],
            password = validated_data['password'],
            first_name = validated_data['first_name']
        )
        return user