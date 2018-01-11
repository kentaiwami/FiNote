from rest_framework import serializers
from FiNote_API.models import *


class GetMoviesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Movie
        fields = ('title', 'tmdb_id', 'overview', 'poster')#ユーザがつけたオノマトペ

# class AddMovieSerializer(serializers.Serializer):
#     username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     movie_title = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     overview = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     movie_id = serializers.IntegerField(allow_null=False, required=True)
#     genre_id_list = serializers.CharField(allow_blank=True, allow_null=True)
#     onomatopoeia = serializers.CharField(allow_blank=False, allow_null=False)
#     dvd = serializers.IntegerField(allow_null=False, required=True)
#     fav = serializers.IntegerField(allow_null=False, required=True)


# class UpdateOnomatopoeiaSerializer(serializers.Serializer):
#     username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     movie_id = serializers.IntegerField(allow_null=False, required=True)
#     onomatopoeia = serializers.CharField(allow_blank=False, allow_null=False)
#
#
# class DeleteBackupSerializer(serializers.Serializer):
#     username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     movie_id = serializers.IntegerField(allow_null=False, required=True)
#
#
# class UpdateStatusSerializer(serializers.Serializer):
#     username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     movie_id = serializers.IntegerField(allow_null=False, required=True)
#     dvd = serializers.IntegerField(default=0)
#     fav = serializers.IntegerField(default=0)
#
#
# class GetUsersSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AuthUser
#         fields = ('username',)
#
#
# class GetGenresSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Genre
#         fields = ('name',)
#
#
# class GetOnomatopoeiaSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Onomatopoeia
#         fields = ('name',)
#
#
# class GetMoviesSerializer(serializers.ModelSerializer):
#     genre = GetGenresSerializer(many=True)
#     user = GetUsersSerializer(many=True)
#     onomatopoeia = GetOnomatopoeiaSerializer(many=True)
#
#     class Meta:
#         model = Movie
#         fields = ('title', 'tmdb_id', 'genre', 'user', 'onomatopoeia')
#
#
# class GetOnomatopoeiaCountSerializer(serializers.ModelSerializer):
#     onomatopoeia = GetOnomatopoeiaSerializer(many=False)
#     movie = GetMoviesSerializer(many=False)
#
#     class Meta:
#         model = OnomatopoeiaCount
#         fields = ('count', 'onomatopoeia', 'movie')
#
#
# class GetRecentlyMovieSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Movie
#         fields = ('title', 'overview', 'poster_path')
#
#
# class GetMovieByAgeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Movie
#         fields = ('title', 'overview', 'poster_path')
#
#
# class GetMovieReactionSerializer(serializers.Serializer):
#     tmdb_id_list = serializers.CharField(allow_null=False, required=True)
#
#
# class GetMovieByOnomatopoeiaSerializer(serializers.Serializer):
#     onomatopoeia_name = serializers.CharField(max_length=100, allow_null=False, required=True, allow_blank=False)
#
#

#
#
# class GetSearchMovieTitleResultsSerializer(serializers.Serializer):
#     movie_title = serializers.CharField(allow_null=False, required=True)
#     page_number = serializers.IntegerField(allow_null=False, required=True)
#
#
# class GetOriginalTitleSerializer(serializers.Serializer):
#     id = serializers.IntegerField(allow_null=False, required=True)
#
#
# class GetOnomatopoeiaCountByMovieIDSerializer(serializers.Serializer):
#     tmdb_id = serializers.CharField(allow_null=False, required=True)
#     onomatopoeia_name_list = serializers.CharField(allow_null=False, required=True)
