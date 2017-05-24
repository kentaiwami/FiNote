from django.core.management import BaseCommand
from django.db.models import Max, Min

from FiNote_API.models import Onomatopoeia, Movie


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
            self.get_movie_params()
        else:
            self.get_movie_params()

        # Top rated movies, Upcoming movies, Now playing movies, Popular movies, random choiceかを、
        # ルーレットホイールセレクションを使って選択する(最新の映画は割合を多めに)
        # TMDBのAPIから映画を取得
        # ランダムで映画を選択
        # ランダムでDVDとFAVを選択

        # オノマトペを選択

        # オノマトペを何個付けるかを1〜3の間でランダムに選択
        # 選択済みのオノマトペが上記の数になるまでループ
        # min_id〜max_idまでをランダムに選択
        # 取得したオノマトペが選択済みに含まれていなければ追加、
        # 含まれている or DoesNotExistが発生したらやり直し

        # Userのmax_idとmin_idを取得
        # min_id〜max_idの間で乱数を発生させる
        # 取得した乱数でgetを行い、DoesNotExistならやり直し
        # 無事に取得できたらループを抜ける

        # 映画を登録する
        max_id = Onomatopoeia.objects.all().aggregate(Max('pk'))
        min_id = Onomatopoeia.objects.all().aggregate(Min('pk'))

    def get_movie_params(self):
        pass
