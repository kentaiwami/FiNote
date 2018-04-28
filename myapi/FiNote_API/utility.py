from collections import OrderedDict
from django.db.models import F
from FiNote_API.models import *
from myapi.settings import TMDB_APIKEY
import requests
import datetime
import time


class MovieUserCount(object):
    def __init__(self):
        self.cnt = {}

    @staticmethod
    def merge_dict4(d1, d2):
        return {
            '10': d1['10'] + d2['10'],
            '20': d1['20'] + d2['20'],
            '30': d1['30'] + d2['30'],
            '40': d1['40'] + d2['40'],
            '50': d1['50'] + d2['50'],
        }

    def count(self, user, movie):
        init_dict = {
            '10': 0,
            '20': 0,
            '30': 0,
            '40': 0,
            '50': 0,
        }

        this_year = datetime.date.today().year

        if user.birthyear > this_year - 10 or user.birthyear in range(this_year - 19, this_year - 9):
            init_dict['10'] = 1

        elif user.birthyear in range(this_year - 29, this_year - 19):
            init_dict['20'] = 1

        elif user.birthyear in range(this_year - 39, this_year - 29):
            init_dict['30'] = 1

        elif user.birthyear in range(this_year - 49, this_year - 39):
            init_dict['40'] = 1

        else:
            init_dict['50'] = 1

        if movie in self.cnt:
            value = self.cnt[movie]
            self.cnt[movie] = self.merge_dict4(init_dict, value)
        else:
            self.cnt[movie] = init_dict

    def sort(self, key):
        return OrderedDict(sorted(self.cnt.items(), key=lambda x: x[1][key], reverse=True)[:15])


def get_or_create_genre(genre_id):
    # TMDBへのリクエストを生成
    url = 'https://api.themoviedb.org/3/genre/movie/list'
    query = {
        'api_key': TMDB_APIKEY,
        'language': 'ja'
    }

    # TMDBから取得したレスポンスを扱いやすいように変形
    r = requests.get(url, params=query)
    r_json = r.json()
    values = r_json.values()
    list_values = list(values)[0]

    # TMDBから取得したジャンルオブジェクトリストを、idとnameに分けたリストを作成
    genre_value_id = []
    genre_value_name = []
    for genre_value in list_values:
        genre_value_id.append(genre_value['id'])
        genre_value_name.append(genre_value['name'])

    # リクエストされたジャンルidをDB検索して追加・取得 or 取得
    genre_obj_list = []
    for id in genre_id:
        try:
            index = genre_value_id.index(id)
            obj, created = Genre.objects.get_or_create(
                genre_id=id,
                defaults={'genre_id': id, 'name': genre_value_name[index]},
            )

            genre_obj_list.append(obj)
        except ValueError:
            pass

    return genre_obj_list


def get_url_param(test, api, title='', page='', id=''):
    if api == 'origin':
        if test:
            url = settings.SearchOriginTitleURLTest
        else:
            url = settings.SearchOriginTitleURLProduction + id
        param = {}
    else:
        if test:
            url = settings.SearchTitleURLTest
            param = {}
        else:
            url = settings.SearchTitleURLProduction
            param = {'query': title, 'page': page}

    return url, param


def add_movie(genre_ids, onomatopoeia_list, data):
    # ジャンルの登録とオブジェクトの取得
    genre_obj_list = get_or_create_genre(genre_ids)

    # オノマトペの登録とオブジェクトの取得
    onomatopoeia_obj_list = []
    for onomatopoeia in onomatopoeia_list:
        obj, created = Onomatopoeia.objects.get_or_create(
            name=onomatopoeia,
            defaults={'name': onomatopoeia}
        )

        onomatopoeia_obj_list.append(obj)

    # 映画オブジェクトの新規追加 or 取得
    movie_obj, created_movie = Movie.objects.get_or_create(
        tmdb_id=data['tmdb_id'],
        defaults={'title': data['title'],
                  'tmdb_id': data['tmdb_id'],
                  'overview': data['overview'],
                  'poster': data['poster'],
                  'release_date': data['release_date']}
    )

    # 追加した映画にジャンルがなければ新規追加
    for genre_obj in genre_obj_list:
        if not movie_obj.genre.all().filter(name=genre_obj.name).exists():
            movie_obj.genre.add(genre_obj)

    # 追加した映画にオノマトペがあればカウント更新
    # なければ新規追加
    for onomatopoeia_obj in onomatopoeia_obj_list:
        if movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
            Movie_Onomatopoeia.objects.filter(
                movie=movie_obj, onomatopoeia=onomatopoeia_obj
            ).update(count=F('count') + 1)
        else:
            Movie_Onomatopoeia(movie=movie_obj, onomatopoeia=onomatopoeia_obj).save()

    movie_obj.save()

    # 追加した映画にユーザを新規追加
    movie_user, created_movie_user = Movie_User.objects.get_or_create(
        movie=movie_obj, user=data['user'],
        defaults={'movie': movie_obj, 'user': data['user'], 'dvd': data['dvd'], 'fav': data['fav']}
    )

    # movie user onomatopoeiaの保存
    if created_movie_user:
        for onomatopoeia_obj in onomatopoeia_obj_list:
            Movie_User_Onomatopoeia(movie_user=movie_user, onomatopoeia=onomatopoeia_obj).save()


def get_ave_year():
    year = datetime.date.today().year
    end = year - 10
    start = end - 10 + 1
    results = {'10s': start, '10e': end}

    for i in range(20, 60, 10):
        end = start - 1
        start = end - 10 + 1
        results[str(i)+'s'] = start
        results[str(i)+'e'] = end

    return results


class ExecutionSpeedAnalyze(object):
    def __init__(self):
        self.start = time.time()
        self.end = time.time()

    def stop(self):
        self.end = time.time() - self.start
        return "elapsed_time:{0}".format(self.end) + "[sec]"
