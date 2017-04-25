from rest_framework import serializers
from .models import *


class SignUpSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=256, allow_blank=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    email = serializers.EmailField(max_length=100, allow_blank=False, required=True)
    birthday = serializers.IntegerField(allow_null=False, required=True)
    sex = serializers.CharField(max_length=1, allow_blank=False, allow_null=False, required=True)


class SignInWithTokenSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    token = serializers.CharField(allow_blank=False, allow_null=False, required=True)


class MovieAddSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    movie_title = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    overview = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    movie_id = serializers.IntegerField(allow_null=False, required=True)
    genre_id_list = serializers.CharField(allow_blank=True, allow_null=True)
    onomatopoeia = serializers.CharField(allow_blank=False, allow_null=False)
    dvd = serializers.IntegerField(default=0)
    fav = serializers.IntegerField(default=0)


class OnomatopoeiaUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    movie_id = serializers.IntegerField(allow_null=False, required=True)
    onomatopoeia = serializers.CharField(allow_blank=False, allow_null=False)


class DeleteBackupSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    movie_id = serializers.IntegerField(allow_null=False, required=True)


class StatusUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    movie_id = serializers.IntegerField(allow_null=False, required=True)
    dvd = serializers.IntegerField(default=0)
    fav = serializers.IntegerField(default=0)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ('name',)


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('name',)


class OnomatopoeiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onomatopoeia
        fields = ('name',)


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title', 'tmdb_id', 'genre', 'user', 'onomatopoeia')


class OnomatopoeiaCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnomatopoeiaCount
        fields = ('count', 'onomatopoeia', 'movie')
