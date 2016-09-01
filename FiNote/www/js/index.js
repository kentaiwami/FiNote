
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        setTimeout(function() {
            navigator.splashscreen.hide();}, 500);
    },

    onDeviceReady: function() {
        //データベースのテーブルを構築する
        var db = utility.get_database();

          db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key, title text unique, tmdb_id integer unique, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail_path text, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS genre (id integer primary key, name text unique, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS keyword (id integer primary key, name text unique, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS onomatopoeia (id integer primary Key, name text, joy_status integer, anger_status integer, sadness_status integer, happiness_status integer)');
          }, function(err) {
            console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
          });
    },
};


/**
 * indexで使用する関数をまとめたオブジェクト
 * @type {Object}
 */
var index = {
    /**
     * サインアップしているかを確認する
     */
    check_signup: function(){
        var storage = window.localStorage;
        var signup_flag = storage.getItem('signup_flag');

        //ユーザ情報が登録されている場合は自動ログインを行う
        if (signup_flag == 'true') {
            movie.draw_movie_content();
        //ユーザ情報が登録されていない場合はsignupへ遷移
        }else {
            utility.pushpage('signup.html','fade',1000);
        }
    },
};


/**
 * サインアップ画面で使用する関数をまとめたオブジェクト
 * @type {Object}
 */
var Signup = {
    usersignup: function() {
        //mobile backendアプリとの連携
        var ncmb = utility.get_ncmb();
        var user = new ncmb.User();

        //ユーザー名・パスワードを設定
        user.set('userName', document.getElementById('username').value)
            .set('password', document.getElementById('password').value);

        // 新規登録
        user.signUpByAccount()
            .then(function(){
                /*登録後処理*/
                //ローカルにユーザ名とパスワードを保存する。
                var username = document.getElementById('username').value;
                var password = document.getElementById('password').value;
                var storage = window.localStorage;
                storage.setItem('username', username);
                storage.setItem('password', password);

                //同時にこれらの情報が記録されているかを判断するフラグも保存する
                storage.setItem('signup_flag', true);

                document.getElementById('signup-alert-success').show();
            })
            .catch(function(err){
                // エラー処理
                document.getElementById('signup-alert-error').show();

                var info = document.getElementById('error-message');
                var textNode;

                if (err.name == "NoUserNameError") {
                    textNode = document.createTextNode('ユーザ名を入力してください');
                }else if (err.name == "NoPasswordError") {
                    textNode = document.createTextNode('パスワードを入力してください');
                }else if (err.message.indexOf('cannot POST') > -1) {
                    textNode = document.createTextNode('入力したユーザ名は既に使用されています');
                }else if (err.message.indexOf('Request has been terminated') > -1) {
                    textNode = document.createTextNode('ネットワーク接続がオフラインのため登録ができません');
                }
                info.appendChild(textNode);
            });
        },

    alert_hide: function() {
        //成功時にはindex.htmlへ遷移
        if (id == 'signup-alert-success') {
            var pushpage_tabbar = function(){
                function autoLink(){
                    location.href='index.html';
                }
             setTimeout(autoLink(),0);
            };

            document.getElementById(id).hide(pushpage_tabbar());

        //追加したエラーメッセージ(子ノード)を削除する
        }else if (id == 'signup-alert-error') {
            document.getElementById(id).hide();
            var info = document.getElementById('error-message');
            var childNode = info.firstChild;
            info.removeChild(childNode);
        }
    },
};


/**
 * movieで使用する関数をまとめたオブジェクト
 * @type {Object}
 */
var movie = {
    /**
     * 自動ログイン後に映画一覧画面の表示を行う
     */
    draw_movie_content: function() {
        //自動ログイン
        var ncmb = utility.get_ncmb();
        var storage = window.localStorage;
        var username = storage.getItem('username');
        var password = storage.getItem('password');

        ncmb.User.login(username, password).then(function(data){

            // ログイン後に映画情報をデータベースから取得
            var db = utility.get_database();
            db.transaction(function(tx) {
                db.executeSql('SELECT COUNT(*) AS movie_count FROM movie', [], function(res) {
                    utility.pushpage('tab.html','fade',0);

                    var movie_count = res.rows.item(0).movie_count;
                    var draw_content = function(){};


                    //ローカルに保存されている映画情報の件数で表示内容を変える
                    if (movie_count === 0) {
                        draw_content = function(){
                            document.getElementById('nodata_message').innerHTML = '登録された映画はありません';
                            movie.pullhook_setting();
                        };
                    }else {
                        draw_content = function(){
                            var infiniteList = document.getElementById('infinite-list');

                            var movie_title = 'タイトルがここに入るタイトルがここに入る';
                            var movie_thumbnail_path = 'http://placekitten.com/g/40/40';
                            var movie_subtitle = '追加日：yyyy/mm/dd';
                            
                            infiniteList.delegate = {
                                createItemContent: function(i) {
                                    return ons._util.createElement(
                                        '<ons-list-item><div class="left"><img class="list__item__thumbnail_movie" src="' + movie_thumbnail_path +'"></div><div class="center"><span class="list__item__title">' + movie_title +'</span><span class="list__item__subtitle">' +movie_subtitle +'</span></div></ons-list-item>'
                                    );
                                },
                                            
                                countItems: function() {
                                    return movie_count;
                                },

                                calculateItemHeight: function() {
                                    return ons.platform.isAndroid() ? 48 : 100;
                                }
                            };

                            infiniteList.refresh();

                            movie.pullhook_setting();
                        };
                    }

                    utility.check_page_init('movies',draw_content);
                });
            }, function(err) {
                    //SELECT文のエラー処理
                    console.log('SELECT movie ERROR: ' +JSON.stringify(err) +' ' + err.message);
                });
        }).catch(function(err){
                // ログインエラー処理
            });
    },


    /**
     * 映画一覧画面のpullhookにイベントを登録する
     */
    pullhook_setting: function() {
        var pullHook = document.getElementById('pull-hook');

        pullHook.thresholdHeight = 150;

        pullHook.addEventListener('changestate', function(event) {
            var pullhook_message = '';

            switch (event.state){
                case 'initial':
                    pullhook_message = 'Pull to refresh';
                    break;
                                
                case 'preaction':
                    pullhook_message = 'Release';
                    break;
                                
                case 'action':
                    pullhook_message = 'Loading...';
                    break;
            }

            pullHook.innerHTML = pullhook_message;
        });

        pullHook.onAction = function(done) {
            setTimeout(done, 1000);
        };
    },
};


var movieadd = {
    /**
     * Searchボタン(改行)を押した際に動作
     */
    click_done: function(){
        //console.log('click_done');
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        document.getElementById('search_movie_title').blur();
    },


    /**
     * バツボタンをタップした際に動作
     */
    tap_reset: function(){
        //formのテキストを初期化、バツボタンの削除
        document.getElementById("search_movie_title").value = "";
        document.getElementById("movieadd_reset").innerHTML = "";

        //テキスト未確定入力時にリセットボタンを押した時
       if ($(':focus').attr("id") == "search_movie_title") {
        document.getElementById("search_movie_title").blur();
        document.getElementById("search_movie_title").focus();

        //テキスト入力確定後にリセットボタンを押した時
       }else {
        document.getElementById("search_movie_title").focus();
       }
    },


    /**
     * movieaddのsearch-input横にあるキャンセルボタンをタップした際に前のページへ画面遷移する
     */
    tap_cancel: function(){
        document.getElementById("myNavigator").popPage();
        //console.log("tap_cancel");
    },


    /**
     * 検索フォームにフォーカス時、フォーカスが外れた時のアニメーションを設定する
     * @param {[string]} event_name [focusまたはblurを受け取る]
     */
    set_animation_movieadd_search_input: function(event_name) {

        //検索フィールドにフォーカスした時のアニメーション
        if (event_name == "focus") {
            //console.log("focus");

            //検索窓の入力を監視するイベントを追加する
            $("#search_movie_title").on("keyup", movieadd.get_search_movie_title_val);

            $("#movieadd_backbutton").fadeTo(100,0);
            $("#movieadd_backbutton").animate({marginLeft: "-40px"},{queue: false , duration: 200});

            $("#search_movie_title").animate({width: "150%"},{queue: false, duration: 200});

            $("#cancel_button").html("キャンセル");
            $("#cancel_button").animate({marginLeft: "45px"},{queue: false, duration: 200});
            $("#cancel_button").fadeTo(100,1);

            $("#movieadd_reset_button").animate({margin: "0px 0px 0px -100px"},{queue: false, duration: 200});

        //検索フィールドのフォーカスが外れた時のアニメーション
        } else if (event_name == "blur") {
            //console.log("blur"); 

            //検索窓の入力を監視するイベントを削除する
            $("#search_movie_title").off("keyup", movieadd.get_search_movie_title_val);

            $("#movieadd_backbutton").fadeTo(100,1);
            $("#movieadd_backbutton").animate({marginLeft: "0px"},{queue: false , duration: 200});

            $("#search_movie_title").animate({width: "170%"},{queue: false, duration: 200});

            $("#cancel_button").animate({marginLeft: "200px"},{queue: false, duration: 200});
            $("#cancel_button").fadeTo(100,0);

            $('#movieadd_reset_button').animate({margin: "0px 0px 0px -60px"},{queue: false, duration: 200});
        }
    },


    /**
     * 検索窓にテキストを入力するたびに入力したテキストを取得する
     * 検索窓の文字数が1以上ならリセットボタンを表示させる
     */
    get_search_movie_title_val: function(){
        var text = document.getElementById('search_movie_title').value;
        var resetbutton = document.getElementById('movieadd_reset');

        if (text.length > 0) {
            //[0]にlanguage=jaのリクエスト結果，[1]にはlanguage=enのリクエスト結果をそれぞれ記録する
            var array = [];

            resetbutton.innerHTML = '<ons-button id="movieadd_reset_button" onclick="movieadd.tap_reset()" style="margin: 0px 0px 0px -100px;" modifier="quiet"><ons-icon icon="ion-close-circled"></ons-icon></ons-button>';


            //結果を付き合わせる

            //リクエスト成功時のコールバック
            var successCB = function(data){
                //console.log(data);
                var json = JSON.parse(data);
                array.push(json);
            };
            //リクエスト失敗時のコールバック
            var errorCB = function(data){
                console.log("Error callback: " + data);
            };

            //日本語と英語のリクエストを行う
            Promise.all([movieadd.search_movie(text,'ja',successCB,errorCB),movieadd.search_movie(text,'en',successCB,errorCB)]).then(function() {
                
                //検索結果として表示するデータを生成する
                var list_data = movieadd.create_list_data(array);

            }, function(reason) {
              console.log(reason);
            });

        } else {
            resetbutton.innerHTML = '';
        }
    },


    /**
     * 映画のタイトルを検索して結果を取得する
     * @param  {[type]} text      [検索する映画のタイトル]
     * @param  {[type]} language  [jaなら日本語，enなら英語で結果を取得]
     * @param  {[type]} successCB [データ取得成功時のコールバック関数]
     * @param  {[type]} errorCB   [データ取得失敗時のコールバック関数]
     */
    search_movie: function(text,language,successCB,errorCB){
        return new Promise(function(resolve, reject) {
            var query_obj = {
                'query': text,
                'language': language,
            };

            theMovieDb.search.getMovie(query_obj, successCB, errorCB);
            resolve();
        });
    },

    create_list_data: function(array){
        if (array.length === 0) {
            //console.log('not match');
            return 0;
        }else{
            var list_data = [];                     //overviewが空文字でないオブジェクトを格納する
            var overview_nodata = [];               //overviewが空文字のオブジェクトのidプロパティを格納する

            var ja_results = array[0].results;
            var en_results = array[1].results;

            /*ja_resutlsの中でoverviewが空文字でないオブジェクトをlist_dataに格納する
            overviewが空文字のオブジェクトidをoverview_nodataに格納する*/
            for(var i = 0; i < ja_results.length; i++){
                var ja_overview_text = ja_results[i].overview;
                if (ja_overview_text.length !== 0) {
                    list_data.push(ja_results[i]);
                }else{
                    overview_nodata.push(ja_results[i].id);
                }
            }

            //en_resultsの中からoverview_nodataに格納されているidと一致したオブジェクトをlist_dataに格納する
            for(var j = 0; j < overview_nodata.length; j++){
                for(var k = 0; k < en_results.length; k++){
                    var nodata_id = overview_nodata[j];
                    var en_id = en_results[k].id;

                    if (nodata_id == en_id) {
                        list_data.push(en_results[k]);
                    }
                }
            }

            return list_data;
        }
    },
};


/**
 * 便利関数をまとめたオブジェクト
 * @type {Object}
 */
var utility = {
    /**
     * ncmbを生成して返す
     * @return {[object]} [生成したncmb]
     */
    get_ncmb: function(){
        var ncmb = new NCMB('f5f6c2e3aa823eea2c500446a62c5645c04fc2fbfd9833cb173e1d876f464f6c','605298c95c0ba9c654315f11c6817e790f21f83a0e9ff60dc2fdf626b1485899');
        return ncmb;
    },

    /**
     * ローカルストレージの初期化をする
     */
    delete_localstorage: function(){
        var storage = window.localStorage;
        storage.removeItem('username');
        storage.removeItem('password');
        storage.removeItem('signup_flag');
    },


    /**
     * 指定したページの読み込み終了後に指定したcallbackを実行する
     * @param  {[string]}   pageid   [pageのid]
     * @param  {Function} callback [読み込み終了後に実行したいコールバック関数]
     */
    check_page_init: function(pageid,callback){
        document.addEventListener('init', function(event) {
            if (event.target.id == pageid) {
                console.log(pageid + ' is inited');
                callback();
            }
        });
    },

    /**
     * データベースのオブジェクトを返す    
     * @return {[type]} [description]
     */
    get_database: function(){
        var db = window.sqlitePlugin.openDatabase({name: 'my_db', location: 'default'});
        return db;
    },


    /**
     * TMDBのAPIキーを返す
     * @return {[string]} [TMDBのAPIキー]
     */
    get_tmdb_apikey: function(){
        return 'dcf593b3416b09594c1f13fabd1b9802';
    },

    /**
     * htmlファイル、アニメーション、delay時間を指定するとアニメーションを行って画面遷移する
     * @param  {[string]} html_name      [画面遷移したいhtmlファイル名]
     * @param  {[string]} animation_name [アニメーション名]
     * @param  {[number]} delaytime      [Timeoutの時間]
     */
    pushpage: function(html_name, animation_name, delaytime) {
        var showpage = function(){
            document.getElementById('myNavigator').pushPage(html_name, { animation : animation_name });
        };
    
        setTimeout(showpage, delaytime);
    },
};

// //ローカルのデータベースにサーバから取得したmovieを記録する
// function insert_movie(movies){
//     var db = this.get_database();
    
//     for (var i = 0; i < movies.length; i++) {
//         console.log(movies[i]);

//        db.executeSql("INSERT INTO movie(title, tmdb_id, genre_id, keyword_id, onomatopoeia_id, thumbnail_path, username) VALUES('title', 'tmdb_id', 'genre_id')");
//         //id integer primary key, title text unique, tmdb_id integer unique, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail_path text, username text
//     }

//     // db.transaction(function(tx) {
//     //     // console.log('Open database success');
//     //     for (var i = 0; i >= 0; i--) {
//     //         Things[i]
//     //     }
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key, title text, tmdb_id text, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS Genre (id integer primary key, name text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS KeyWord (id integer primary key, name text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS Onomatopoeia (id integer primary Key, name text, joy_status text, anger_status text, sadness_status text, happiness_status text)');
//     // }, function(err) {
//     //     console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
//     //     });
// }
// 
//ログイン中のユーザ名が含まれるMovieオブジェクトを最新順で取得する
// function get_movies_ncmbobject(username, callback){
//     var ncmb = get_ncmb();
//     var Movie = ncmb.DataStore("Movie");
//     Movie.equalTo("UserName", username)
//     .order("updateDate",true)
//     .fetchAll()
//     .then(function(results){
//         insert_movie(results);
//         callback();
//     })
//     .catch(function(err){
//         console.log(err);
//     });
// }
     

app.initialize();