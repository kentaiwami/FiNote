from rest_framework import serializers
from FiNote_API.models import *


class UpdateDVDFAVSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    tmdb_id = serializers.IntegerField(allow_null=False, required=True)
    dvd = serializers.BooleanField(required=True)
    fav = serializers.BooleanField(required=True)


class AddMovieSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    title = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    overview = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    tmdb_id = serializers.IntegerField(allow_null=False, required=True)
    poster = serializers.CharField(max_length=512, allow_blank=False, required=True)
    genre = serializers.ListField(allow_null=False, required=True)
    onomatopoeia = serializers.ListField(allow_null=False, required=True)
    dvd = serializers.BooleanField(required=True)
    fav = serializers.BooleanField(required=True)


class UpdateOnomatopoeiaSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    tmdb_id = serializers.IntegerField(allow_null=False, required=True)
    onomatopoeia = serializers.ListField(allow_null=False, required=True)


class DeleteMovieSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    tmdb_id = serializers.IntegerField(allow_null=False, required=True)


class GetMovieOnomatopoeiaSerializer(serializers.Serializer):
    tmdb_ids = serializers.ListField(allow_null=False, required=True)

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
# class GetOnomatopoeiaCountByMovieIDSerializer(serializers.Serializer):
#     tmdb_id = serializers.CharField(allow_null=False, required=True)
#     onomatopoeia_name_list = serializers.CharField(allow_null=False, required=True)
