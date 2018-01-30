from django.db.models import Case, When, Value, CharField
from FiNote_API.utility import *
from rest_framework import viewsets
from FiNote_API.v1.movie_serializer import *
from rest_framework.response import Response
import datetime
import ssl
import re
from bs4 import BeautifulSoup
import urllib.request
import urllib.parse
from django.db.models.aggregates import Count


class GetMoviesViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        ユーザが追加した映画に関する情報を返す

        :param request: URLクエリにuser_idを含む
        :returns        title, tmdb_id, add datetime, poster,
                        onomatopoeia names
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
                'onomatopoeia': onomatopoeia_name_list
            })

        return Response({'results': results})


class GetMovieViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        ユーザが追加した映画に関する詳細情報を返す

        :param request: URLクエリにuser_idを含む
        :returns        title, tmdb_id, add datetime, poster, overview
                        onomatopoeia names, dvd, fav
        """

        if not 'user_id' in request.GET:
            raise serializers.ValidationError('user_idが含まれていません')

        if not 'movie_id' in request.GET:
            raise serializers.ValidationError('movie_idが含まれていません')

        user_id = request.GET.get('user_id')
        movie_id = request.GET.get('movie_id')

        try:
            user = AuthUser.objects.get(pk=user_id)
            movie = Movie.objects.get(tmdb_id=movie_id)
            movie_user_obj = Movie_User.objects.get(user=user, movie=movie)
        except:
            raise serializers.ValidationError('該当データが見つかりませんでした')

        movie_user_onomatopoeia_list = Movie_User_Onomatopoeia.objects.filter(movie_user=movie_user_obj)
        onomatopoeia_name_list = [movie_user_onomatopoeia.onomatopoeia.name for movie_user_onomatopoeia in
                                  movie_user_onomatopoeia_list]

        results = {
            'title': movie_user_obj.movie.title,
            'overview': movie_user_obj.movie.overview,
            'poster': movie_user_obj.movie.poster,
            'add': movie_user_obj.created_at,
            'onomatopoeia': onomatopoeia_name_list,
            'dvd': movie_user_obj.dvd,
            'fav': movie_user_obj.fav
        }

        return Response(results)


class GetOnomatopoeiaChoiceViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        オノマトペの選択肢を返す

        :param request: None
        :returns        Onomatopoeia names
        """

        hogehoge = [onomatopoeia.name for onomatopoeia in Onomatopoeia.objects.all()]

        results = {'results': hogehoge}

        return Response(results)


class UpdateMovieUserInformationViewSet(viewsets.ViewSet):
    serializer_class = UpdateMovieUserInformationSerializer

    @staticmethod
    def create(request):
        """
        ユーザのdvd, fav, onomatopoeiaの状態を更新する

        :param request: username, password, tmdb_id, dvd, fav, onomatopoeia
        :return:        Message
        """

        data = request.data
        serializer = UpdateMovieUserInformationSerializer(data=data)

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

        # dvd, favの状態を保存
        movie_user.dvd = data['dvd']
        movie_user.fav = data['fav']
        movie_user.save()

        # movie user onomatopoeiaの該当するレコードを削除
        movie_user = Movie_User.objects.get(user=user, movie=movie)
        Movie_User_Onomatopoeia.objects.filter(movie_user=movie_user).delete()

        for onomatopoeia_name in data['onomatopoeia']:
            # オノマトペがなければ新規作成
            onomatopoeia_obj, created = Onomatopoeia.objects.get_or_create(
                name=onomatopoeia_name,
                defaults={'name': onomatopoeia_name}
            )

            # Movie Onomatopoeiaがなければ作成
            if not movie.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
                Movie_Onomatopoeia(movie=movie, onomatopoeia=onomatopoeia_obj).save()

            # オノマトペカウントオブジェクトの新規追加 or 取得
            onomatopoeia_count_obj, created_oc = Movie_Onomatopoeia.objects.get_or_create(
                onomatopoeia=onomatopoeia_obj,
                movie=movie,
                defaults={'count': 1, 'onomatopoeia': onomatopoeia_obj, 'movie': movie}
            )

            # オノマトペカウントオブジェクトの更新
            if not created_oc:
                onomatopoeia_count_obj.count += 1
                onomatopoeia_count_obj.save()

            # movie user onomatopoeiaの保存
            Movie_User_Onomatopoeia(movie_user=movie_user, onomatopoeia=onomatopoeia_obj).save()

        return Response({'msg': 'success'})


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

        queryset = Movie_User.objects\
            .filter(created_at__range=(one_week_ago, today))\
            .values('movie')\
            .annotate(cnt=Count('id')).order_by('-cnt')[:50]

        results = []
        for query_dict in queryset:
            movie_tmp = Movie.objects.get(pk=query_dict['movie'])
            results.append({
                'title': movie_tmp.title,
                'overview': movie_tmp.overview,
                'poster': movie_tmp.poster
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

        ave_year = get_ave_year()

        queryset = Movie_User.objects.filter(created_at__range=(one_week_ago, today)).annotate(
            age=Case(
                When(user__birthyear__range=(ave_year['10s'], ave_year['10e']), then=Value('10')),
                When(user__birthyear__range=(ave_year['20s'], ave_year['20e']), then=Value('20')),
                When(user__birthyear__range=(ave_year['30s'], ave_year['30e']), then=Value('30')),
                When(user__birthyear__range=(ave_year['40s'], ave_year['40e']), then=Value('40')),
                When(user__birthyear__range=(ave_year['50s'], ave_year['50e']), then=Value('50')),
                default=Value('Other'),
                output_field=CharField()
            )
        ).values('movie', 'age').annotate(cnt=Count('age'))

        results = {}
        for i in range(10, 60, 10):
            movies = []
            age = queryset.filter(age=str(i)).order_by('-cnt')[:15]

            for count_obj in age:
                tmp_movie = Movie.objects.get(pk=count_obj['movie'])
                movies.append({
                    'count': count_obj['cnt'],
                    'overview': tmp_movie.overview,
                    'poster': tmp_movie.poster,
                    'title': tmp_movie.title
                })

            results[str(i)] = movies

        return Response({'results': results})


class GetOnomatopoeiaComparisonViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        ユーザが追加した映画に対するオノマトペの比較結果を返す

        :param request: URLクエリにuser_idを含む
        :returns        title, poster,
                        user onomatopoeia names,
                        other user's onomatopoeia names and counts
        """

        if not 'user_id' in request.GET:
            raise serializers.ValidationError('user_idが含まれていません')

        if not 'page' in request.GET:
            raise serializers.ValidationError('pageが含まれていません')

        user_id = request.GET.get('user_id')

        try:
            user = AuthUser.objects.get(pk=user_id)
        except:
            raise serializers.ValidationError('該当データが見つかりませんでした')

        page = int(request.GET.get('page'))
        end = page * 5
        start = end - 5

        # ユーザが追加した映画を取得
        movie_users = Movie_User.objects.filter(user=user).order_by('-created_at')[start:end]

        res = []
        for movie_user in movie_users:
            # ユーザのMovie User Onomatopoeiaを取得
            movie_user_onomatopoeia_list = Movie_User_Onomatopoeia.objects.filter(movie_user=movie_user)

            # ユーザ追加した映画のMovie Onomatopoeiaをcount降順で取得
            movie_onomatopoeia_list = Movie_Onomatopoeia.objects.filter(movie=movie_user.movie).order_by('-count')

            # ユーザが追加したOnomatopoeiaを取得
            user_onomatopoeia_obj_list = [movie_user_onomatopoeia.onomatopoeia for movie_user_onomatopoeia in
                                          movie_user_onomatopoeia_list]

            # ユーザが追加したオノマトペを抽出
            user_social = []
            for movie_onomatopoeia in movie_onomatopoeia_list.filter(onomatopoeia__in=user_onomatopoeia_obj_list):
                user_social.append({
                    'name': movie_onomatopoeia.onomatopoeia.name,
                    'count': movie_onomatopoeia.count - 1
                })

            # 他ユーザが追加したオノマトペを抽出
            social = []
            for movie_onomatopoeia in movie_onomatopoeia_list.exclude(onomatopoeia__in=user_onomatopoeia_obj_list)[:8]:
                social.append({
                    'name': movie_onomatopoeia.onomatopoeia.name,
                    'count': movie_onomatopoeia.count
                })

            res.append({
                'title': movie_user.movie.title,
                'poster': movie_user.movie.poster,
                'user': user_social,
                'social': social
            })

        return Response({'results': res})


class GetMovieOnomatopoeiaContainViewSet(viewsets.ViewSet):
    @staticmethod
    def list(request):
        """
        指定したオノマトペが多く付与されている映画を返す

        :param request: URLクエリにonomatopoeia含む
        :return:        title, overview, poster
        """

        if not 'onomatopoeia' in request.GET:
            raise serializers.ValidationError('onomatopoeiaが含まれていません')

        # リクエスト文字を含むオノマトペを取得
        onomatopoeia = request.GET.get('onomatopoeia')
        onomatopoeia_list = Onomatopoeia.objects.filter(name__contains=onomatopoeia)

        # 該当オノマトペが追加されているMovie_Onomatopoeia(映画、カウント、オノマトペ)オブジェクトを取得
        qs = Movie_Onomatopoeia.objects.none()
        for onomatopoeia in onomatopoeia_list:
            movie_onomatopoeia_list = Movie_Onomatopoeia.objects.filter(onomatopoeia=onomatopoeia)
            qs = qs | movie_onomatopoeia_list

        qs_ordered = qs.order_by('-count')
        tmp_tmdb_ids = []
        res = []
        for movie_onomatopoeia_obj in qs_ordered:
            if len([tmdb_id for tmdb_id in tmp_tmdb_ids if tmdb_id == movie_onomatopoeia_obj.movie.tmdb_id]) == 0:
                tmp_tmdb_ids.append(movie_onomatopoeia_obj.movie.tmdb_id)
                res.append({
                    "title": movie_onomatopoeia_obj.movie.title,
                    "overview": movie_onomatopoeia_obj.movie.overview,
                    "poster": movie_onomatopoeia_obj.movie.poster
                })

            if len(tmp_tmdb_ids) >= 50:
                break

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
            title_id_list.append({'title': title, 'id': int(id)})

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
