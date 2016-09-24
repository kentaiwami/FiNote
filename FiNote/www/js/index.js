
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
    formcheck: [false,false],                 //[0]はユーザ名とパスワード、[1]は生年月日に対応している
    
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
            
            //イベント登録
            var addevent = function(){
                document.getElementById('username').addEventListener('keyup',index.check_usernameAndpassword_form);
                document.getElementById('password').addEventListener('keyup',index.check_usernameAndpassword_form);
            };
            utility.check_page_init('signup',addevent);
        }
    },

    /**
     * ユーザ名とパスワード入力フォームのkeyupイベントが起きるたびに入力文字数を確認する
     */
    check_usernameAndpassword_form: function(){
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        if (username.length === 0 || password.length < 6) {
            index.formcheck[0] = false;
        }else{
            index.formcheck[0] = true;
        }
        
        index.change_abled_signup_button();
    },

    /**
     * formcheck配列を確認して全てtrueならボタンをabledに、そうでなければdisabledにする
     */
    change_abled_signup_button: function(){
        if (index.formcheck[0] === true && index.formcheck[1] === true) {
            document.getElementById('signup_button').removeAttribute('disabled');
        }else{
            document.getElementById('signup_button').setAttribute('disabled');
        }
    }
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

        //性別のチェック状態を確認
        var sex = Signup.get_sex();

        //ユーザー名・パスワードを設定
        user.set('userName', document.getElementById('username').value)
            .set('password', document.getElementById('password').value)
            .set('birthday', Number(document.getElementById('birthday').value))
            .set('sex', sex);

        // 新規登録
        user.signUpByAccount()
            .then(function(){
                /*登録後処理*/
                //ローカルにユーザ名とパスワードを保存する。
                var username = document.getElementById('username').value;
                var password = document.getElementById('password').value;
                var birthday = Number(document.getElementById('birthday').value);
                var sex = Signup.get_sex();

                var storage = window.localStorage;
                storage.setItem('username', username);
                storage.setItem('password', password);
                storage.setItem('birthday', birthday);
                storage.setItem('sex', sex);

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

    alert_hide: function(id) {
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

    /**
     * 生年月日を選択させるフォーム
     */
    birthday_pickerview: function(){
        cordova.plugins.Keyboard.close();

        //今年から100年前までの年テキストをオブジェクトとして生成する
        var birthday = document.getElementById('birthday');
        var time = new Date();
        var year = time.getFullYear();
        var items_array = [];

        //フォーカスした際にpickerviewデフォルド選択の値を決める
        var fastvalue = '';
        if (birthday.value.length === 0) {
            fastvalue = String(year);
        }else{
            fastvalue = birthday.value;
        }

        for (var i = year; i >= year-100; i--) {
            var obj = {text: String(i), value: String(i)};
            items_array.push(obj);
        }

        var config = {
            title: '', 
            items: items_array,

            selectedValue: fastvalue,
            doneButtonLabel: 'Done',
            cancelButtonLabel: 'Cancel'
        };

        window.plugins.listpicker.showPicker(config, 
        function(item) { 
            birthday.value = item;
            index.formcheck[1] = true;
            index.change_abled_signup_button();
        },
        function() { 
            console.log("You have cancelled");
        });
    },

    /**
     * 性別を選択するチェックボックスの状態から性別の識別子を返す
     * @return {[string]} [M or F]
     */
    get_sex: function(){
        var M = document.getElementById('radio-1').checked;
        if (M === true) {
            return 'M';
        }else{
            return 'F';
        }
    }
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
                console.log(err);
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


var movieadd_search = {
    /**
     * Searchボタン(改行)を押した際に動作
     */
    click_done: function(){
        //console.log('click_done');
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        document.getElementById('search_movie_title').blur();
        
        movieadd_search.get_search_movie_title_val();
    },


    /**
     * バツボタンをタップした際に動作
     */
    tap_reset: function(){
        //formのテキストを初期化、バツボタンの削除、検索結果なしメッセージの削除
        document.getElementById('search_movie_title').value = '';
        document.getElementById('movieadd_search_reset').innerHTML = '';
        document.getElementById('movieadd_no_match_message').innerHTML = '';
        movieadd_search.not_show_list();

        //テキスト未確定入力時にリセットボタンを押した時
       if ($(':focus').attr('id') == 'search_movie_title') {
        document.getElementById('search_movie_title').blur();
        document.getElementById('search_movie_title').focus();

        //テキスト入力確定後にリセットボタンを押した時
       }else {
        document.getElementById('search_movie_title').focus();
       }
    },


    /**
     * movieadd_searchのsearch-input横にあるキャンセルボタンをタップした際に前のページへ画面遷移する
     */
    tap_cancel: function(){
        document.getElementById('myNavigator').popPage();
        //console.log("tap_cancel");
    },


    /**
     * 検索フォームにフォーカス時、フォーカスが外れた時のアニメーションを設定する
     * @param {[string]} event_name [focusまたはblurを受け取る]
     */
    set_animation_movieadd_search_input: function(event_name) {

        //検索フィールドにフォーカスした時のアニメーション
        if (event_name == 'focus') {
            //console.log("focus");

            //検索窓の入力を監視するイベントを追加する
            $('#search_movie_title').on('input', movieadd_search.get_search_movie_title_val);

            $('#movieadd_search_backbutton').fadeTo(100,0);
            $('#movieadd_search_backbutton').animate({marginLeft: '-40px'},{queue: false , duration: 200});

            $('#search_movie_title').animate({width: '150%'},{queue: false, duration: 200});

            $('#movieadd_search_cancel_button').html('キャンセル');
            $('#movieadd_search_cancel_button').animate({marginLeft: '45px'},{queue: false, duration: 200});
            $('#movieadd_search_cancel_button').fadeTo(100,1);

            $('#movieadd_reset_button').animate({margin: '0px 0px 0px -100px'},{queue: false, duration: 200});

        //検索フィールドのフォーカスが外れた時のアニメーション
        } else if (event_name == 'blur') {
            //console.log("blur");
            movieadd_search.get_search_movie_title_val();

            //検索窓の入力を監視するイベントを削除する
            $('#search_movie_title').off('input', movieadd_search.get_search_movie_title_val);

            $('#movieadd_search_backbutton').fadeTo(100,1);
            $('#movieadd_search_backbutton').animate({marginLeft: '0px'},{queue: false , duration: 200});

            $('#search_movie_title').animate({width: '170%'},{queue: false, duration: 200});

            $('#movieadd_search_cancel_button').animate({marginLeft: '200px'},{queue: false, duration: 200});
            $('#movieadd_search_cancel_button').fadeTo(100,0);

            $('#movieadd_reset_button').animate({margin: '0px 0px 0px -60px'},{queue: false, duration: 200});
        }
    },

    show_list_data: [],     //listに表示中のデータを格納する


    /**
     * 検索窓にテキストを入力するたびに入力したテキストを取得する
     * 検索窓の文字数が1以上ならリセットボタンを表示させる
     */
    get_search_movie_title_val: function(){
        var text = document.getElementById('search_movie_title').value;
        var resetbutton = document.getElementById('movieadd_search_reset');
        var no_match_message = document.getElementById('movieadd_no_match_message');

        if (text.length > 0) {
            //テキストエリアのリセットボタン表示、スピナー表示
            resetbutton.innerHTML = '<ons-button id="movieadd_reset_button" onclick="movieadd_search.tap_reset()" style="margin: 0px 0px 0px -100px;" modifier="quiet"><ons-icon icon="ion-close-circled"></ons-icon></ons-button>';
            utility.show_spinner('movieadd_no_match_message');

            //日本語と英語のリクエストを行う
            var promises = [movieadd_search.create_request_movie_search(text,'ja'),movieadd_search.create_request_movie_search(text,'en')];

            Promise.all(promises).then(function(results) {
                utility.stop_spinner();
                //検索結果として表示するデータを生成する
                var list_data = movieadd_search.create_list_data(results);
                movieadd_search.show_list_data = list_data;

                //データによって表示するコンテンツを動的に変える
                if (list_data.length === 0) {
                    no_match_message.innerHTML = '検索結果なし';
                    movieadd_search.not_show_list();
                }else{
                    no_match_message.innerHTML = '';
                                                                                                                                      
                    var list_data_poster = movieadd_search.get_poster(list_data);

                    //サムネイル取得後にリストを表示する
                    var infiniteList = document.getElementById('movieadd_search_list');
                    var movie_subtitle = '公開日：';
                            
                    infiniteList.delegate = {
                        createItemContent: function(i) {

                            var date = list_data[i].release_date;
                            if (date.length === 0) {
                                list_data[i].release_date = '情報なし';
                            }


                            return ons._util.createElement(
                                '<ons-list-item id="' + i + '" onclick="movieadd_search.tap_list(this)" modifier="chevron" class="list-item-container"><ons-row><ons-col width="95px"><img style="background:url(img/loading.gif) no-repeat center" class="thumbnail" src="' + list_data_poster[i] +'"></ons-col><ons-col><div class="name">' + list_data[i].title +'</div><div class="desc">' +movie_subtitle+list_data[i].release_date +'</div></ons-col><ons-col width="40px"></ons-col></ons-row></ons-list-item>'
                            );
                        },
                                            
                        countItems: function() {
                            return list_data.length;
                        },

                        calculateItemHeight: function() {
                            return ons.platform.isAndroid() ? 48 : 100;
                        }
                    };
                    
                }

            }, function(reason) {
              console.log(reason);
            });

        } else {
            resetbutton.innerHTML = '';
            no_match_message.innerHTML = '';
            movieadd_search.not_show_list();
        }
    },

    
    /**
     * 映画をタイトルで検索するリクエストを生成して実行する
     * @param  {[string]} movie_title [検索したい映画タイトル]
     * @param  {[string]} language    [jaで日本語情報、enで英語情報]
     * @return {[json]}             [検索結果をjsonに変換したもの]
     */
    create_request_movie_search: function(movie_title, language){
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            var api_key = utility.get_tmdb_apikey();
            var request_url = 'http://api.themoviedb.org/3/search/movie?query=' +movie_title +'&api_key=' + api_key + '&language=' +language;

            request.open('GET', request_url);

            request.setRequestHeader('Accept', 'application/json');

            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    var contact = JSON.parse(this.responseText);
                    resolve(contact);
                }
            };

            request.send();
        });
    },

    /**
     * jaとenの検索結果を1つの配列にまとめる
     * @param  {[array]} array [[0]にjaリクエストの配列、[1]にenリクエストの配列]
     * @return {[array]}       [jaとen検索結果をまとめた配列]
     */
    create_list_data: function(array){
        if (array.length === 0) {
            return [];
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

    /**
     * サムネイルとして表示する画像を取得する
     * @param  {[array]} list_data [映画オブジェクトの配列]
     * @return {[string]}           [画像のパス]
     */
    get_poster: function(list_data){
        var image_url_array = [];

        //画像を配列に格納する
        for(var i = 0; i < list_data.length; i++){
            var poster_path = list_data[i].poster_path;
            var url = '';

            if (poster_path !== null) {
                url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2' + poster_path;
                image_url_array.push(url);
            }else{
                url = 'img/noimage.png';
                image_url_array.push(url);
            }
        }
        return image_url_array;
    },

    /**
     * リストのコンテンツを非表示にする
     */
    not_show_list: function(){
        var infiniteList = document.getElementById('movieadd_search_list');
        infiniteList.delegate = {
            createItemContent: function(i) {
                return ons._util.createElement();
            },
                                            
            countItems: function() {
                return 0;
            },

            calculateItemHeight: function() {
                return ons.platform.isAndroid() ? 48 : 100;
            }
        };
    },


    /**
     * リストをタップした際に動作する
     * @param  {[object]} obj [タップしたオブジェクト]
     */
    tap_list: function(obj){
        var list_data = movieadd_search.show_list_data;
        var tap_id = obj.id;
        var myNavigator = document.getElementById('myNavigator');

        //movieaddの画面初期化後に動作する関数を定義
        var callback = function(){
            movieadd.show_contents(list_data,tap_id);
        };
        utility.check_page_init('movieadd',callback);

        //映画追加画面へ遷移
        myNavigator.pushPage('movieadd.html', {});
    },
};



var movieadd = {

    taped: false,       //falseなら映画の情報が表示されていない、trueは表示済み(表示中)

    /**
     * [映画追加画面のコンテンツを表示する]
     * @param  {[array]} list_data [検索結果の映画オブジェクトが格納された配列]
     * @param  {[number]} tap_id    [映画検索画面のリストのうちタップされたリスト番号]
     */
    show_contents: function(list_data,tap_id){
        //card部分に表示する画像を取得して表示
        var card = document.getElementById('movieadd_card');
        var tap_list_obj = document.getElementById(tap_id);
        var img_url = tap_list_obj.children[0].children[0].children[0].children[0].getAttribute('src');

        card.style.backgroundImage = 'url('+img_url+')';
        card.style.backgroundRepeat = 'no-repeat';
        card.style.height = '87%';
        card.style.width = 'auto';

        //card部分や吹き出しタップ時に表示する情報の取得と追加
        var title = list_data[tap_id].title;
        var overview = list_data[tap_id].overview;
        var release_date = list_data[tap_id].release_date;
        card.innerHTML = '<div class="modal" id="movie_detail_info" style="height: 87%; opacity: 0.0;"><div class="modal__content"><p>'+ title +'</p><p>'+ overview +'</p><p>'+ release_date +'</p></div></div>';

        movieadd.show_vote_average(list_data[tap_id].vote_average);
    },

    /**
     * 映画追加画面上部のツールバーにあるバックボタンをタップした際にpopPageを行う
     */
    tap_backbutton: function(){
        document.getElementById('myNavigator').popPage();
    },


    /**
     * card部分や吹き出しタップ時にアニメーション表示を行う
     */
    fadeTo_detail_info: function(){
        if (movieadd.taped === false) {
            $('#movie_detail_info').fadeTo(300,1);
            movieadd.taped = true;
        }else {
            $('#movie_detail_info').fadeTo(300,0);
            movieadd.taped = false;
        }  
    },


    /**
     * 映画のレーティングを最大評価5に合うように計算して表示する
     * @param  {[number]} vote_average [最大評価10.0の評価値]
     */
    show_vote_average: function(vote_average){
        //検索結果のvote_averageはMAX10なので半分にする
        var ave = vote_average / 2.0;

        //小数点第2位で四捨五入をする
        var pow = Math.pow(10,1);
        ave = Math.round(ave*pow) / pow;

        //整数部分に0.5を足してx.5という形にする
        var pivot = Math.floor(ave) + 0.5;

        //x.5より大きいか小さいかで(x.5〜x.5+0.5)か(x.0〜x.5)の上限と下限を決定する
        var under_limit = 0.0;
        var over_limit = 0.0;
        
        if (ave < pivot) {
            under_limit = pivot - 0.5;
            over_limit = pivot;
        }else {
            under_limit = pivot;
            over_limit = pivot + 0.5;
        }

        //上限と下限に近い方の値をvote_averageとする
        var result = 0.0;
        if (Math.abs(ave-under_limit) < Math.abs(ave-over_limit)) {
            result = under_limit;
        }else {
            result = over_limit;
        }

        //整数部と少数部を取得
        var integer = Math.floor(result);
        var few = String(result).split(".")[1];

        //星と数値を書き込む
        var rating_num = document.getElementById('movieadd_rating');
        var innerHTML_string = '';
        var few_write = false;
        for(var i = 0; i < 5; i++){
            if (i < integer) {
                innerHTML_string += '<ons-icon icon="ion-ios-star" fixed-width="false"></ons-icon>';
            }else if (few == 5 && few_write === false) {
                innerHTML_string += '<ons-icon icon="ion-ios-star-half" fixed-width="false"></ons-icon>';
                few_write = true;
            }else{
                innerHTML_string += '<ons-icon icon="ion-ios-star-outline" fixed-width="false"></ons-icon>';
            }
        }

        innerHTML_string += result;

        rating_num.innerHTML = innerHTML_string;
    },

    tap_add: function(){
        //スピナー表示        
        //クラウドとローカルに保存(promiseall)
        //スピナー非表示
        //アラート表示
        //検索画面に遷移
    },

    /**
     * 映画の詳細を表示している画面の気分リストをタップした際に画面遷移する
     */
    tap_add_feeling: function(){
        utility.pushpage('movieadd_feeling.html', 'lift', 0);
    },
};

var movieadd_feeling = {

    add_list: function(feeling_name){
        console.log('feeling_name');
    },

    tap_add: function(){
        ons.notification.prompt({title: '気分を入力',
                                 message: '映画を観た気分を5文字以内で入力',
                                 placeholder: '例) ドキドキ、ワクワク、ハラハラなど',
                                 buttonLabel: '追加',
                                 callback: movieadd_feeling.add_list(inputElement.value)});
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
        storage.removeItem('birthday');
        storage.removeItem('sex');
        storage.removeItem('signup_flag');
    },

    /**
     * ローカルストレージの状態を表示する
     */
    show_localstorage: function(){
        var storage = window.localStorage;
        var username = storage.getItem('username');
        var password = storage.getItem('password');
        var birthday = storage.getItem('birthday');
        var sex = storage.getItem('sex');
        var signup_flag = storage.getItem('signup_flag');
        var obj = {'username':username, 'password':password, 'birthday':birthday, 'sex':sex, 'signup_flag':signup_flag};
        console.log(obj);
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

    /**
     * 画面のwidth,heightを取得する
     * @return {[object]} [widthとheightが格納されたオブジェクト]
     */
    getScreenSize: function() {
        var w = window.parent.screen.width;
        var h = window.parent.screen.height;
        
        var obj = {w:w,h:h};
        return obj;
    },

    /**
     * ブラウザで強制的にログインするための関数
     * @return {[type]} [description]
     */
    browser_signup: function(){
        var callback = function(){
            document.getElementById('username').value = 'ブラウザユーザ';
            document.getElementById('password').value = 'password';
            document.getElementById('birthday').value = '1994';

            index.formcheck[0] = true;
            index.formcheck[1] = true;

            var storage = window.localStorage;
            storage.setItem('username', document.getElementById('username').value);
            storage.setItem('password', document.getElementById('password').value);
            storage.setItem('birthday', Number(document.getElementById('birthday').value));
            storage.setItem('sex', 'M');
            storage.setItem('signup_flag', true);
        };
        utility.check_page_init('signup',callback);
    },


    spinner: {},        //spinnerオブジェクト格納用

    /**
     * 指定した親要素にスピナーを表示する
     * @param  {[string]} parent [親要素のid]
     */
    show_spinner: function(parent){
        var opts = {
          lines: 13, //線の数
          length: 8, //線の長さ
          width: 3, //線の幅
          radius: 16, //スピナーの内側の広さ
          corners: 1, //角の丸み
          rotate: 74, //向き(あんまり意味が無い・・)
          direction: 1, //1：時計回り -1：反時計回り
          color: '#000', // 色
          speed: 2.0, // 一秒間に回転する回数
          trail: 71, //残像の長さ
          shadow: true, // 影
          hwaccel: true, // ？
          className: 'spinner', // クラス名
          zIndex: 2e9, // Z-index
          top: '50%', // relative TOP
          left: '50%', // relative LEFT
          opacity: 0.25, //透明度
          fps: 40 //fps
        };
        //描画先の親要素
        var spin_target = document.getElementById(parent);
        //スピナーオブジェクト
        var spinner = new Spinner(opts);
        utility.spinner = spinner;
        //スピナー描画
        spinner.spin(spin_target);
    },

    /**
     * [スピナーの表示を止める]
     */
    stop_spinner: function(){
        utility.spinner.spin();
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