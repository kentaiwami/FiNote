from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework_jwt.serializers import User
from FiNote_API.models import AuthUser
from FiNote_API.v1.user_serializer import *
from rest_framework.response import Response


class SignUpUserViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = SignUpUserSerializer

    @staticmethod
    def create(request):
        """
        ユーザを作成する
        :param request: username, password, email, birthyear
        :return         user's pk
        """

        data = request.data
        serializer = SignUpUserSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError('このユーザ名は既に使われています')

        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError('このメールアドレスは既に使われています')

        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            birthyear=data['birthyear'],
        )

        return Response({'id': user.pk})


class SignInUserViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = SignInUserSerializer

    @staticmethod
    def create(request):
        """
        ユーザログインを実施
        :param request: username, password
        :return         user's pk
        """

        data = request.data
        serializer = SignInUserSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
        except:
            raise serializers.ValidationError('ユーザが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('パスワードが間違っています')

        return Response({'id': user.pk})


class UpdatePasswordViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UpdatePasswordSerializer

    @staticmethod
    def create(request):
        """
        パスワードを変更する

        :param request: username, now_password, new_password
        :return:        username
        """

        data = request.data
        serializer = UpdatePasswordSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])

        except ObjectDoesNotExist:
            raise serializers.ValidationError('ユーザが見つかりませんでした')

        if not user.check_password(data['now_password'].encode('utf-8')):
            raise serializers.ValidationError('現在のパスワードが異なるため変更に失敗しました')

        user.set_password(data['new_password'])
        user.save()

        return Response({'username': str(user)})


class UpdateEmailViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UpdateEmailSerializer

    @staticmethod
    def create(request):
        """
        メールアドレスを変更する

        :param request: username, password, new_email
        :return:        username
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
