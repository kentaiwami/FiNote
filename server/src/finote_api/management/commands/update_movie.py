from time import sleep
from finote_api.models import Movie
from django.core.management.base import BaseCommand
import re
import requests
from myapi.settings import TMDB_APIKEY


class Command(BaseCommand):
    help = 'If english overview in movie, update japanese overview and title.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Do not update movies',
        )
        parser.add_argument('start_pk', nargs='+', type=int)

    def handle(self, *args, **options):
        start_pk = 1
        if len(options['start_pk']) != 0:
            start_pk = options['start_pk'][0]

        if not options['test']:
            movies = Movie.objects.all()
            count = len(movies)

            for i, movie in enumerate(movies):
                sleep(1)

                if i+1 < start_pk:
                    continue

                print(str(i + 1) + '/' + str(count))

                overview_str = movie.overview
                search_result = re.search('[あ-んア-ン]', overview_str)

                if search_result:
                    pass
                else:
                    request_result = request_movie_info(movie)

                    if request_result is not None:
                        # 概要の更新
                        if request_result['overview'] is not None and request_result['overview'] != '':
                            self.output_console('overview updated')
                            Movie.objects.filter(pk=movie.pk).update(overview=request_result['overview'])

                        # ポスターの更新
                        if request_result['poster_path'] is not None and request_result['poster_path'] != movie.poster:
                            self.output_console('poster updated')
                            Movie.objects.filter(pk=movie.pk).update(poster=request_result['poster_path'])

                        # タイトルの更新
                        if request_result['original_language'] == 'ja':
                            if request_result['original_title'] != '':
                                title = request_result['original_title']
                            else:
                                title = request_result['title']
                        else:
                            if request_result['title'] != '':
                                title = request_result['title']
                            else:
                                title = request_result['original_title']

                        if title != movie.title:
                            Movie.objects.filter(pk=movie.pk).update(title=title)

                        self.output_console('movie_pk: ' + str(movie.pk))
                        self.output_console('***********************')
        else:
            movies = Movie.objects.all()
            count = len(movies)

            for i, movie in enumerate(movies):
                sleep(1)

                print(str(i + 1) + '/' + str(count))

                overview_str = movie.overview
                search_result = re.search('[あ-んア-ン]', overview_str)

                if search_result:
                    pass
                else:
                    request_result = request_movie_info(movie)

                    if request_result is not None and request_result['overview'] is not None and request_result['overview'] != '':
                        self.output_console('movie_pk: ' + str(movie.pk))
                        self.output_console('***********************')

    def output_console(self, output_str):
        """
        Output console.
        :param output_str: Output string.

        :type output_str: str
        """

        self.stdout.write(self.style.SUCCESS(output_str))


def request_movie_info(movie):
    """
    Request movie information.
    :param movie: A movie object in Model.
    :return: Request json or None

    :type movie: Movie
    """
    url = 'https://api.themoviedb.org/3/movie/' + str(movie.tmdb_id)
    query = {
        'api_key': TMDB_APIKEY,
        'language': 'ja-JP',
    }

    request = requests.get(url, params=query)

    if request.status_code == 200:
        return request.json()
    else:
        print(request.status_code)
        return None
