from collections import OrderedDict
from FiNote_API.models import *
from myapi.settings import TMDB_APIKEY
import requests
import datetime


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

        if user.birthday > this_year - 10 or user.birthday in range(this_year - 19, this_year - 9):
            init_dict['10'] = 1

        elif user.birthday in range(this_year - 29, this_year - 19):
            init_dict['20'] = 1

        elif user.birthday in range(this_year - 39, this_year - 29):
            init_dict['30'] = 1

        elif user.birthday in range(this_year - 49, this_year - 39):
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


def get_url_param(test, api, title, page):
    if api == 'origin':
        url = ''
        param = {}
        # if test:
        #     url = 'http://kentaiwami.jp/GetOriginalTitle_en.html/'
        #     param = {}
        # else:
        #     url = 'https://movies.yahoo.co.jp/movie/' + request_data['id']
        #     param = {}
    else:
        if test:
            url = settings.SearchTitleURLTest
            param = {}
        else:
            url = settings.SearchTitleURLProduction
            param = {'query': title, 'page': page}

    return url, param
