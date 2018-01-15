<img src="icon.png" align="right" />

FiNote(フィノート)
====

## 概要

観た映画(film)を気分(feeling)を添えて登録し、あとから気分で検索して確認することができます。

## 注意事項
* FiNoteを利用するには、ログインが必要です。他サービスで使用しているユーザ名やパスワードは使用しないでください。
* 検索結果は日本語を優先していますが、日本語データが存在しない場合は英語を表示しております。

## デモ
![demo](https://github.com/kentaiwami/FiNote/blob/master/demo.gif)

## サポート情報
* iOS 10.3.1
* iPhone 6,6s

## 使い方
1. ユーザ名、パスワード、性別、生年月日を登録します。
2. 観た映画を検索します。
3. 映画を観てどのような気分になったかをオノマトペ(モヤモヤ,ハラハラ等)と一緒に登録します。
4. 必要に応じてDVD(またはBlu-ray)を所持しているか、お気に入りとしてマークするかを登録します。
5. 映画の追加ボタンを押して映画を追加します。


## V1 API
### Create User
```
method：POST
endpoint：api/v1/user/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "email": "hoge@hoge.com",
    "birthday": 1900
}
response：
{
    "id": 1
}
```

### Update Password
```
method：POST
endpoint：api/v1/user/update/password/
request：
{
    "username": "hogehoge",
    "now_password": "hogehoge",
    "new_password": "fugafuga"
}
response：
{
    "user": "hogehoge"
}
```

### Update Email
```
method：POST
endpoint：api/v1/user/update/email/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "new_email": "hoge@hoge.com"
}
response：
{
    "user": "hogehoge"
}
```

### Update Profile Image
```
method：POST
endpoint：api/v1/user/update/img/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "img": Image File
}
response：
{
    "user": "hogehoge"
}
```

### Get Movies
```
method：GET
endpoint：api/v1/movies/?user_id=2
response：
"results": [
        {
            "add": "2018-01-12T00:02:37.612840",
            "id": "12345",
            "fav": 1,
            "title": "hoge2",
            "dvd": 1,
            "poster": "http"
        },
        {
            "add": "2018-01-12T00:01:54.697333",
            "id": "1234",
            "fav": 0,
            "title": "hoge",
            "dvd": 1,
            "poster": "http://"
        }
        .
        .
        .
    ]
```

### Update DVD and FAV
```
method：POST
endpoint：api/v1/movie/update/dvdfav/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "tmdb_id": 1234,
    "dvd": 0,
    "fav": 1
}
response：
{
    "dvd": 0,
    "fav": 1
}
```

### Add Movie
```
method：POST
endpoint：api/v1/movie/
request：
{
	"tmdb_id": 12,
	"username": "hogehoge",
	"password": "hogehoge",
	"dvd": 1,
	"fav": 0,
	"onomatopoeia": ["hoge","fuga", "piyo"],
	"title": "movie title",
	"genre": [28,12,16],
	"overview": "movie overview",
	"poster": "http://hogehoge.com/hoge.jpg"
}
response：
{
    "msg": "success"
}
```

### Update Onomatopoeia
```
method：POST
endpoint：api/v1/movie/
request：
{
	"tmdb_id": 12,
	"username": "hogehoge",
	"password": "hogehoge",
	"onomatopoeia": ["HOGE","FUGA"]
}
response：
{
    "msg": "success"
}
```

### Delete Movie
```
method：POST
endpoint：api/v1/movie/delete/
request：
{
	"tmdb_id": 12,
	"username": "hogehoge",
	"password": "hogehoge",
}
response：
{
    "msg": "success"
}
```

### Get Recently Movie
```
method：GET
endpoint：api/v1/movie/recently/
response：
{
    "results": [
        {
            "title": "title_hoge",
            "poster": "http://hogehoge.com/hoge.jpg",
            "overview": "overview_hoge"
        },
        {
            "title": "title_fuga",
            "poster": "http://fugafuga.com/fuga.jpg",
            "overview": "overview_fuga"
        }
    ]
}
```

### Get Movie by Age
```
method：GET
endpoint：api/v1/movie/byage/
response：
{
    "results": {
        "10": [
            {
                "count": 64,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            },
            .
            .
            .
        ],
        "20": [
            {
                "count": 75,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            },
            .
            .
            .
        ],
        "30": [
            {
                "count": 40,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            },
            .
            .
            .
        ],
        "40": [
            {
                "count": 8,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            },
            .
            .
            .
        ],
        "50": [
            {
                "count": 31,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            },
            .
            .
            .
        ]
    }
}
```

### Get Movie Onomatopoeia
```
method：GET
endpoint：api/v1/movie/onomatopoeia/
response：
{
    "results": [
        {
            "1234": [
                {
                    "name": "hoge"
                },
                {
                    "name": "fuga"
                },
                {
                    "name": "piyo"
                },
                .
                .
                .
            ]
        },
        .
        .
        .
}
```

### Get Contain Onomatopoeia Movie
```
method：GET
endpoint：api/v1/movie/onomatopoeia/contain?onomatopoeia=hoge
response：
{
    "results": [
        {
            "title": "title_hoge",
            "poster": "http://hogehoge.com/hoge.jpg",
            "overview": "overview_hoge"
        },
        {
            "title": "title_fuga",
            "poster": "http://fugafuga.com/fuga.jpg",
            "overview": "overview_fuga"
        },
        .
        .
        .
    ]
}
```



## 使用しているプラグイン
* [cordova-plugin-console 1.0.6](https://www.npmjs.com/package/cordova-plugin-console)
* [cordova-plugin-device 1.1.5](https://www.npmjs.com/package/cordova-plugin-device)
* [cordova-plugin-listpicker 2.2.2](https://www.npmjs.com/package/cordova-plugin-listpicker)
* [cordova-plugin-splashscreen 4.0.2](https://www.npmjs.com/package/cordova-plugin-splashscreen)
* [cordova-plugin-statusbar 2.2.2](https://www.npmjs.com/package/cordova-plugin-statusbar)
* [cordova-plugin-whitelist 1.3.2](https://www.npmjs.com/package/cordova-plugin-whitelist)
* [cordova-plugin-x-socialsharing 5.1.7](https://www.npmjs.com/package/cordova-plugin-x-socialsharing)
* [cordova-sqlite-legacy-build-support 1.3.5-pre1](https://github.com/litehelpers/Cordova-sqlite-legacy-build-support)
* [cordova-plugin-camera 2.4.1](https://github.com/apache/cordova-plugin-camera)
* [cordova-plugin-compat 1.1.0](https://www.npmjs.com/package/cordova-plugin-compat)

## 使用しているプラットフォーム
* android 6.2.2
* ios 4.4.0

## 使用している外部サービス
* さくらのレンタルサーバ
* Twitter
* [The Movie Database](https://www.themoviedb.org)
* [オノマトペ辞典](http://sura-sura.com)

## 参考サイト
* [Onsen UI](https://onsen.io)
* [CHARTIST.JS](http://gionkunz.github.io/chartist-js/index.html)
* [slick](http://kenwheeler.github.io/slick/)
