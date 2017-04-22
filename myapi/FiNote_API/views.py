from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_jwt.serializers import User

from FiNote_API.functions import MovieAdd
from .serializer import *
from django.core.exceptions import ObjectDoesNotExist


class SignInViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = SignInSerializer

    def create(self, request, *args, **kwargs):
        if request.method == 'POST':
            data = request.data

            if not data['username']:
                raise ValidationError('ユーザ名が入力されていません')
            if not data['email']:
                raise ValidationError('メールアドレスが入力されていないか、不正なアドレスです')
            if not data['password']:
                raise ValidationError('パスワードが入力されていません')
            if not data['birthday']:
                raise ValidationError('生年が入力されていません')
            if not data['sex']:
                raise ValidationError('性別が入力されていません')
            if not (data['sex'] == 'M' or data['sex'] == 'F'):
                raise ValidationError('性別の入力形式が正しくありません')

            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError('このユーザ名は既に使われています')

            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError('このメールアドレスは既に使われています')

            user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'],
                                     birthday=data['birthday'], sex=data['sex'])

            get_user = User.objects.get(username=str(user))
            token = Token.objects.get(user_id=get_user.pk)
            content = {
                'user': str(user),
                'token': token.key,
            }

            return Response(content)


class SignUpWithTokenViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = SignUpWithTokenSerializer

    def create(self, request, *args, **kwargs):
        if request.method == 'POST':
            data = request.data
            if not data['username']:
                raise ValidationError('リクエストにユーザ名が含まれていません')
            if not data['token']:
                raise ValidationError('リクエストに認証情報が含まれていません')

            try:
                get_user = User.objects.get(username=data['username'])
                token = Token.objects.get(user_id=get_user.pk)

                if str(token) == data['token']:
                    return Response(data['username'])
                else:
                    raise ValidationError('ログインに失敗しました', 404)
            except ObjectDoesNotExist:
                raise ValidationError('ログインに失敗しました', 404)


class MovieAddViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieAddSerializer

    def create(self, request, *args, **kwargs):
        if request.method == 'POST':
            # username = request.data['username']
            # movie_title = request.data['movie_title']
            # movie_id = request.data['movie_id']
            r_genre_id_list = request.data['genre_id_list']
            # onomatopoeia = request.data['onomatopoeia']

            genre_obj_dict,genre_obj_list = MovieAdd.genre(self, r_genre_id_list)

            return JsonResponse(genre_obj_dict)


class UserViewSet(viewsets.ModelViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UserSerializer


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer


class OnomatopoeiaViewSet(viewsets.ModelViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = OnomatopoeiaSerializer


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


class OnomatopoeiaCountViewSet(viewsets.ModelViewSet):
    queryset = OnomatopoeiaCount.objects.all()
    serializer_class = OnomatopoeiaCountSerializer
