import os
from django.db.models import Count
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_jwt.serializers import User
from FiNote_API.functions import *
from .serializer import *
from django.core.exceptions import ObjectDoesNotExist
import base64
from django.core.files.base import ContentFile
import datetime
from operator import attrgetter


class SignUpViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = SignUpSerializer

    def create(self, request):
        """
        When SignUp api access, run this method.
        This method checks sign in form data, create new user and response token.
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
    queryset = AuthUser.objects.all()
    serializer_class = SignInWithTokenSerializer

    def create(self, request):
        """
        When SignInWithToken api access, run this method.
        This method checks username and token. If success signup, response username.
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
    queryset = AuthUser.objects.all()
    serializer_class = SignInNoTokenSerializer

    def create(self, request):
        """
        When SignInNoToken api access, run this method.
        This method checks username and password. If success signup, response user's data.
        :param request: Username and password
        :return: User's movies and profile data.
        """

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
                        'movie__title', 'movie__tmdb_id', 'movie__overview', 'movie__poster_path',
                        'movie__genre__name', 'movie__genre__genre_id',
                        'onomatopoeia__name',
                        'dvd', 'fav',
                        'add_year', 'add_month', 'add_day',
                        'username__username', 'username__email', 'username__birthday', 'username__sex'
                    )

                    # ファイルを開いてbase64文字列を取得
                    if str(get_user.img) == '':
                        encoded_string = ''
                    else:
                        file_path = settings.MEDIA_ROOT + '/' + str(get_user.img)
                        with open(file_path, "rb") as image_file:
                            encoded_string = b'data:image/jpeg;base64,' + base64.b64encode(image_file.read())

                    response_list = list(backup_obj)
                    response_list.append({'token': str(token)})
                    response_list.append({'username': str(get_user.username)})
                    response_list.append({'email': str(get_user.email)})
                    response_list.append({'birthday': int(get_user.birthday)})
                    response_list.append({'sex': str(get_user.sex)})
                    response_list.append({'profile_img': str(encoded_string.decode('utf-8'))})

                    return JsonResponse({'results': response_list})

                else:
                    raise ValidationError('ユーザ名かパスワードが違います')

            except ObjectDoesNotExist:
                raise ValidationError('ユーザ名かパスワードが違います')


class ChangePasswordViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = ChangePasswordSerializer

    def create(self, request):
        """
        When ChangePassword api access, run this method.
        This method changes password and return token.
        :param request: Include token, now_password and new_password
        :return: User's token.
        """

        if request.method == 'POST':
            data = request.data

            if not data['token']:
                raise ValidationError('認証情報が含まれていません')
            if not data['now_password']:
                raise ValidationError('現在のパスワードが含まれていません')
            if not data['new_password']:
                raise ValidationError('新しいパスワードが含まれていません')

            try:
                user_id = Token.objects.get(key=data['token']).user_id
                get_user = AuthUser.objects.get(pk=user_id)

                if get_user.check_password(data['now_password'].encode('utf-8')):
                    get_user.set_password(data['new_password'])
                    get_user.save()
                    token = Token.objects.get(user_id=get_user.pk)

                    return JsonResponse({'token': str(token)})
                else:
                    raise ValidationError('現在のパスワードが異なるため変更に失敗しました')

            except ObjectDoesNotExist:
                raise ValidationError('ユーザが見つかりませんでした')


class ChangeEmailViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = ChangeEmailSerializer

    def create(self, request):
        """
        When ChangeEmail api access, run this method.
        This method changes email and return new_email.
        :param request: Include token and new_email
        :return: User's new email.
        """

        if request.method == 'POST':
            data = request.data

            if not data['token']:
                raise ValidationError('認証情報が含まれていません')
            if not data['new_email']:
                raise ValidationError('新しいメールアドレスが含まれていません')

            serializer = ChangeEmailSerializer(data=data)
            if serializer.is_valid():
                try:
                    user_id = Token.objects.get(key=data['token']).user_id
                    get_user = AuthUser.objects.get(pk=user_id)
                    get_user.email = data['new_email']
                    get_user.save()

                    return JsonResponse({'new_email': data['new_email']})
                except:
                    raise ValidationError('ユーザが見つかりませんでした')
            else:
                return Response(serializer.errors)


class ChangeSexViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = ChangeSexSerializer

    def create(self, request):
        """
        When ChangeSex api access, run this method.
        This method changes sex and return new_sex.
        :param request: Include token and new_sex
        :return: User's new sex.
        """

        if request.method == 'POST':
            data = request.data

            if not data['token']:
                raise ValidationError('認証情報が含まれていません')
            if not data['new_sex']:
                raise ValidationError('新しい性別が含まれていません')
            if not (data['new_sex'] == 'M' or data['new_sex'] == 'F'):
                raise ValidationError('性別の入力形式が正しくありません')

            serializer = ChangeSexSerializer(data=data)
            if serializer.is_valid():
                try:
                    user_id = Token.objects.get(key=data['token']).user_id
                    get_user = AuthUser.objects.get(pk=user_id)
                    get_user.sex = data['new_sex']
                    get_user.save()

                    return JsonResponse({'new_sex': data['new_sex']})
                except:
                    raise ValidationError('ユーザが見つかりませんでした')
            else:
                return Response(serializer.errors)


class SetProfileImgViewSet(viewsets.ViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = SetProfileImgSerializer

    def create(self, request):
        """
        When SetProfileImg api access, run this method.
        This method sets img and return token.
        :param request: Include token and img base64 string.
        :return: User's token.
        """

        if request.method == 'POST':
            data = request.data

            if not data['token']:
                raise ValidationError('認証情報が含まれていません')
            if not data['img']:
                raise ValidationError('画像情報が含まれていません')

            try:
                # tokenからユーザの割り出し
                user_id = Token.objects.get(key=data['token']).user_id
                get_user = AuthUser.objects.get(pk=user_id)

                # 古いプロフ画像の削除
                old_img_path = settings.MEDIA_ROOT + '/' + str(get_user.img)

                if os.path.isfile(old_img_path):
                    os.remove(old_img_path)

                # base64文字列からファイルインスタンスの生成
                format, img_str = data['img'].split(';base64,')
                ext = format.split('/')[-1]
                img_data = ContentFile(base64.b64decode(img_str), name=get_user.username + '.' + ext)

                # 画像の保存
                get_user.img = img_data
                get_user.save()

                return JsonResponse({'token': str(data['token'])})

            except ObjectDoesNotExist:
                raise ValidationError('ユーザが見つかりませんでした')


class MovieAddViewSet(viewsets.ViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieAddSerializer

    def create(self, request):
        """
        When MovieAdd api access, run this method.
        This method adds movie, onomatopoeia and genre. If success all process, response genre id and name.
        :param request: Request user's data.(username, movie_title, overview,
                                             movie_id(tmdb_id), genre_id_list,
                                             onomatopoeia, dvd and fav)
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
                    'overview': request.data['overview'],
                    'poster_path': request.data['poster_path']
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
        This method updates movie and back up table onomatopoeia column or add onomatopoeia.
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
            onomatopoeia_obj_list = OnomatopoeiaUpdate.\
            movie_update_onomatopoeia(self, request.data, r_onomatopoeia_list)

            # BackUpテーブルのオノマトペカラムに上書き(削除と追加)
            Backup.onomatopoeia_update_backup(self, request.data, onomatopoeia_obj_list)

            return Response(request.data['username'])


class DeleteBackupViewSet(viewsets.ViewSet):
    queryset = BackUp.objects.all()
    serializer_class = DeleteBackupSerializer

    def create(self, request):
        """
        When DeleteBackup api access, run this method.
        This method deletes backup data, remove movie table's user column.
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
    queryset = AuthUser.objects.all()
    serializer_class = StatusUpdateSerializer

    def create(self, request):
        """
        When StatusUpdate api access, run this method.
        This method updates dvd and favorite status.
        :param request: Request user's data.(username, movie_id(tmdb_id), dvd and fav)
        :return: User name.
        
        :type request object
        """

        if request.method == 'POST':
            usr_obj = AuthUser.objects.get(username=request.data['username'])
            movie_obj = Movie.objects.get(tmdb_id=request.data['movie_id'])
            BackUp.objects.filter(username=usr_obj, movie=movie_obj) \
                .update(dvd=request.data['dvd'], fav=request.data['fav'])

            return Response(request.data['username'])


class RecentlyMovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = RecentlyMovieSerializer
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        """
        When RecentlyMovie api access, run this method.
        This method gets recently updated and many users movies.
        :param request: This param is not used.
        :param args: This param is not used.
        :param kwargs: This param is not used.
        :return: Recently updated and many users movies.
        """

        today = datetime.date.today() + datetime.timedelta(days=1)
        one_week_ago = today - datetime.timedelta(days=7)

        queryset = Movie.objects.annotate(user_count=Count('user')) \
        .filter(updated_at__range=(one_week_ago, today), user_count__gt=1) \
        .order_by('-user_count', '-updated_at')[:200].values()

        serializer = RecentlyMovieSerializer(queryset, many=True)

        return Response(serializer.data)


class MovieUserCount(object):
    def __init__(self, movie):
        """
        Management class that movie and user counts by age.
        :param movie: Target a movie.
        """

        self.movie = movie
        self.count_10 = 0
        self.count_20 = 0
        self.count_30 = 0
        self.count_40 = 0
        self.count_50 = 0


class MovieByAgeViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieByAgeSerializer
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        """
        When MovieByAge api access, run this method.
        This method gets user counts and age movies.
        :param request: This param is not used.
        :param args: This param is not used.
        :param kwargs: This param is not used.
        :return: User counts desc movies by age.
        """

        movies = Movie.objects.annotate(user_count=Count('user')).filter(user_count__gt=1).order_by('-user_count')[:50]

        # 該当映画と年代別の登録数のクラスをリストに格納
        count_class_list = []
        for movie in movies:
            tmp_count_class = MovieUserCount(movie)

            for user in movie.user.all():
                self.update_movie_count_class(tmp_count_class, user.birthday)

            count_class_list.append(tmp_count_class)

        # ユーザの登録数が多い順にソート
        sorted_count_class_list_10 = sorted(count_class_list, key=attrgetter('count_10'), reverse=True)
        sorted_count_class_list_20 = sorted(count_class_list, key=attrgetter('count_20'), reverse=True)
        sorted_count_class_list_30 = sorted(count_class_list, key=attrgetter('count_30'), reverse=True)
        sorted_count_class_list_40 = sorted(count_class_list, key=attrgetter('count_40'), reverse=True)
        sorted_count_class_list_50 = sorted(count_class_list, key=attrgetter('count_50'), reverse=True)
        sorted_list_collection = [sorted_count_class_list_10,
                                  sorted_count_class_list_20,
                                  sorted_count_class_list_30,
                                  sorted_count_class_list_40,
                                  sorted_count_class_list_50]

        # dictionaryを作成
        res = []
        for i, sorted_count_class_list in enumerate(sorted_list_collection):
            dict_list_tmp = []
            for sorted_count_class in sorted_count_class_list:
                dict_tmp = {"title": sorted_count_class.movie.title,
                            "overview": sorted_count_class.movie.overview,
                            "poster_path": sorted_count_class.movie.poster_path,
                            "10": sorted_count_class.count_10,
                            "20": sorted_count_class.count_20,
                            "30": sorted_count_class.count_30,
                            "40": sorted_count_class.count_40,
                            "50": sorted_count_class.count_50}

                dict_list_tmp.append(dict_tmp)

            res.append({str((i + 1) * 10): dict_list_tmp})

        return Response(res)

    def update_movie_count_class(self, count_class, birth_year):
        """
        This method updates age count in count_class.
        :param count_class: Custom management class.
        :param birth_year: User's birth year.
        :return: Nothing.

        :type count_class class object
        :type birth_year int
        """

        this_year = datetime.date.today().year

        if birth_year > this_year - 10 or birth_year in range(this_year - 19, this_year - 9):
            count_class.count_10 += 1

        elif birth_year in range(this_year - 29, this_year - 19):
            count_class.count_20 += 1

        elif birth_year in range(this_year - 39, this_year - 29):
            count_class.count_30 += 1

        elif birth_year in range(this_year - 49, this_year - 39):
            count_class.count_40 += 1

        else:
            count_class.count_50 += 1


class MovieReactionViewSet(viewsets.ViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieReactionSerializer

    def create(self, request):
        """
        When MovieReaction api access, run this method.
        This method gets onomatopoeia and count.
        :param request: Target tmdb_id.
        :return: Onomatopoeia name and count.
        """

        serializer = MovieReactionSerializer(data=request.data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                movie = Movie.objects.get(tmdb_id=request.data['tmdb_id'])

                counts = OnomatopoeiaCount.objects.filter(movie=movie)

                res = []
                for count in counts:
                    res.append({"name": count.onomatopoeia.name,
                                "count": count.count})

                return Response(res)

            except ObjectDoesNotExist:
                raise ValidationError('該当する映画が見つかりませんでした')

        else:
            raise ValidationError('正しいパラメータ値ではありません')


class SearchMovieByOnomatopoeiaViewSet(viewsets.ViewSet):
    queryset = Movie.objects.all()
    serializer_class = SearchMovieByOnomatopoeiaSerializer

    def create(self, request):

        serializer = SearchMovieByOnomatopoeiaSerializer(data=request.data)

        if serializer.is_valid() and request.method == 'POST':
            # リクエスト文字を含むオノマトペを取得
            onomatopoeia_name = request.data['onomatopoeia_name']
            onomatopoeia_list = Onomatopoeia.objects.filter(name__contains=onomatopoeia_name)

            # 上記で取得したオノマトペを含む映画を取得
            movie_list = []
            for onomatopoeia in onomatopoeia_list:
                movies = Movie.objects.filter(onomatopoeia=onomatopoeia)
                movie_list += list(movies)

            # 映画の情報をdictとして生成
            res = []
            for movie in movie_list:
                res.append({"title": movie.title,
                            "overview": movie.overview,
                            "poster_path": movie.poster_path})

            return Response(res)
        else:
            raise ValidationError('必要なパラメータが含まれていません')


class UserViewSet(viewsets.ModelViewSet):
    queryset = AuthUser.objects.all()
    serializer_class = UserSerializer
    http_method_names = ['get']


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    http_method_names = ['get']


class OnomatopoeiaViewSet(viewsets.ModelViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = OnomatopoeiaSerializer
    http_method_names = ['get']


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    http_method_names = ['get']


class OnomatopoeiaCountViewSet(viewsets.ModelViewSet):
    queryset = OnomatopoeiaCount.objects.all()
    serializer_class = OnomatopoeiaCountSerializer
    http_method_names = ['get']
