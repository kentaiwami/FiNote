from rest_framework import serializers
from .models import User, Genre, Onomatopoeia, Movie, OnomatopoeiaCount


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
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
