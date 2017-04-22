from FiNote_API.models import *
from myapi.settings import TMDB_APIKEY
import requests
import json

class MovieAdd():
    def conversion_str_to_list(self, str_list, type):
        str_list = str_list.replace('[', '')
        str_list = str_list.replace(']', '')
        str_list = str_list.replace('"', '')
        list = str_list.split(',')

        if type == 'int':
            list = [int(i) for i in list]

        return list

    def genre(self, r_genre_id_list):
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
        for r_genre_id in r_genre_id_list:
            try:
                index = genre_value_id.index(r_genre_id)
                obj, created = Genre.objects.get_or_create(
                    genre_id=r_genre_id,
                    defaults={'genre_id': r_genre_id, 'name': genre_value_name[index]},
                )

                genre_obj_list.append(obj)
            except ValueError:
                pass


        # dictの作成
        genre_obj_dict = {}
        for genre_obj in genre_obj_list:
            genre_obj_dict[genre_obj.genre_id] = genre_obj.name

        return (genre_obj_dict,genre_obj_list)

    def onomatopoeia(self, r_onomatopoeia_list):
        onomatopoeia_obj_list = []

        for onomatopoeia in r_onomatopoeia_list:
            obj, created = Onomatopoeia.objects.get_or_create(
                name=onomatopoeia,
                defaults={'name': onomatopoeia}
            )

            onomatopoeia_obj_list.append(obj)

        return onomatopoeia_obj_list