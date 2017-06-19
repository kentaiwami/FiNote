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


class SignInNoTokenSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(allow_blank=False, required=True)


class ChangePasswordSerializer(serializers.Serializer):
    token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    now_password = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    new_password = serializers.CharField(allow_blank=False, allow_null=False, required=True)


class ChangeEmailSerializer(serializers.Serializer):
    token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    new_email = serializers.EmailField(allow_blank=False, allow_null=False, required=True)


class ChangeSexSerializer(serializers.Serializer):
    token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    new_sex = serializers.CharField(allow_blank=False, allow_null=False, required=True)


class SetProfileImgSerializer(serializers.Serializer):
    token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    img = serializers.CharField(allow_blank=True, allow_null=False, required=True)


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


class GetUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ('username',)


class GetGenresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('name',)


class GetOnomatopoeiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onomatopoeia
        fields = ('name',)


class GetMoviesSerializer(serializers.ModelSerializer):
    genre = GetGenresSerializer(many=True)
    user = GetUsersSerializer(many=True)
    onomatopoeia = GetOnomatopoeiaSerializer(many=True)

    class Meta:
        model = Movie
        fields = ('title', 'tmdb_id', 'genre', 'user', 'onomatopoeia')


class GetOnomatopoeiaCountSerializer(serializers.ModelSerializer):
    onomatopoeia = GetOnomatopoeiaSerializer(many=False)
    movie = GetMoviesSerializer(many=False)

    class Meta:
        model = OnomatopoeiaCount
        fields = ('count', 'onomatopoeia', 'movie')


class GetRecentlyMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title', 'overview', 'poster_path')


class GetMovieByAgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ('title', 'overview', 'poster_path')


class GetMovieReactionSerializer(serializers.Serializer):
    tmdb_id_list = serializers.CharField(allow_null=False, required=True)


class GetMovieByOnomatopoeiaSerializer(serializers.Serializer):
    onomatopoeia_name = serializers.CharField(max_length=100, allow_null=False, required=True, allow_blank=False)


class GetMovieByIDSerializer(serializers.Serializer):
    tmdb_id_list = serializers.CharField(allow_null=False, required=True)
