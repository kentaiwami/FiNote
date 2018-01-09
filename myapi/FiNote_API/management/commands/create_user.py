import urllib.request
import os.path
from django.core.files.base import ContentFile
from rest_framework_jwt.serializers import User
from django.core.management.base import BaseCommand
from myapi.settings import CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET
import random
from requests_oauthlib import OAuth1Session
import json
import datetime


class Command(BaseCommand):
    help = 'Create user from twitter information'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            dest='test',
            default=False,
            help='Do not Save new users',
        )

    def handle(self, *args, **options):
        if not options['test']:
            for i in range(0, 3):
                user_param = generate_user_params()

                # ユーザの作成
                user_obj, created = User.objects.get_or_create(
                    username=user_param['username'],
                    defaults={'username': user_param['username'],
                              'email': user_param['email'],
                              'password': user_param['password'],
                              'birthday': user_param['birth_year'],
                              'sex': user_param['sex'],
                              'is_dummy': user_param['is_dummy']
                              },
                )

                if created:
                    user_obj.set_password(user_param['password'])
                    user_obj.img = get_image_file(user_param['img_url'], user_param['username'])

                    try:
                        user_obj.save()
                    except UnicodeEncodeError:
                        user_obj.delete()
                        continue

                self.stdout.write(self.style.SUCCESS('***** Create User Success *****'))
                self.output_console(user_param)
                self.stdout.write(self.style.SUCCESS('Count is ' + str(i)))
                self.stdout.write(self.style.SUCCESS('***** Create User Success *****'))

        else:
            user_param = generate_user_params()

            self.stdout.write(self.style.SUCCESS('***** Test Success *****'))
            self.output_console(user_param)
            self.stdout.write(self.style.SUCCESS('***** Test Success *****'))

    def output_console(self, user_param):
        """
        Output user params to console.
        :param user_param: user params.
        
        :type user_param: dict
        """

        self.stdout.write(self.style.SUCCESS('username: ' + user_param['username']))
        self.stdout.write(self.style.SUCCESS('email: ' + user_param['email']))
        self.stdout.write(self.style.SUCCESS('sex: ' + user_param['sex']))
        self.stdout.write(self.style.SUCCESS('password: ' + user_param['password']))
        self.stdout.write(self.style.SUCCESS('birth_year: ' + str(user_param['birth_year'])))
        self.stdout.write(self.style.SUCCESS('img_url: ' + user_param['img_url']))


def get_oath_keys():
    oath_key_dict = {
        "CK": CONSUMER_KEY,
        "CS": CONSUMER_SECRET,
        "AT": ACCESS_TOKEN,
        "ATS": ACCESS_TOKEN_SECRET
    }

    return oath_key_dict


def create_oath_session():
    """
    Create oath session.
    :return: Oath session.
    """

    oath = OAuth1Session(
        CONSUMER_KEY,
        CONSUMER_SECRET,
        ACCESS_TOKEN,
        ACCESS_TOKEN_SECRET
    )
    return oath


def twitter_request(params, url):
    """
    Do Twitter request.
    :param params: Request parameters.
    :param url: Api end point.
    :return: Response data.

    :type params: dict
    :type url: str
    """

    oath = create_oath_session()
    responce = oath.get(url, params=params)
    if responce.status_code != 200:
        print("Error code: %d" % responce.status_code)
        return None
    tweets = json.loads(responce.text)
    return tweets


def get_image_file(url, username):
    """
    Get twitter user's image file.
    :param url: Twitter user's profile image url.
    :param username: Twitter user name.
    :return: Image file.

    :type url: str
    :type username: str
    """
    img = urllib.request.urlopen(url)
    root, ext = os.path.splitext(url)
    html_response = img.read()
    img_data = ContentFile(html_response, name=username + ext)
    return img_data


def get_birth_year():
    """
    Get random birth year.
    :return: Random birth year.
    """

    d = datetime.datetime.today()

    # 今年から100年前までのリストを作成
    birth_year_list = []
    for i in range(d.year, d.year - 101, -1):
        birth_year_list.append(i)

    # 確率配分のリストを作成
    rate_list = []
    age_rate_dict = {
        "0": 0.0,
        "10": 94.0,
        "20": 84.5,
        "30": 81.5,
        "40": 74.5,
        "50": 15.5,
        "60": 11.5
    }
    for i in range(0, len(birth_year_list)):
        if i in range(0, 10):
            rate_list.append(age_rate_dict['0'])
        elif i in range(10, 20):
            rate_list.append(age_rate_dict['10'])
        elif i in range(20, 30):
            rate_list.append(age_rate_dict['20'])
        elif i in range(30, 40):
            rate_list.append(age_rate_dict['30'])
        elif i in range(40, 50):
            rate_list.append(age_rate_dict['40'])
        elif i in range(50, 60):
            rate_list.append(age_rate_dict['50'])
        elif i in range(60, 70):
            rate_list.append(age_rate_dict['60'])
        else:
            rate_list.append(age_rate_dict['0'])

    # ルーレットホイールセレクションの実行
    arrow = random.randint(0, int(sum(rate_list)))
    hit_number = 0
    x = rate_list[hit_number]
    while arrow > x:
        hit_number += 1
        x += rate_list[hit_number]

    return birth_year_list[hit_number]


def generate_password():
    """
    Generate random password.
    :return: Random password.
    """

    alphabet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    pw_length = 8
    mypw = ""

    for i in range(pw_length):
        next_index = random.randrange(len(alphabet))
        mypw = mypw + alphabet[next_index]

    return mypw


def generate_user_params():
    # トレンドを取得してタグ付きのトレンド名をリストにする
    url = 'https://api.twitter.com/1.1/trends/place.json'
    params = {
        "id": 23424856
    }
    res_trends = twitter_request(params, url)
    trends_list = res_trends[0]['trends']
    trends_name_list = []
    for trend in trends_list:
        trends_name_list.append(trend['name'])

    # トレンド名で検索してユーザ名を得る
    url = 'https://api.twitter.com/1.1/search/tweets.json?'
    random_index = random.randint(0, len(trends_name_list) - 1)
    search_word = trends_name_list[random_index]
    count = 15
    params = {
        "q": search_word,
        "lang": "ja",
        "result_type": "recent",
        "count": str(count)
    }
    res_tweet = twitter_request(params, url)
    tweet_list = res_tweet['statuses']
    random_tweet_index = random.randint(0, count - 1)
    user = tweet_list[random_tweet_index]['user']

    choice_name_list = ['screen_name', 'name']
    random_choice_index = random.randint(0, 1)
    choice_name = choice_name_list[random_choice_index]

    # ユーザ作成に必要なパラメータを生成・整理
    choice_sex_list = ['M', 'F']
    username = user[choice_name]
    email = username + '@' + username + '.jp'
    sex = choice_sex_list[random_choice_index]
    password = generate_password()
    birth_year = get_birth_year()

    return {"username": username,
            "email": email,
            "sex": sex,
            "password": password,
            "birth_year": birth_year,
            "img_url": user['profile_image_url'],
            "is_dummy": True}
