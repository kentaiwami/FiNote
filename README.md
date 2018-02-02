<img src="img/icon.png" align="right" />

FiNote(フィノート)
====

## 概要

観た映画(film)を気分(feeling)を添えて登録し、あとから気分で検索して確認することができます。

## 注意事項
* FiNoteを利用するには、ログインが必要です。他サービスで使用しているユーザ名やパスワードは使用しないでください。
* 検索結果は日本語を優先していますが、日本語データが存在しない場合は英語を表示しております。

## デモ
![demo](img/demo.gif)


## 使い方
1. ユーザ名、パスワード、メールアドレス、誕生年を登録します。
2. 観た映画を検索します。
3. 映画を観てどのような気分になったかをオノマトペ(モヤモヤ,ハラハラ等)と一緒に登録します。
4. 必要に応じてDVDなどを所持しているか、お気に入りとしてマークするかを登録します。
5. 映画の追加ボタンを押して映画を追加します。


## V1 API
### Sign Up
```
method：POST
endpoint：api/v1/user/signup/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "email": "hoge@hoge.com",
    "birthyear": 1900   (option)
}
response：
{
    "username": "hogehoge",
    "email": "hoge@hoge.com",
    "birthday": 1900,
    "id": 1
}
```

### Sign In
```
method：POST
endpoint：api/v1/user/signin/
request：
{
    "username": "hogehoge",
    "password": "hogehoge"
}
response：
{
    "username": "hogehoge",
    "email": "hoge@hoge.com",
    "birthday": 1900,
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

### Update Birth Year
```
method：POST
endpoint：api/v1/user/update/birthyear/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "birthyear": 1999
}
response：
{
    "user": "hogehoge"
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
    "dvd": true,
    "fav": false,
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

### Get Movies
```
method：GET
endpoint：api/v1/movies/?user_id=2
response：
"results": [
        {
            "add": "2018-01-12T00:02:37.612840",
            "id": 12345,
            "title": "hoge2",
            "poster": "http://",
            "onomatopoeia": ["hoge","fuga","piyo"]
        }
    ]
```

### Get Movie
```
method：GET
endpoint：api/v1/movie/detail/?user_id=2&movie_id=1234
response：
"results": [
        {
            "add": "2018-01-12T00:02:37.612840",
            "title": "hoge2",
            "poster": "http://...",
            "onomatopoeia": ["hoge","fuga","piyo"],
            "dvd": true,
            "fav": false,
            "overview": "movie overview hogehoge..."
        }
    ]
```

### Get Onomatopoeia Choice
```
method：GET
endpoint：api/v1/onomatopoeia/choice/
response：
{
    "results": ["hoge", "fuga", "piyo]
}
```

### Update Movie User Information(Onomatopoeia, DVD, FAV)
```
method：POST
endpoint：api/v1/movie/update/
request：
{
    "username": "hogehoge",
    "password": "hogehoge",
    "tmdb_id": 1234,
    "dvd": false,
    "fav": true,
    "onomatopoeia": ["hoge", "fuga", "piyo"]
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
    "password": "hogehoge"
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
            }
        ]
        "20": [
            {
                "count": 75,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            }
        ]
        "30": [
            {
                "count": 40,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            }
        ]
        "40": [
            {
                "count": 8,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            }
        ]
        "50": [
            {
                "count": 31,
                "overview": "overview",
                "poster": "https://hoge.com/top.png",
                "title": "title"
            }
        ]
    }
}
```

### Get Onomatopoeia Comparison
```
method：GET
endpoint：api/v1/movie/compare/?user_id=2&page=1
response：
"next": true,
"results": [
        {
            "title": "hoge2",
            "poster": "http://",
            "user": [
                {
                    "count": 15,
                    "name": "hoge"
                }
            ]
            "social": [
                {
                    "count": 30,
                    "name": "piyo"
                }
            ]
        }
    ]
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
        }
    ]
}
```


### Get Movie Origin Titles
```
method：GET
endpoint：api/v1/movie/search/titles?title=hoge&page=1
response：
{
    "total": 25,
    "results": [
        {
            "id": "1",
            "title": "hogehoge"
        }
    ]
}
```

### Get Movie Origin Title
```
method：GET
endpoint：api/v1/movie/search/origin?id=1
response：
{
    "title": "hogehoge origin title"
}
```


## 使用している外部サービス
![THE MOVIE DB](img/tmdb_logo.png)


![Yahoo Japan Movie](img/yahoo_movie_logo.png)


## 使用ライブラリ
[Eureka](https://github.com/xmartlabs/Eureka)  
[SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON)  
[Alamofire](https://github.com/Alamofire/Alamofire)  
[AlamofireImage](https://github.com/Alamofire/AlamofireImage)  
[KeychainAccess](https://github.com/kishikawakatsumi/KeychainAccess)  
[TinyConstraints](https://github.com/roberthein/TinyConstraints)  
[PopupDialog](https://github.com/Orderella/PopupDialog)  
[NVActivityIndicatorView](https://github.com/ninjaprox/NVActivityIndicatorView)  
[StatusProvider](https://github.com/mariohahn/StatusProvider)  
[Floaty](https://github.com/kciter/Floaty)  
[PromiseKit](https://github.com/mxcl/PromiseKit)  
[UPCarouselFlowLayout](https://github.com/ink-spot/UPCarouselFlowLayout)  
