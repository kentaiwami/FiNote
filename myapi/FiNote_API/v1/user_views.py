from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework_jwt.serializers import User
from FiNote_API.models import AuthUser
from FiNote_API.v1.user_serializer import *
from rest_framework.response import Response
import os
from myapi import settings


class CreateUserViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = CreateUserSerializer

    @staticmethod
    def create(request):
        """
        When CreateUser api access, run this method.
        This method checks sign in form data, create new user and response token.
        :param request: User request data.(username, email, password, birthday year)
        :return content: Username.
        
        :type request: object
        """

        data = request.data
        serializer = CreateUserSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError('このユーザ名は既に使われています')

            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError('このメールアドレスは既に使われています')

            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                birthday=data['birthday'],
            )

            return Response({'id': user.pk})
        else:
            return Response(serializer.errors, 400)


class UpdatePasswordViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UpdatePasswordSerializer

    @staticmethod
    def create(request):
        """
        When UpdatePassword api access, run this method.
        This method changes password and return username.
        :param request: Include username, now_password and new_password
        :return: User name.
        """

        data = request.data
        serializer = UpdatePasswordSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data['username'])

            except ObjectDoesNotExist:
                raise serializers.ValidationError('ユーザが見つかりませんでした')

            if not user.check_password(data['now_password'].encode('utf-8')):
                raise serializers.ValidationError('現在のパスワードが異なるため変更に失敗しました')

            user.set_password(data['new_password'])
            user.save()

            return Response({'username': str(user)})

        else:
            return Response(serializer.errors)


class UpdateEmailViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UpdateEmailSerializer

    @staticmethod
    def create(request):
        """
        When Update email api access, run this method.
        This method changes email and return username.
        :param request: Include username, password and new_email
        :return: User name
        """

        data = request.data
        serializer = UpdateEmailSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data["username"])
            except ObjectDoesNotExist:
                raise serializers.ValidationError('ユーザが見つかりませんでした')

            if not user.check_password(data['password'].encode('utf-8')):
                raise serializers.ValidationError('パスワードが違います')

            user.email = data['new_email']
            user.save()

            return Response({'username': str(user)})

        else:
            raise serializers.ValidationError(serializer.errors)


class UpdateProfileImgViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UpdateProfileImgSerializer

    @staticmethod
    def create(request):
        """
        When Update profile image api access, run this method.
        This method sets img and return username.
        :param request: Include username, password and image.
        :return: User name.
        """

        data = request.data
        serializer = UpdateProfileImgSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data['username'])

            except ObjectDoesNotExist:
                raise serializers.ValidationError('ユーザが見つかりませんでした')

            if not user.check_password(data['password'].encode('utf-8')):
                raise serializers.ValidationError('パスワードが間違っています')

            # 古いプロフ画像の削除
            old_img_path = settings.MEDIA_ROOT + '/' + str(user.img)

            if os.path.isfile(old_img_path):
                os.remove(old_img_path)

            # 画像の保存
            user.img.save(str(data['img']), data['img'], True)
            user.save()

            return Response({'username': str(user)})

        else:
            raise serializers.ValidationError(serializer.errors)
