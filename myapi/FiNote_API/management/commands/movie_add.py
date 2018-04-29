from django.core.exceptions import ObjectDoesNotExist
from django.core.management import BaseCommand
from django.db.models import Max, Min
from rest_framework_jwt.serializers import User
import random
from FiNote_API.utility import *


output_value = {'range_page': '',
                'select_page': '',
                'api': ''}


class Command(BaseCommand):
    help = 'Movie add random choice movies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Do not save movie',
        )

    def handle(self, *args, **options):
        if not options['test']:
            for i in range(0, 3):
                params = self.get_params()
                movie = params['movie']

                if movie == {}:
                    continue

                # 映画の保存
                data = {'user': params['user'],
                        'title': movie['title'],
                        'tmdb_id': movie['tmdb_id'],
                        'overview': movie['overview'],
                        'poster': movie['poster'],
                        'dvd': params['dvd'],
                        'fav': params['fav'],
                        'release_date': movie['release_date']
                        }
                add_movie(movie['genre_ids'], params['onomatopoeia'], data)

                self.stdout.write(self.style.SUCCESS('***** Movie Add Success *****'))
                self.output_console(params)
                self.stdout.write(self.style.SUCCESS('count: ' + str(i)))
                self.stdout.write(self.style.SUCCESS('***** Movie Add Success *****'))
        else:
            params = self.get_params()
            movie = params['movie']

            if movie != {}:
                self.stdout.write(self.style.SUCCESS('***** Test Success *****'))
                self.output_console(params)
                self.stdout.write(self.style.SUCCESS('***** Test Success *****'))

    def get_movie(self):
        """
        Request TMDB Database and get movie information.
        :return: Movies information(title, overview, tmdb_id, poster_path, genre_ids).
        """

        language_list = ['ja-JP', 'en-US']
        api_list = ['upcoming', 'top_rated', 'popular', 'now_playing']
        random_api_number = random.randint(0, len(api_list)-1)

        # 映画登録件数が全APIで取得できる映画数の95%を超えたらページ数の上限を増やす処理
        max_random = 1
        ratio = Movie.objects.count() / (len(api_list) * 20 * max_random) * 100
        while ratio > 95.0:
            max_random += 1
            ratio = Movie.objects.count() / (len(api_list) * 20 * max_random) * 100

        # ルーレットホイールセレクションで先頭ページを多めに設定
        rate_list = []
        for i in range(0, max_random+1):
            if i in range(0, 2):
                rate_list.append(100)
            elif i in range(2, 4):
                rate_list.append(50)
            else:
                rate_list.append(5)

        arrow = random.randint(0, int(sum(rate_list)))
        hit_number = 0
        x = rate_list[hit_number]
        while arrow > x:
            hit_number += 1
            x += rate_list[hit_number]

        # リクエストの際はページ数が1からなので+1をする
        hit_number += 1

        # 日本語と英語のリクエストを投げる
        select_movie_index = 0
        movie = {}
        for i, language in enumerate(language_list):
            url = 'https://api.themoviedb.org/3/movie/' + api_list[random_api_number]
            query = {
                'api_key': TMDB_APIKEY,
                'language': language,
                'page': hit_number
            }
            request = requests.get(url, params=query)
            request_json = request.json()

            if i == 0:
                try:
                    select_movie_index = random.randint(0, len(request_json['results']) - 1)
                except KeyError:
                    self.stdout.write(self.style.ERROR('KeyError'))
                    self.stdout.write(self.style.ERROR('api: ' + api_list[random_api_number]))
                    self.stdout.write(self.style.ERROR('page: ' + str(hit_number)))
                    self.stdout.write(self.style.ERROR('page_max: ' + str(max_random)))
                    self.stdout.write(self.style.ERROR('KeyError'))
                    return {}

            movie = request_json['results'][select_movie_index]

            if movie['overview'] != '':
                break

        # データの整形
        if movie['original_language'] == 'ja':
            if movie['original_title'] != '':
                title = movie['original_title']
            else:
                title = movie['title']
        else:
            if movie['title'] != '':
                title = movie['title']
            else:
                title = movie['original_title']

        if movie['poster_path'] is None:
            movie['poster_path'] = ''

        json_movie = {'title': title,
                      'overview': movie['overview'],
                      'tmdb_id': movie['id'],
                      'poster': movie['poster_path'],
                      'genre_ids': movie['genre_ids'],
                      'release_date': movie['release_date']}

        # 出力用に変数へ保存
        output_value['range_page'] = str(max_random+1)
        output_value['select_page'] = str(hit_number)
        output_value['api'] = api_list[random_api_number]

        return json_movie

    def get_params(self):
        """
        Get params(user, onomatopoeia, dvd_status, fav_status and a movie information).
        :return: Params.
        """

        user = choice_user()
        onomatopoeia = choice_onomatopoeia()
        dvd_status = random.randint(0, 1)
        fav_status = random.randint(0, 1)
        movie = self.get_movie()

        return {'user': user,
                'onomatopoeia': onomatopoeia,
                'dvd': dvd_status,
                'fav': fav_status,
                'movie': movie}

    def output_console(self, param):
        """
        Output user params to console.
        :param param: result params(user, onomatopoeia object list, dvd, fav and movie dictionary).

        :type param: dict
        """

        onomatopoeia_str = ''
        for onomatopoeia in param['onomatopoeia']:
            onomatopoeia_str += onomatopoeia.__str__() + ','
        onomatopoeia_str = onomatopoeia_str[:-1]

        self.stdout.write(self.style.SUCCESS('range_page: 1 to ' + output_value['range_page']))
        self.stdout.write(self.style.SUCCESS('select_page: ' + output_value['select_page']))
        self.stdout.write(self.style.SUCCESS('api: ' + output_value['api']))

        try:
            self.stdout.write(self.style.SUCCESS('username: ' + param['user'].username))
            self.stdout.write(self.style.SUCCESS('onomatopoeia: ' + onomatopoeia_str))
            self.stdout.write(self.style.SUCCESS('dvd: ' + str(param['dvd'])))
            self.stdout.write(self.style.SUCCESS('fav: ' + str(param['fav'])))
            self.stdout.write(self.style.SUCCESS('movie: ' + str(param['movie'])))
        except UnicodeEncodeError:
            self.stdout.write(self.style.SUCCESS('Process is success but output UnicodeEncodeError.'))


def choice_user():
    """
    Get random choice a user.
    :return: User object.
    """

    max_pk = User.objects.all().aggregate(Max('pk'))
    min_pk = User.objects.all().aggregate(Min('pk'))

    while True:
        user_pk = random.randint(min_pk['pk__min'], max_pk['pk__max'])
        try:
            user = User.objects.get(pk=user_pk)

            # 自動で登録されたユーザのみ選択
            if user.is_dummy and not user.is_superuser:
                break
            else:
                pass
        except ObjectDoesNotExist:
            pass

    return user


def choice_onomatopoeia():
    """
    Choice onomatopoeia random counts(one to three).
    :return: Onomatopoeia Object list.
    """

    max_pk = Onomatopoeia.objects.all().aggregate(Max('pk'))
    min_pk = Onomatopoeia.objects.all().aggregate(Min('pk'))
    choice_onomatopoeia_count = random.randint(1, 3)
    onomatopoeia_names = []

    while len(onomatopoeia_names) < choice_onomatopoeia_count:
        pk = random.randint(min_pk['pk__min'], max_pk['pk__max'])
        try:
            onomatopoeia_obj = Onomatopoeia.objects.get(pk=pk)
            onomatopoeia_names.append(onomatopoeia_obj.name)
        except ObjectDoesNotExist:
            pass

    return onomatopoeia_names
