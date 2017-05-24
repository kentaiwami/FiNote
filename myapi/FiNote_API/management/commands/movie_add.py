from django.core.management import BaseCommand
from FiNote_API.models import Onomatopoeia, Movie


class Command(BaseCommand):
    help = 'Movie add random choice movies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Save results that scraping onomatopoeia',
        )

    def handle(self, *args, **options):
        print('result: ' + str(Onomatopoeia.objects.count()))
