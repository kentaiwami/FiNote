from django.core.exceptions import ValidationError, ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework_jwt.serializers import User
from FiNote_API.v1.user_serializer import *
from rest_framework.response import Response


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

            return Response({'user': str(user)})
        else:
            return Response(serializer.errors, 400)


class LoginViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = LoginSerializer

    @staticmethod
    def create(request):
        """
        When Login api access, run this method.
        This method checks username and password. If success signup, response username.
        :param request: Request user's data.(username and password)
        :return: Username

        :type request object
        """

        data = request.data
        serializer = LoginSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data['username'])

            except ObjectDoesNotExist:
                raise serializers.ValidationError('ログインに失敗しました')

            if user.check_password(data['password'].encode('utf-8')):
                return Response({'username': data['username']})
            else:
                raise serializers.ValidationError('ログインに失敗しました')

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

            if user.check_password(data['now_password'].encode('utf-8')):
                user.set_password(data['new_password'])
                user.save()

                return Response({'username': str(user)})
            else:
                raise serializers.ValidationError('現在のパスワードが異なるため変更に失敗しました')

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

            if user.check_password(data['password'].encode('utf-8')):
                user.email = data['new_email']
                user.save()

                return Response({'username': str(user)})
            else:
                raise serializers.ValidationError('パスワードが違います')
        else:
            return Response(serializer.errors)


#
#
# class UpdateProfileImgViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = UpdateProfileImgSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When SetProfileImg api access, run this method.
#         This method sets img and return token.
#         :param request: Include token and img base64 string.
#         :return: User's token.
#         """
#
#         if request.method == 'POST':
#             data = request.data
#
#             if not data['token']:
#                 raise ValidationError('認証情報が含まれていません')
#             if not data['img']:
#                 raise ValidationError('画像情報が含まれていません')
#
#             try:
#                 # tokenからユーザの割り出し
#                 user_id = Token.objects.get(key=data['token']).user_id
#                 get_user = AuthUser.objects.get(pk=user_id)
#
#                 # 古いプロフ画像の削除
#                 old_img_path = settings.MEDIA_ROOT + '/' + str(get_user.img)
#
#                 if os.path.isfile(old_img_path):
#                     os.remove(old_img_path)
#
#                 # base64文字列からファイルインスタンスの生成
#                 format, img_str = data['img'].split(';base64,')
#                 ext = format.split('/')[-1]
#                 img_data = ContentFile(base64.b64decode(img_str), name=get_user.username + '.' + ext)
#
#                 # 画像の保存
#                 get_user.img = img_data
#                 get_user.save()
#
#                 return JsonResponse({'token': str(data['token'])})
#
#             except ObjectDoesNotExist:
#                 raise ValidationError('ユーザが見つかりませんでした')
#
#
