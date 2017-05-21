from django.core.management.base import BaseCommand
from ...models import Onomatopoeia
import lxml.html
from selenium import webdriver
import jaconv

driver = webdriver.PhantomJS()


class Command(BaseCommand):
    help = 'Scraping onomatopoeia dictionary web page'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Save results that scraping onomatopoeia',
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

                print(kana_names)

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
        driver.get(target_url)
        root = lxml.html.fromstring(driver.page_source)
        links = root.cssselect('#post_list_type1 h3 a')

        for name in links:
            names.append(name.text)

        return names
