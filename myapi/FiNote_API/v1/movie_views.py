from FiNote_API.utility import *
from rest_framework import viewsets
from FiNote_API.v1.movie_serializer import *
from rest_framework.response import Response
from collections import Counter
import datetime
from FiNote_API.thread import *
import ssl
import re
from bs4 import BeautifulSoup
import urllib.request
import urllib.parse


class GetMoviesViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        ユーザが追加した映画に関する情報を返す

        :param request: URLクエリにuser_idを含む
        :returns        title, tmdb_id, add datetime, poster,
                        dvd, fav, onomatopoeia names
        """

        if not 'user_id' in request.GET:
            raise serializers.ValidationError('user_idが含まれていません')

        user_id = request.GET.get('user_id')

        try:
            user = AuthUser.objects.get(pk=user_id)
        except:
            raise serializers.ValidationError('該当データが見つかりませんでした')

        movie_user_list = Movie_User.objects.filter(user=user).order_by('-created_at')

        results = []

        for movie_user_obj in movie_user_list:
            movie_user_onomatopoeia_list = Movie_User_Onomatopoeia.objects.filter(movie_user=movie_user_obj)
            onomatopoeia_name_list = [movie_user_onomatopoeia.onomatopoeia.name for movie_user_onomatopoeia in movie_user_onomatopoeia_list]

            results.append({
                'title': movie_user_obj.movie.title,
                'id': movie_user_obj.movie.tmdb_id,
                'add': movie_user_obj.created_at,
                'poster': movie_user_obj.movie.poster,
                'dvd': movie_user_obj.dvd,
                'fav': movie_user_obj.fav,
                'onomatopoeia': onomatopoeia_name_list
            })

        return Response({'results': results})


class UpdateDVDFAVViewSet(viewsets.ViewSet):
    serializer_class = UpdateDVDFAVSerializer

    @staticmethod
    def create(request):
        """
        ユーザのdvdとfavの状態を更新する

        :param request: username, password, tmdb_id, dvd, fav
        :return:        更新後のdvd, fav
        """

        data = request.data
        serializer = UpdateDVDFAVSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
            movie = Movie.objects.get(tmdb_id=data['tmdb_id'])
            movie_user = Movie_User.objects.get(movie=movie, user=user)
        except:
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        movie_user.dvd = data['dvd']
        movie_user.fav = data['fav']
        movie_user.save()

        return Response({'dvd': data['dvd'], 'fav': data['fav']})


class AddMovieViewSet(viewsets.ViewSet):
    serializer_class = AddMovieSerializer

    @staticmethod
    def create(request):
        """
        映画を追加する

        :param request: username, password, title, overview, tmdb_id,
                        poster, genre, onomatopoeia, dvd, fav
        :return:        メッセージ
        """

        data = request.data
        serializer = AddMovieSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
        except:
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        data['user'] = user
        add_movie(data['genre'], data['onomatopoeia'], data)

        return Response({'msg': 'success'})


class UpdateOnomatopoeiaViewSet(viewsets.ViewSet):
    serializer_class = UpdateOnomatopoeiaSerializer

    @staticmethod
    def create(request):
        """
        映画に付与しているオノマトペを更新する

        :param request: username, password, tmdb_id, onomatopoeia
        :return:        メッセージ
        """

        data = request.data
        serializer = UpdateOnomatopoeiaSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
        except:
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        movie_obj = Movie.objects.get(tmdb_id=data['tmdb_id'])

        # movie user onomatopoeiaの該当するレコードを削除
        movie_user = Movie_User.objects.get(user=user, movie=movie_obj)
        Movie_User_Onomatopoeia.objects.filter(movie_user=movie_user).delete()

        for onomatopoeia_name in data['onomatopoeia']:
            # オノマトペがなければ新規作成
            onomatopoeia_obj, created = Onomatopoeia.objects.get_or_create(
                name=onomatopoeia_name,
                defaults={'name': onomatopoeia_name}
            )

            if not movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
                Movie_Onomatopoeia(movie=movie_obj, onomatopoeia=onomatopoeia_obj).save()

            # オノマトペカウントオブジェクトの新規追加 or 取得
            onomatopoeia_count_obj, created_oc = Movie_Onomatopoeia.objects.get_or_create(
                onomatopoeia=onomatopoeia_obj,
                movie=movie_obj,
                defaults={'count': 1, 'onomatopoeia': onomatopoeia_obj, 'movie': movie_obj}
            )

            # オノマトペカウントオブジェクトの更新
            if not created_oc:
                onomatopoeia_count_obj.count += 1
                onomatopoeia_count_obj.save()

            # movie user onomatopoeiaの保存
            Movie_User_Onomatopoeia(movie_user=movie_user, onomatopoeia=onomatopoeia_obj).save()

        return Response({'msg': 'success'})


class DeleteMovieViewSet(viewsets.ViewSet):
    serializer_class = DeleteMovieSerializer

    @staticmethod
    def create(request):
        """
        追加した映画を削除する

        :param request: username, password, tmdb_id
        :return:        メッセージ
        """

        data = request.data
        serializer = DeleteMovieSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            return serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
        except:
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        movie_obj = Movie.objects.get(tmdb_id=data['tmdb_id'])
        Movie_User.objects.get(movie=movie_obj, user=user).delete()

        return Response({'msg': 'success'})


class GetRecentlyMovieViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        """
        1週間以内で多く追加された映画上位50を返す

        :param request: None
        :param args:    None
        :param kwargs:  None
        :return:        title, overview, poster
        """

        today = datetime.date.today() + datetime.timedelta(days=1)
        one_week_ago = today - datetime.timedelta(days=7)

        queryset = Movie_User_Onomatopoeia.objects.filter(created_at__range=(one_week_ago, today))

        # movie_userごとに集計
        movie_user_onomatopoeia_cnt = Counter()
        for movie_user_onomatopoeia in queryset:
            movie_user_onomatopoeia_cnt[movie_user_onomatopoeia.movie_user] += 1

        # 映画ごとに集計
        movie_cnt = Counter()
        for movie_user in movie_user_onomatopoeia_cnt:
            movie_cnt[movie_user.movie] += 1

        results = []
        for movie in movie_cnt.most_common(50):
            results.append({
                'title': movie[0].title,
                'overview': movie[0].overview,
                'poster': movie[0].poster
            })

        return Response({'results': results})


class GetMovieByAgeViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        """
        10〜50代別で1週間以内に追加数が多い映画上位15を返す

        :param request: None
        :param args:    None
        :param kwargs:  None
        :return:        count, overview, poster, title
        """

        today = datetime.date.today() + datetime.timedelta(days=1)
        one_week_ago = today - datetime.timedelta(days=7)

        queryset = Movie_User_Onomatopoeia.objects.filter(created_at__range=(one_week_ago, today))

        # movie_userごとに集計
        movie_user_onomatopoeia_cnt = Counter()
        for movie_user_onomatopoeia in queryset:
            movie_user_onomatopoeia_cnt[movie_user_onomatopoeia.movie_user] += 1

        # 映画ごとに、追加したユーザの年代別でカウント
        movie_user_count = MovieUserCount()
        for movie_user_obj in movie_user_onomatopoeia_cnt:
            movie_user_count.count(movie_user_obj.user, movie_user_obj.movie)

        res_dict = {
            '10': [],
            '20': [],
            '30': [],
            '40': [],
            '50': [],
        }

        # 10〜50代の登録数でソート
        for res_key in res_dict:
            sorted_dict = movie_user_count.sort(res_key)

            for movie, count_dict in zip(sorted_dict.keys(), sorted_dict.values()):
                # 対象の年代(res_key)で登録している数が0件の場合はスキップ
                if count_dict[res_key] == 0:
                    continue

                res_dict[res_key].append({
                    "count": count_dict[res_key],
                    "overview": movie.overview,
                    "poster": movie.poster,
                    "title": movie.title
                })

        return Response({'results': res_dict})


class GetMovieOnomatopoeiaViewSet(viewsets.ViewSet):
    serializer_class = GetMovieOnomatopoeiaSerializer

    @staticmethod
    def create(request):
        """
        指定した映画に付与されたオノマトペを取得する

        :param request: tmdb_ids
        :return:        key: tmdb_id, value: 映画に付与されたオノマトペ
        """

        data = request.data
        serializer = GetMovieOnomatopoeiaSerializer(data=data)

        if not(serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        res = []

        thread_list = []
        for tmdb_id in data['tmdb_ids']:
            thread = GetMovieOnomatopoeiaThread(tmdb_id)
            thread_list.append(thread)
            thread.start()

        # 全てのスレッドが完了するまで待機(ブロック)
        for thread in thread_list:
            thread.join()

        for thread in thread_list:
            thread_result = thread.getResult()
            if thread_result:
                res.append(thread_result)

        return Response({'results': res})


class GetMovieOnomatopoeiaContainViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        指定したオノマトペを含む映画を返す

        :param request: URLクエリにonomatopoeia含む
        :return:        title, overview, poster
        """

        if not 'onomatopoeia' in request.GET:
            raise serializers.ValidationError('onomatopoeiaが含まれていません')

        # リクエスト文字を含むオノマトペを取得
        onomatopoeia = request.GET.get('onomatopoeia')
        onomatopoeia_list = Onomatopoeia.objects.filter(name__contains=onomatopoeia)

        # 上記で取得したオノマトペを含む映画を取得
        movie_list = []
        for onomatopoeia in onomatopoeia_list:
            movies = Movie.objects.filter(onomatopoeia=onomatopoeia)
            movie_list += list(movies)

        # 映画の情報をdictとして生成
        res = []
        for movie in movie_list:
            res.append({
                "title": movie.title,
                "overview": movie.overview,
                "poster": movie.poster
            })

        return Response({'results': res})


class GetSearchMovieTitleViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        指定したタイトルで外部APIを検索した結果を返す

        :param request: URLクエリに、title, pageを含む
        :return:        total:      検索結果の件数
                        results:    title, id
        """

        if not 'title' in request.GET:
            raise serializers.ValidationError('titleが含まれていません')

        if not 'page' in request.GET:
            raise serializers.ValidationError('pageが含まれていません')

        res = []

        context = ssl._create_unverified_context()
        url, param = get_url_param(test=settings.IsTestSearchTitle, api='search', title=request.GET.get('title'), page=request.GET.get('page'))
        html = urllib.request.urlopen(url + '?' + urllib.parse.urlencode(param), context=context)
        soup = BeautifulSoup(html, "html.parser")

        # 検索結果の合計件数を抽出
        srchform_div = soup.find(id='srchform')
        srchform_div_label = srchform_div.find(class_='label')

        # 検索結果が0の場合はこの時点で結果を返す
        if srchform_div_label is None:
            return Response({'total': 0, 'results': []})

        small_list = srchform_div_label.find_all('small')
        del small_list[0]

        match = re.findall(r'[0-9]+', small_list[0].string)
        total_resutls_count = int(match[0])

        # 映画のタイトルとIDを抽出
        lst = soup.find(id='lst')
        li_tag_list = lst.find_all('li', class_='col')

        title_id_list = []
        for li_tag in li_tag_list:
            title = li_tag.find('h3', class_='text-xsmall text-overflow').attrs['title']
            id = li_tag.attrs['data-cinema-id']
            title_id_list.append({'title': title, 'id': id})

        res.append({'total': total_resutls_count})
        res.append({'results': title_id_list})

        return Response({'total': total_resutls_count, 'results': title_id_list})


class GetOriginalTitleViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        指定したidの原題を返す

        :param request: URLクエリにid含む
        :return:        origin title
        """

        if not 'id' in request.GET:
            raise serializers.ValidationError('idが含まれていません')

        original_title = ''

        context = ssl._create_unverified_context()
        url, param = get_url_param(settings.IsTestSearchOriginTitle, 'origin', request.data)
        html = urllib.request.urlopen(url + '?' + urllib.parse.urlencode(param), context=context)
        soup = BeautifulSoup(html, "html.parser")

        mvinf = soup.find(id='mvinf')
        tr_tag_list = mvinf.find_all('tr')

        # 製作国が日本以外なら保存した原題を返す
        for tr_tag in tr_tag_list:
            th_tag = tr_tag.find('th')

            if th_tag.string == '原題':
                original_title = tr_tag.find('td').string
                continue

            if th_tag.string == '製作国':
                if tr_tag.find('li').string != '日本':
                    return Response({'title': original_title})
                break

        return Response({'title': ''})


class GetOnomatopoeiaCountViewSet(viewsets.ViewSet):
    serializer_class = GetOnomatopoeiaCountSerializer

    @staticmethod
    def create(request):
        """
        指定したtmdb_idに指定したオノマトペが何回登録されたかを返す

        :param request: tmdb_id, onomatopoeia_names
        :return:        count, onomatopoeia name
        """

        data = request.data
        serializer = GetOnomatopoeiaCountSerializer(data=data)

        if not(serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        movie = Movie.objects.get(tmdb_id=request.data['tmdb_id'])
        onomatopoeia_names = data['onomatopoeia_names']

        results = []
        for onomatopoeia_name in onomatopoeia_names:
            try:
                onomatopoeia = Onomatopoeia.objects.get(name=onomatopoeia_name)
                count = Movie_Onomatopoeia.objects.get(movie=movie, onomatopoeia=onomatopoeia).count

                results.append({"name": onomatopoeia_name, "count": count})
            except ObjectDoesNotExist:
                pass

        return Response({'results': results})
