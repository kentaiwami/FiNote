from rest_framework import serializers
from FiNote_API.models import *


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=256, allow_blank=False, required=True)
    password = serializers.CharField(max_length=256, allow_blank=False, required=True)
    email = serializers.EmailField(max_length=100, allow_blank=False, required=True)
    birthday = serializers.IntegerField(allow_null=False, required=True)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    password = serializers.CharField(allow_blank=False, allow_null=False, required=True)


class UpdatePasswordSerializer(serializers.Serializer):
    username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    now_password = serializers.CharField(allow_blank=False, allow_null=False, required=True)
    new_password = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#
#
# class SignInNoTokenSerializer(serializers.Serializer):
#     username = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     password = serializers.CharField(allow_blank=False, required=True)
#
#

#
#
# class UpdateEmailSerializer(serializers.Serializer):
#     token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     new_email = serializers.EmailField(allow_blank=False, allow_null=False, required=True)
#
#
# class UpdateSexSerializer(serializers.Serializer):
#     token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     new_sex = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#
#
# class UpdateProfileImgSerializer(serializers.Serializer):
#     token = serializers.CharField(allow_blank=False, allow_null=False, required=True)
#     img = serializers.CharField(allow_blank=True, allow_null=False, required=True)
