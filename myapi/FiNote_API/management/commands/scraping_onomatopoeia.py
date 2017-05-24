from django.core.management.base import BaseCommand
from ...models import Onomatopoeia
import lxml.html
import jaconv
import requests


class Command(BaseCommand):
    help = 'Scraping onomatopoeia dictionary web page'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Do not Save results that scraping onomatopoeia',
        )

    def handle(self, *args, **options):
        for i in range(1, 120):
            print(str(i) + ' is start')

            if not options['test']:
                names = self.scraping(i)
                for name in names:
                    kana_name = jaconv.hira2kata(name)
                    obj, created = Onomatopoeia.objects.get_or_create(
                        name=kana_name,
                        defaults={'name': kana_name}
                    )
            else:
                names = self.scraping(i)
                kana_names = []
                for name in names:
                    kana_name = jaconv.hira2kata(name)
                    kana_names.append(kana_name)

                print(', '.join(kana_names).encode('utf-8'))

            print(str(i) + ' is end')

            count = Onomatopoeia.objects.count()
            self.stdout.write(self.style.SUCCESS('Onomatopoeia count = "%s"' % count))

    def scraping(self, number):
        """
        Scraping a web page and return onomatopoeia name list.
        :param number: page number.
        :return: Onomatopoeia name list.
        
        :type number: int
        """

        names = []

        target_url = 'http://sura-sura.com/page/' + str(number)
        target_html = requests.get(target_url).text
        dom = lxml.html.fromstring(target_html)
        links = dom.cssselect('#post_list_type1 h3 a')

        for link in links:
            names.append(link.text)

        return names
