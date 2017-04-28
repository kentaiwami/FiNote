import json

from django.http import JsonResponse, HttpResponse
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_jwt.serializers import User

from FiNote_API.functions import *
from .serializer import *
from django.core.exceptions import ObjectDoesNotExist


class SignUpViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer

    def create(self, request):
        """
        When SignUp api access, run this method.
        This method is check sign in form data, create new user and response token.
        :param request: User request data.(username, email, password, birthday year and sex)
        :return content: Username and token.
        
        :type request: object
        """

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

            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                birthday=data['birthday'],
                sex=data['sex']
            )

            get_user = User.objects.get(username=str(user))
            token = Token.objects.get(user_id=get_user.pk)
            content = {
                'user': str(user),
                'token': token.key,
            }

            return Response(content)


class SignInWithTokenViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = SignInWithTokenSerializer

    def create(self, request):
        """
        When SignInWithToken api access, run this method.
        This method is check username and token. If success signup, response username.
        :param request: Request user's data.(username and token)
        :return: Username
        
        :type request object
        """

        if request.method == 'POST':
            data = request.data
            if not data['username']:
                raise ValidationError('リクエストにユーザ名が含まれていません')
            if not data['token']:
                raise ValidationError('リクエストに認証情報が含まれていません')

            try:
                get_user = AuthUser.objects.get(username=data['username'])
                token = Token.objects.get(user_id=get_user.pk)

                if str(token) == data['token']:
                    return Response(data['username'])
                else:
                    raise ValidationError('ログインに失敗しました', 404)
            except ObjectDoesNotExist:
                raise ValidationError('ログインに失敗しました', 404)


class SignInNoTokenViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = SignInNoTokenSerializer

    def create(self, request):
        if request.method == 'POST':
            data = request.data

            if not data['username']:
                raise ValidationError('ユーザ名が含まれていません')
            if not data['password']:
                raise ValidationError('パスワードが含まれていません')

            try:
                get_user = AuthUser.objects.get(username=data['username'])
                token = Token.objects.get(user_id=get_user.pk)

                if get_user.check_password(data['password'].encode('utf-8')):
                    backup_obj = BackUp.objects.filter(username=get_user).values(
                        'movie__title', 'movie__tmdb_id', 'movie__overview',
                        'movie__genre__name',
                        'onomatopoeia__name',
                        'dvd', 'fav',
                        'add_year', 'add_month', 'add_day'
                    )

                    response_list = Backup.create_marged_backups(self, list(backup_obj))
                    response_list.append({'token': str(token)})

                    return JsonResponse({'results': response_list})

                else:
                    raise ValidationError('ユーザ名かパスワードが違います')

            except ObjectDoesNotExist:
                raise ValidationError('ユーザ名かパスワードが違います')


class MovieAddViewSet(viewsets.ViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieAddSerializer

    def create(self, request):
        """
        When MovieAdd api access, run this method.
        This method is add movie, onomatopoeia and genre. If success all process, response genre id and name.
        :param request: Request user's data.(username, movie_title, overview, movie_id(tmdb_id), genre_id_list, onomatopoeia, dvd and fav)
        :return: Genre id and name json data.
        
        :type request object
        """

        if request.method == 'POST':
            r_genre_id_list = request.data['genre_id_list']
            r_onomatopoeia_list = request.data['onomatopoeia']

            # ジャンルの登録とpkの取得
            if not r_genre_id_list:
                r_genre_id_list = []

            if type(r_genre_id_list) is str:
                r_genre_id_list = MovieAdd.conversion_str_to_list(self, r_genre_id_list, 'int')
            elif type(r_genre_id_list) is not list:
                raise ValidationError('不正な形式です')

            genre_obj_dict, genre_obj_list = MovieAdd.genre(self, r_genre_id_list)

            # オノマトペの登録とpkの取得
            if type(r_onomatopoeia_list) is str:
                r_onomatopoeia_list = MovieAdd.conversion_str_to_list(self, r_onomatopoeia_list, 'str')
            elif type(r_onomatopoeia_list) is not list:
                raise ValidationError('不正な形式です')

            onomatopoeia_obj_list = MovieAdd.onomatopoeia(self, r_onomatopoeia_list)

            # 映画の保存
            data = {'username': request.data['username'],
                    'movie_title': request.data['movie_title'],
                    'movie_id': request.data['movie_id'],
                    'overview': request.data['overview']
                    }

            MovieAdd.movie(self, genre_obj_list, onomatopoeia_obj_list, data)

            # バックアップの保存
            backup_data = {'username': request.data['username'],
                           'movie_id': request.data['movie_id'],
                           'onomatopoeia_obj_list': onomatopoeia_obj_list,
                           'dvd': request.data['dvd'],
                           'fav': request.data['fav']
                           }

            Backup.movieadd_backup(self, backup_data)

            return JsonResponse(genre_obj_dict)


class OnomatopoeiaUpdateViewSet(viewsets.ViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = OnomatopoeiaUpdateSerializer

    def create(self, request):
        """
        When OnomatopoeiaUpdate api access, run this method.
        This method is update movie and back up table onomatopoeia column or add onomatopoeia.
        If success all process, response user name.
        :param request: Request user's data.(username, movie_id(tmdb_id) and onomatopoeia list)
        :return: User name.
        
        :type request object
        """

        if request.method == 'POST':
            r_onomatopoeia_list = request.data['onomatopoeia']

            if type(r_onomatopoeia_list) is str:
                r_onomatopoeia_list = MovieAdd.conversion_str_to_list(self, r_onomatopoeia_list, 'str')
            elif type(request.data['onomatopoeia']) is not list:
                raise ValidationError('不正な形式です')

            # Movieテーブルのオノマトペカラムに新規追加(削除はしない)
            onomatopoeia_obj_list = OnomatopoeiaUpdate.movie_update_onomatopoeia(self, request.data, r_onomatopoeia_list)

            # BackUpテーブルのオノマトペカラムに上書き(削除と追加)
            Backup.onomatopoeia_update_backup(self, request.data, onomatopoeia_obj_list)

            return Response(request.data['username'])


class DeleteBackupViewSet(viewsets.ViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = DeleteBackupSerializer

    def create(self, request):
        """
        When DeleteBackup api access, run this method.
        This method is delete backup data, remove movie table's user column.
        :param request: Request user's data.(username and movie_id(tmdb_id))
        :return: User name.
        
        :type request object
        """

        if request.method == 'POST':
            # バックアップの削除
            usr_obj = AuthUser.objects.get(username=request.data['username'])
            movie_obj = Movie.objects.get(tmdb_id=request.data['movie_id'])
            backup_obj = BackUp.objects.filter(username=usr_obj, movie=movie_obj)
            backup_obj.delete()

            # Movieテーブルの該当レコードのuserカラムからユーザとの関連を削除
            if movie_obj.user.all().filter(username=usr_obj).exists():
                movie_obj.user.remove(usr_obj)

            return Response(request.data['username'])


class StatusUpdateViewSet(viewsets.ViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = StatusUpdateSerializer

    def create(self, request):
        """
        When StatusUpdate api access, run this method.
        This method is update dvd and favorite status.
        :param request: Request user's data.(username, movie_id(tmdb_id), dvd and fav)
        :return: User name.
        
        :type request object
        """

        if request.method == 'POST':
            usr_obj = AuthUser.objects.get(username=request.data['username'])
            movie_obj = Movie.objects.get(tmdb_id=request.data['movie_id'])
            BackUp.objects.filter(username=usr_obj, movie=movie_obj).update(dvd=request.data['dvd'], fav=request.data['fav'])

            return Response(request.data['username'])


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
