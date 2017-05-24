from django.core.exceptions import ObjectDoesNotExist
from django.core.management import BaseCommand
from django.db.models import Max, Min
from rest_framework_jwt.serializers import User
from FiNote_API.models import Onomatopoeia, Movie
import random

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
            user = self.choice_onomatopoeia()
        else:
            pass

        # Top rated movies, Upcoming movies, Now playing movies, Popular movies, random choiceかを、
        # ルーレットホイールセレクションを使って選択する(最新の映画は割合を多めに)
        # TMDBのAPIから映画を取得
        # ランダムで映画を選択
        # ランダムでDVDとFAVを選択

        # 映画を登録する



    def choice_onomatopoeia(self):
        """
        Choice onomatopoeia random counts(one to three).
        :return: Onomatopoeia Object list.
        """

        max_pk = Onomatopoeia.objects.all().aggregate(Max('pk'))
        min_pk = Onomatopoeia.objects.all().aggregate(Min('pk'))
        choice_onomatopoeia_count = random.randint(1, 3)
        onomatopoeia_obj_list = []

        while len(onomatopoeia_obj_list) < choice_onomatopoeia_count:
            pk = random.randint(min_pk['pk__min'], max_pk['pk__max'])
            try:
                onomatopoeia_obj = Onomatopoeia.objects.get(pk=pk)
                onomatopoeia_obj_list.append(onomatopoeia_obj)
            except ObjectDoesNotExist:
                pass

        return onomatopoeia_obj_list

    def choice_user(self):
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
                break
            except ObjectDoesNotExist:
                pass

        return user