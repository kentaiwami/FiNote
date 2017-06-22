import lxml.html
from rest_framework.response import Response
from FiNote_API.models import *
from myapi.settings import TMDB_APIKEY
import requests


def conversion_str_to_list(str_list, type):
    """
    convert str to list
    :param str_list: String list ex.) ["1", "2"] or [1,2]
    :param type: Type of str_list ex.) int or str
    :return: Converted list

    :type str_list: str
    :type type: str
    """

    # 余計な文字を削除してリストの生成
    str_list = str_list.replace('[', '')
    str_list = str_list.replace(']', '')
    str_list = str_list.replace('"', '')
    str_list = str_list.replace(' ', '')
    str_list = str_list.replace('　', '')
    converted_list = str_list.split(',')

    if len(str_list) == 0:
        return []

    # int型のリストに変換する場合はsplitで対応できないため補う
    if type == 'int':
        converted_list = [int(i) for i in converted_list]

    return converted_list


def get_or_create_genre(r_genre_id_list):
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

    return genre_obj_dict, genre_obj_list


def get_or_create_onomatopoeia(r_onomatopoeia_list):
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


def add_movie(genre_obj_list, onomatopoeia_obj_list, data):
    """
    Create or get(update) movie and onomatopoeia count objects
    :param genre_obj_list: Create or get genre objects list
    :param onomatopoeia_obj_list: Create or get onomatopoeia objects list
    :param data: Client request data.(username, movie_title, movie_id(tmdb_id), overview)

    :type genre_obj_list: list
    :type onomatopoeia_obj_list: list
    :type data: object
    """

    # 映画オブジェクトの新規追加 or 取得
    movie_obj, created_movie = Movie.objects.get_or_create(
        tmdb_id=data['movie_id'],
        defaults={'title': data['movie_title'],
                  'tmdb_id': data['movie_id'],
                  'overview': data['overview'],
                  'poster_path': data['poster_path']}
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


def movieadd_backup(backup_data):
    """
    Run movie add api back up user data
    :param backup_data: Back up dictionary data.(username, movie_id(tmdb_id), onomatopoeia_obj_list, dvd and fav)

    :type backup_data object
    """

    user_obj = AuthUser.objects.get(username=backup_data['username'])
    movie_obj = Movie.objects.get(tmdb_id=backup_data['movie_id'])

    # BackUpの作成と取得
    backup_obj, created_backup = BackUp.objects.get_or_create(
        username=user_obj, movie=movie_obj,
        defaults={'username': user_obj, 'movie': movie_obj, 'dvd': backup_data['dvd'], 'fav': backup_data['fav']}
    )

    # バックアップ時に作成したレコードに、オノマトペが存在していなかったら追加(2重登録を防ぐ)
    for onomatopoeia_obj in backup_data['onomatopoeia_obj_list']:
        if backup_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
            pass
        else:
            backup_obj.onomatopoeia.add(onomatopoeia_obj)

    backup_obj.save()


def movie_update_onomatopoeia(request_data, onomatopoeia_list):
    """
    This method is update Movie table onomatopoeia column.
    :param request_data: Request user's data.(username, movie_id(tmdb_id) and onomatopoeia list)
    :param onomatopoeia_list: Request onomatopoeia list.
    :return: Onomatopoeia object list.

    :type request_data object
    :type onomatopoeia_list list
    """

    movie_obj = Movie.objects.get(tmdb_id=request_data['movie_id'])

    onomatopoeia_obj_list = []
    for onomatopoeia_name in onomatopoeia_list:
        onomatopoeia_obj, created = Onomatopoeia.objects.get_or_create(
            name=onomatopoeia_name,
            defaults={'name': onomatopoeia_name}
        )
        onomatopoeia_obj_list.append(onomatopoeia_obj)

        if movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
            pass
        else:
            movie_obj.onomatopoeia.add(onomatopoeia_obj)

    return onomatopoeia_obj_list


def onomatopoeia_update_backup(request_data, onomatopoeia_obj_list):
    """
    When onomatopoeia update, run this method.
    This method is clear the back up record after add request onomatopoeia.
    :param request_data: Request user's data.(username, movie_id(tmdb_id) and onomatopoeia list)
    :param onomatopoeia_obj_list: Request user's onomatopoeia list object data.

    :type request_data object
    :type onomatopoeia_obj_list list
    """

    user_obj = AuthUser.objects.get(username=request_data['username'])
    movie_obj = Movie.objects.get(tmdb_id=request_data['movie_id'])

    backup_obj = BackUp.objects.get(username=user_obj, movie=movie_obj)

    backup_obj.onomatopoeia.clear()

    for onomatopoeia_obj in onomatopoeia_obj_list:
        backup_obj.onomatopoeia.add(onomatopoeia_obj)


def get_movie_link(search_url):
    """
    This method gets movie url link list and html dom.
    :param search_url: A url that include search text and pagination number.
    :return: Movie url link list and html dom.

    :type search_url: str
    """
    target_html = requests.get(search_url).text
    dom = lxml.html.fromstring(target_html)

    # 検索結果が存在するかのチェック
    try:
        rslt_movie_dom = dom.get_element_by_id('rslt-movie')
    except KeyError:
        return Response('')

    a_tags = rslt_movie_dom.findall('.//a')
    url_list = []

    for a_tag in a_tags:
        href = a_tag.attrib['href']
        url_list.append(href)

    url_list = list(set(url_list))

    return url_list, dom


def get_original_movie_title(detail_movie_url):
    """
    This method gets original movie title.
    :param detail_movie_url: Movie url link that include movie number.
    :return: If not found 原題, return empty str. Else original movie title.

    :type detail_movie_url str
    """
    target_html = requests.get(detail_movie_url).text
    dom = lxml.html.fromstring(target_html)
    dataBoxes = dom.cssselect('.dataBox')

    for dataBox in dataBoxes:
        index = -1
        th_list = dataBox.findall('.//th')
        td_list = dataBox.findall('.//td')

        for i, th in enumerate(th_list):
            if th.text == '原題':
                index = i
                break

        if index == -1:
            return ''
        else:
            return td_list[index].text
