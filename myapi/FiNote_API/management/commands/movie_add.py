from django.core.management import BaseCommand


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
        pass
