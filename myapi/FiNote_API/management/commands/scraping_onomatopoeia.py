from django.core.management.base import BaseCommand
from ...models import Onomatopoeia

class Command(BaseCommand):
    help = 'Scraping onomatopoeia dictionary web page'

    def add_arguments(self, parser):
        parser.add_argument(
            '--save',
            action='store_true',
            dest='save',
            default=False,
            help='Save results that scraping onomatopoeia',
        )

    def handle(self, *args, **options):
        if options['save']:
            count = Onomatopoeia.objects.count()
            self.stdout.write(self.style.SUCCESS('User count = "%s"' % count))

        else:
            print('not saved')
