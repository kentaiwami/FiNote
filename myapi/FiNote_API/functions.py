from FiNote_API.models import *
from myapi.settings import TMDB_APIKEY
import requests


class MovieAdd():

    def conversion_str_to_list(self, str_list, type):
        """
        convert str to list
        :param str_list: String list ex.) ["1", "2"] or [1,2]
        :param type: Type of str_list ex.) int or str
        :return: List
        
        :type str_list: str
        :type type: str
        """
        str_list = str_list.replace('[', '')
        str_list = str_list.replace(']', '')
        str_list = str_list.replace('"', '')
        converted_list = str_list.split(',')

        if len(str_list) == 0:
            return []

        if type == 'int':
            converted_list = [int(i) for i in converted_list]

        return converted_list

    def genre(self, r_genre_id_list):
        """
        Create genre and return genre objects
        :param r_genre_id_list: Client request genre id list
        :return: Genre objects dictionary and list
        
        :type r_genre_id_list: list
        """

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

        return (genre_obj_dict, genre_obj_list)

    def onomatopoeia(self, r_onomatopoeia_list):
        """
        Create onomatopoeia and return onomatopoeia objects
        :param r_onomatopoeia_list: Client request onomatopoeia name list
        :return: Onomatopoeia objects list
        
        :type r_onomatopoeia_list: list
        """

        onomatopoeia_obj_list = []

        for onomatopoeia in r_onomatopoeia_list:
            obj, created = Onomatopoeia.objects.get_or_create(
                name=onomatopoeia,
                defaults={'name': onomatopoeia}
            )

            onomatopoeia_obj_list.append(obj)

        return onomatopoeia_obj_list

    def movie(self, genre_obj_list, onomatopoeia_obj_list, data):
        """
        Create or get(update) movie and onomatopoeia count objects
        :param genre_obj_list: Create or get genre objects list
        :param onomatopoeia_obj_list: Create or get onomatopoeia objects list
        :param data: Client request data
        
        :type genre_obj_list: list
        :type onomatopoeia_obj_list: list
        :type data: json
        """

        # 映画オブジェクトの新規追加 or 取得
        movie_obj, created_movie = Movie.objects.get_or_create(
            title=data['movie_title'],
            defaults={'title': data['movie_title'], 'tmdb_id': data['movie_id']}
        )

        # 該当映画オブジェクトにジャンルを新規追加
        for genre_obj in genre_obj_list:
            if movie_obj.genre.all().filter(name=genre_obj.name).exists():
                pass
            else:
                movie_obj.genre.add(genre_obj)

        # 該当映画オブジェクトにオノマトペを新規追加
        for onomatopoeia_obj in onomatopoeia_obj_list:
            if movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
                pass
            else:
                movie_obj.onomatopoeia.add(onomatopoeia_obj)

        # 該当映画オブジェクトにユーザを新規追加
        if movie_obj.user.all().filter(username=data['username']).exists():
            pass
        else:
            user_obj = AuthUser.objects.get(username=data['username'])
            movie_obj.user.add(user_obj)

        movie_obj.save()

        # オノマトペカウントオブジェクトの新規追加 or 取得
        for onomatopoeia_obj in onomatopoeia_obj_list:
            onomatopoeia_count_obj, created_oc = OnomatopoeiaCount.objects.get_or_create(
                onomatopoeia=onomatopoeia_obj,
                movie=movie_obj,
                defaults={'count': 1, 'onomatopoeia': onomatopoeia_obj, 'movie': movie_obj}
            )

            # オノマトペカウントオブジェクトの更新
            if created_oc:
                pass
            else:
                onomatopoeia_count_obj.count += 1
                onomatopoeia_count_obj.save()
