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
            return Response(serializer.errors)


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
                get_user = AuthUser.objects.get(username=data['username'])

                if get_user.check_password(data['password'].encode('utf-8')):
                    return Response({"username": data['username']})
                else:
                    raise ValidationError('ログインに失敗しました', 404)

            except ObjectDoesNotExist:
                raise ValidationError('ログインに失敗しました', 404)
        else:
            return Response(serializer.errors)
#
#
# class SignInNoTokenViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = SignInNoTokenSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When SignInNoToken api access, run this method.
#         This method checks username and password. If success signup, response user's data.
#         :param request: Username and password
#         :return: User's movies and profile data.
#         """
#
#         data = request.data
#         serializer = SignInNoTokenSerializer(data=data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             try:
#                 get_user = AuthUser.objects.get(username=data['username'])
#                 token = Token.objects.get(user_id=get_user.pk)
#
#                 if get_user.check_password(data['password'].encode('utf-8')):
#                     backup_obj = BackUp.objects.filter(username=get_user).values(
#                         'movie__title', 'movie__tmdb_id', 'movie__overview', 'movie__poster_path',
#                         'movie__genre__name', 'movie__genre__genre_id',
#                         'onomatopoeia__name',
#                         'dvd', 'fav',
#                         'add_date',
#                         'username__username', 'username__email', 'username__birthday'
#                     )
#
#                     response_list = list(backup_obj)
#                     response_list.append({'token': str(token)})
#                     response_list.append({'username': str(get_user.username)})
#                     response_list.append({'email': str(get_user.email)})
#                     response_list.append({'birthday': int(get_user.birthday)})
#                     response_list.append({'profile_img': str(get_user.img)})
#
#                     return JsonResponse({'results': response_list})
#
#                 else:
#                     raise ValidationError('ユーザ名かパスワードが違います')
#
#             except ObjectDoesNotExist:
#                 raise ValidationError('ユーザ名かパスワードが違います')
#         else:
#             return Response(serializer.errors)
#
#
# class UpdatePasswordViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = UpdatePasswordSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When ChangePassword api access, run this method.
#         This method changes password and return token.
#         :param request: Include token, now_password and new_password
#         :return: User's token.
#         """
#
#         if request.method == 'POST':
#             data = request.data
#
#             if not data['token']:
#                 raise ValidationError('認証情報が含まれていません')
#             if not data['now_password']:
#                 raise ValidationError('現在のパスワードが含まれていません')
#             if not data['new_password']:
#                 raise ValidationError('新しいパスワードが含まれていません')
#
#             try:
#                 user_id = Token.objects.get(key=data['token']).user_id
#                 get_user = AuthUser.objects.get(pk=user_id)
#
#                 if get_user.check_password(data['now_password'].encode('utf-8')):
#                     get_user.set_password(data['new_password'])
#                     get_user.save()
#                     token = Token.objects.get(user_id=get_user.pk)
#
#                     return JsonResponse({'token': str(token)})
#                 else:
#                     raise ValidationError('現在のパスワードが異なるため変更に失敗しました')
#
#             except ObjectDoesNotExist:
#                 raise ValidationError('ユーザが見つかりませんでした')
#
#
# class UpdateEmailViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = UpdateEmailSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When ChangeEmail api access, run this method.
#         This method changes email and return new_email.
#         :param request: Include token and new_email
#         :return: User's new email.
#         """
#
#         if request.method == 'POST':
#             data = request.data
#
#             if not data['token']:
#                 raise ValidationError('認証情報が含まれていません')
#             if not data['new_email']:
#                 raise ValidationError('新しいメールアドレスが含まれていません')
#
#             serializer = UpdateEmailSerializer(data=data)
#             if serializer.is_valid():
#                 try:
#                     user_id = Token.objects.get(key=data['token']).user_id
#                     get_user = AuthUser.objects.get(pk=user_id)
#                     get_user.email = data['new_email']
#                     get_user.save()
#
#                     return JsonResponse({'new_email': data['new_email']})
#                 except:
#                     raise ValidationError('ユーザが見つかりませんでした')
#             else:
#                 return Response(serializer.errors)
#
#
# class UpdateSexViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = UpdateSexSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When ChangeSex api access, run this method.
#         This method changes sex and return new_sex.
#         :param request: Include token and new_sex
#         :return: User's new sex.
#         """
#
#         if request.method == 'POST':
#             data = request.data
#
#             if not data['token']:
#                 raise ValidationError('認証情報が含まれていません')
#             if not data['new_sex']:
#                 raise ValidationError('新しい性別が含まれていません')
#             if not (data['new_sex'] == 'M' or data['new_sex'] == 'F'):
#                 raise ValidationError('性別の入力形式が正しくありません')
#
#             serializer = UpdateSexSerializer(data=data)
#             if serializer.is_valid():
#                 try:
#                     user_id = Token.objects.get(key=data['token']).user_id
#                     get_user = AuthUser.objects.get(pk=user_id)
#                     get_user.sex = data['new_sex']
#                     get_user.save()
#
#                     return JsonResponse({'new_sex': data['new_sex']})
#                 except:
#                     raise ValidationError('ユーザが見つかりませんでした')
#             else:
#                 return Response(serializer.errors)
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
