/************************************************************
                            Cordova
 ************************************************************/
var app = {
  initialize: function() {
    this.bindEvents();
  },


  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },


  onDeviceReady: function() {
    navigator.splashscreen.hide();

    //ステータスバーの自動調整を無効にする
    ons.disableAutoStatusBarFill();

    //キーボードのアクセサリーバーを表示する
    Utility.hideKeyboardAccessoryBar(false);

    //データベースのテーブルを構築する
    var db = Utility.get_database();

    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key AUTOINCREMENT, title text unique, tmdb_id integer unique, genre_id text, onomatopoeia_id text, poster text, overview text, dvd integer, fav integer, add_year integer, add_month integer, add_day integer)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS genre (id integer primary key AUTOINCREMENT, genre_id integer, name text unique)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS onomatopoeia (id integer primary Key AUTOINCREMENT, name text)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS profile_img (id integer primary Key AUTOINCREMENT, img text)');
    }, function(err) {
      console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
    });
    // DB_method.delete_all_record();
    Index.check_signup();
  }
};





/************************************************************
                      Global Variable
 ************************************************************/
/**
* 関数をまとめたオブジェクト間で使用する変数をまとめる
* @type {Object}
*/
var Global_variable = {
  //Movies.update_movieとMovieadd.add_movieにて使用
  movie_update_flag: false,

  //0なら映画追加画面からの気分リスト、1なら映画詳細画面からの気分リスト
  feeling_flag: 0,

  // 0なら映画追加画面からのステータス画面、1なら映画詳細画面からのステータス画面
  status_flag: 0,

  /**
   * 気分リストのツールバー左に表示するボタンを動的に変える
   * @param  {number} flag - 0なら映画追加画面、1なら映画詳細画面からの気分リスト
   * @return {string}      - ボタンのhtml
   */
  get_toolbar_feeling: function(flag) {
    if (flag === 0) {
      return '<ons-toolbar-button class="brown_color"><ons-icon class="brown_color" icon="ion-close-round"></ons-icon></ons-toolbar-button>';
    }else {
      return '<ons-back-button class="brown_color"></ons-back-button>';
    }
  },


  /**
   * ステータスのツールバー左に表示するボタンを動的に変える
   * @param  {number} flag - 0なら映画追加画面、1なら映画詳細画面からのステータス画面]
   * @return {string}      - ボタンのhtml
   */
  get_toolbar_status: function(flag) {
    if (flag === 0) {
      return '<ons-toolbar-button onClick="Utility.pop_page(Movieadd_status.close_movieadd_status())"><ons-icon id="status_toolbar_left_icon" class="brown_color" icon="ion-close-round"></ons-icon></ons-toolbar-button>';
    }else {
      return '<ons-back-button onClick="Movies_detail.tap_status_back_button()" class="brown_color"></ons-back-button>';
    }
  }
};





/************************************************************
                        index.html
 ************************************************************/
/**
* indexで使用する関数をまとめたオブジェクト
* @type {Object}
*/
var Index = {
  formcheck: [false,false],   //[0]入力項目、[1]は生年月日に対応している
  

  /**
   * サインアップしているかを確認する
   */
  check_signup: function(){
    var storage = window.localStorage;
    var signup_flag = storage.getItem(ID.get_localStorage_ID().signup_flag);

    //ユーザ情報が登録されている場合は自動ログインを行う
    if (signup_flag === 'true') {
      Movies.run_draw_movie_content();

    //ユーザ情報が登録されていない場合はsignupへ遷移
    }else {
      Utility.push_page(ID.get_top_ID().tmp_id,'fade',1000, '');
      
      //イベント登録
      var addevent = function(){
        // sign upのフォームにイベントを登録
        document.getElementById(ID.get_signup_ID().username).addEventListener('keyup',Index.check_usernameAndpassword_form);
        document.getElementById(ID.get_signup_ID().password).addEventListener('keyup',Index.check_usernameAndpassword_form);
        document.getElementById(ID.get_signup_ID().email).addEventListener('keyup',Index.check_usernameAndpassword_form);

        // sign inのフォームにイベントを登録
        document.getElementById(ID.get_signin_ID().username).addEventListener('keyup',Signin.check_usernameAndpassword_form);
        document.getElementById(ID.get_signin_ID().password).addEventListener('keyup',Signin.check_usernameAndpassword_form);

      };

      // inputフォームの監視イベントを追加
      Utility.check_page_init(ID.get_top_ID().page_id,addevent);

      // カルーセルのページ変更を監視するイベントを追加
      Utility.check_page_init(ID.get_top_ID().page_id,Top.check_post_change);
    }
  },


  /**
   * ユーザ名とパスワード入力フォームのkeyupイベントが起きるたびに入力文字数を確認する
   */
  check_usernameAndpassword_form: function(){
    var username = document.getElementById(ID.get_signup_ID().username).value;
    var password = document.getElementById(ID.get_signup_ID().password).value;
    var email = document.getElementById(ID.get_signup_ID().email).value;

    Index.formcheck[0] = !(username.length === 0 || email.length === 0 || password.length < 6);
    
    Index.change_abled_signup_button();
  },


  /**
   * formcheck配列を確認して全てtrueならボタンをabledに、そうでなければdisabledにする
   */
  change_abled_signup_button: function(){
    if (Index.formcheck[0] === true && Index.formcheck[1] === true) {
      document.getElementById(ID.get_signup_ID().signup_button).removeAttribute('disabled');
    }else{
      document.getElementById(ID.get_signup_ID().signup_button).setAttribute('disabled', 'disabled');
    }
  }
};





/************************************************************
                        top.html
 ************************************************************/
var Top = {
  /**
   * カルーセルの変更イベントをキャッチして、ツールバーのメッセージを変更する関数
   */
  check_post_change: function(){
    document.addEventListener('postchange', function(event) {
      if (event.target.id === 'top_carousel') {
        console.log('active carousel is ' + event.activeIndex);

        var toolbar_center = document.getElementById(ID.get_top_ID().toolbar_center);
        if (event.activeIndex === 0) {
          toolbar_center.innerHTML = 'ユーザ登録';
        }else {
          toolbar_center.innerHTML = 'ログイン';
        }
      }
    });
  },


  prev: function() {
    var carousel = document.getElementById(ID.get_top_ID().carousel);
    carousel.prev();
  },


  next: function() {
    var carousel = document.getElementById(ID.get_top_ID().carousel);
    carousel.next();
  }
};





/************************************************************
                         signup.html
 ************************************************************/
/**
* サインアップ画面で使用する関数をまとめたオブジェクト
* @type {Object}
*/
var Signup = {
  /**
   * フォームに入力された値をサーバへ送信してサインアップを行い、その後ローカルへ保存する
   */
  usersignup: function() {
    Utility.show_spinner(ID.get_signup_ID().list_id);

    var username = document.getElementById(ID.get_signup_ID().username).value;
    var password = document.getElementById(ID.get_signup_ID().password).value;
    var email = document.getElementById(ID.get_signup_ID().email).value;
    var birthday = Number(document.getElementById(ID.get_signup_ID().birthday).value);
    var sex = Signup.get_sex();

    var data ={
        "username": username,
        "password": password,
        "email": email,
        "birthday": birthday,
        "sex": sex
    };

    // 新規登録
    Utility.FiNote_API('signup', data, 'POST', 'v1').then(function(result) {
      /*登録後処理*/
      var json_data = JSON.parse(result);

      //ローカルに個人情報を保存
      var storage = window.localStorage;
      storage.setItem(ID.get_localStorage_ID().username, username);
      storage.setItem(ID.get_localStorage_ID().password, password);
      storage.setItem(ID.get_localStorage_ID().email, email);
      storage.setItem(ID.get_localStorage_ID().birthday, birthday);
      storage.setItem(ID.get_localStorage_ID().sex, sex);
      storage.setItem(ID.get_localStorage_ID().adult, false);
      storage.setItem(ID.get_localStorage_ID().signup_flag, true);
      storage.setItem(ID.get_localStorage_ID().token, json_data.token);
      storage.setItem(ID.get_localStorage_ID().profile_img, '');
      

      Utility.stop_spinner();
      document.getElementById(ID.get_signup_ID().success_alert).show();
    })
    .catch(function(err){
      // エラー処理
      Utility.stop_spinner();
      Utility.show_error_alert('登録エラー', err, 'OK');
    });
  },


  /**
   * 会員登録成功時に表示されるアラートのOKボタンを押した際に、
   * アラートを閉じて映画一覧へ遷移する関数
   */
  alert_hide: function() {
    // 会員登録の成功時にはindex.htmlへ遷移
      var pushpage_tabbar = function(){
        function autoLink(){
            location.href= ID.get_index_ID().tmp_id;
        }
       setTimeout(autoLink(),0);
      };

      document.getElementById(ID.get_signup_ID().success_alert).hide(pushpage_tabbar());
  },


  /**
   * 生年を選択させるフォームへpickerを設定する
   */
  birthday_pickerview: function(){
    cordova.plugins.Keyboard.close();
    //今年から100年前までの年テキストをオブジェクトとして生成する
    var birthday = document.getElementById(ID.get_signup_ID().birthday);
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
      doneButtonLabel: '完了',
      cancelButtonLabel: 'キャンセル'
    };

    window.plugins.listpicker.showPicker(config, function(item) {
      birthday.value = item;
      Index.formcheck[1] = true;
      Index.change_abled_signup_button();
    },
    function() {
      console.log("You have cancelled");
    });
  },


  /**
   * 性別を選択するチェックボックスの状態から性別の識別子を返す
   * @return {string} - M or F
   */
  get_sex: function(){
    var M = document.getElementById(ID.get_signup_ID().radio).checked;
    if (M === true) {
      return 'M';
    }else{
      return 'F';
    }
  }
};





/************************************************************
                        Signin.html
 ************************************************************/
var Signin = {
  // 既に処理済みの映画タイトル、ジャンル名、オノマトペを保存
  exist: {movie_title_array: [], genre_array: [], onomatopoeia_array: []},


  /**
   * ユーザ名とパスワード入力フォームのkeyupイベントが起きるたびに入力文字数を確認する
   */
  check_usernameAndpassword_form: function(){
    var username = document.getElementById(ID.get_signin_ID().username).value;
    var password = document.getElementById(ID.get_signin_ID().password).value;

    var signin_button = document.getElementById(ID.get_signin_ID().signin_button);

    if (username.length === 0 || password.length < 6) {
      signin_button.setAttribute('disabled', 'disabled');
    }else{
      signin_button.removeAttribute('disabled');
    }
  },


  /**
   * サインインボタンを押した際に、ユーザ情報とサーバから取得した映画情報を保存する
   */
  tap_sign_in_button: function() {
    // 共通で使用する配列の初期化
    Signin.exist.movie_title_array = [];
    Signin.exist.genre_array = [];
    Signin.exist.onomatopoeia_array = [];

    Utility.show_spinner(ID.get_signin_ID().signin_carousel);
    var username = document.getElementById(ID.get_signin_ID().username).value;
    var password = document.getElementById(ID.get_signin_ID().password).value;

    var data = {"username": username, "password": password};

    Utility.FiNote_API('sign_in_no_token', data, 'POST', 'v1').then(function(result) {
      var backup_json = JSON.parse(result).results;
      var backup_json_length = backup_json.length;

      // ローカルDBへユーザ情報を格納
      var storage = window.localStorage;
      storage.setItem(ID.get_localStorage_ID().username, backup_json[backup_json_length - 5].username);
      storage.setItem(ID.get_localStorage_ID().password, password);
      storage.setItem(ID.get_localStorage_ID().email, backup_json[backup_json_length - 4].email);
      storage.setItem(ID.get_localStorage_ID().birthday, backup_json[backup_json_length - 3].birthday);
      storage.setItem(ID.get_localStorage_ID().sex, backup_json[backup_json_length - 2].sex);
      storage.setItem(ID.get_localStorage_ID().token, backup_json[backup_json_length - 6].token);
      storage.setItem(ID.get_localStorage_ID().signup_flag, true);
      storage.setItem(ID.get_localStorage_ID().adult, false);

      // サーバから返ってきたレスポンスリストの1つ1つに対してpromiseを作成
      var promises = [];
      for(var i = 0; i < backup_json_length - 7; i++) {
        promises.push(Signin.movie_restore(backup_json[i]));
      }

      promises.reduce(function(prev, curr) {
        return prev.then(curr);
      }, Promise.resolve())
      .then(function() {
        // サーバから取得したプロフ画像の文字列に応じて何もしないか、テーブルへ挿入するかを変える
        var profile_img_str = backup_json[backup_json_length - 1].profile_img;
        var query = '';
        if (profile_img_str === '') {
          return '';
        }else {
          query = 'INSERT INTO profile_img(img) VALUES(?)';
          return DB_method.single_statement_execute(query, [profile_img_str]);
        }
      })
      .then(function(result) {
        console.log(result);
        console.log('******* restore all done *******');
        Utility.stop_spinner();
        Movies.run_draw_movie_content();
      });
    })
    .catch(function(err) {
      Utility.stop_spinner();
      console.log(err);
      Utility.show_error_alert('エラー', err, 'OK');
    });
  },


  /**
   * サーバから取得したリスト(BackUpレコード)1つに対してリストア処理を行う
   * @param  {Object} movie - サーバから取得したBackUpのレコード(1つ)
   * @return {Function}
   */
  movie_restore: function(movie) {
    return function() {
      return new Promise(function(resolve, reject) {

        // ローカルDBに映画が未保存の場合
        if (Signin.exist.movie_title_array.indexOf(movie.movie__title) === -1) {
          // 画像のダウンロード
          var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
          var image = new Image();
          image.src = base_url + movie.movie__poster_path;
          image.onload = function () {

            var promises = [];
            var query = '';

            var genre_insert_flag = false;
            var onomatopoeia_insert_flag = false;

            // result[0]
            promises.push(Utility.image_to_base64(image, 'image/jpeg'));

            // ローカルDBにジャンルが保存しているかに応じてクエリを変える
            var create_genre_onomatopoeia_query = Signin.create_genre_onomatopoeia_query(movie);
            var genre_onomatopoeia_query = create_genre_onomatopoeia_query.promises;
            Array.prototype.push.apply(promises, genre_onomatopoeia_query);

            // フラグを取得
            genre_insert_flag = create_genre_onomatopoeia_query.genre_flag;
            onomatopoeia_insert_flag = create_genre_onomatopoeia_query.onomatopoeia_flag;

            // 画像のダウンロード、ジャンル・オノマトペの取得 or 挿入の処理が終了したら
            Promise.all(promises).then(function(result) {
              var image_b64 = result[0];
              var genre_id = '';
              var onomatopoeia_id = '';

              // ジャンルのクエリに応じて取得する値を合わせる
              if (genre_insert_flag) {
                genre_id = String(result[1].insertId);
              }else {
                genre_id = String(result[1].rows.item(0).id);
              }

              // オノマトペのクエリに応じて取得する値を合わせる
              if (onomatopoeia_insert_flag) {
                onomatopoeia_id = String(result[2].insertId);
              }else {
                onomatopoeia_id = String(result[2].rows.item(0).id);
              }

              var insert_data = [
                movie.movie__title,
                Number(movie.movie__tmdb_id),
                genre_id,
                onomatopoeia_id,
                image_b64,
                movie.movie__overview,
                movie.dvd,
                movie.fav,
                movie.add_year,
                movie.add_month,
                movie.add_day
              ];
              query = 'INSERT INTO movie(title, tmdb_id, genre_id, onomatopoeia_id, poster, overview, dvd, fav, add_year, add_month, add_day) VALUES(?,?,?,?,?,?,?,?,?,?,?)';

              return DB_method.single_statement_execute(query, insert_data);
            }).then(function() {
              // 既に追加済みとして映画タイトル、ジャンル名、オノマトペ名を記録
              if (genre_insert_flag) {
                Signin.exist.genre_array.push(movie.movie__genre__name);
              }

              if (onomatopoeia_insert_flag) {
                Signin.exist.onomatopoeia_array.push(movie.onomatopoeia__name);
              }

              Signin.exist.movie_title_array.push(movie.movie__title);
              resolve();
            })
            .catch(function(err) {
              console.log(err);
              Utility.show_error_alert('エラー発生', err, 'OK');
              reject();
            });
          };

        // ローカルDBに映画が保存済みの場合
        }else {
          var genre_insert_flag_exist = false;
          var onomatopoeia_insert_flag_exist = false;
          var promises_exist = [];
          var query_exist = '';
          var genre_id = '';
          var onomatopoeia_id = '';

          // ローカルDBにジャンルが保存しているかに応じてクエリを変える
          var create_genre_onomatopoeia_query = Signin.create_genre_onomatopoeia_query(movie);
          Array.prototype.push.apply(promises_exist, create_genre_onomatopoeia_query.promises);

          // フラグを取得
          genre_insert_flag_exist = create_genre_onomatopoeia_query.genre_flag;
          onomatopoeia_insert_flag_exist = create_genre_onomatopoeia_query.onomatopoeia_flag;

          // 保存済みの映画のgenre_idとonomatopoeia_idを取得するクエリを生成して追加
          // result[2]
          query_exist = 'SELECT genre_id, onomatopoeia_id FROM movie WHERE tmdb_id = ?';

          promises_exist.push(DB_method.single_statement_execute(query_exist, [Number(movie.movie__tmdb_id)]));

          // ジャンル・オノマトペの取得 or 挿入、映画レコードの取得が終了したら
          Promise.all(promises_exist).then(function(result) {
            // ジャンルのクエリに応じて取得する値を合わせる
            if (genre_insert_flag_exist) {
              genre_id = String(result[0].insertId);
            }else {
              genre_id = String(result[0].rows.item(0).id);
            }

            // オノマトペのクエリに応じて取得する値を合わせる
            if (onomatopoeia_insert_flag_exist) {
              onomatopoeia_id = String(result[1].insertId);
            }else {
              onomatopoeia_id = String(result[1].rows.item(0).id);
            }

            // ローカルに保存してあるgenre_idやonomatopoeia_idに同じidが含まれていない時のみ追加
            var now_genre_id = result[2].rows.item(0).genre_id;
            var now_onomatopoeia_id = result[2].rows.item(0).onomatopoeia_id;
            var new_genre_id = '';
            var new_onomatopoeia_id = '';

            if (now_genre_id.indexOf(genre_id) === -1) {
              new_genre_id = result[2].rows.item(0).genre_id + ',' + genre_id;
            }else {
              new_genre_id = now_genre_id;
            }

            if (now_onomatopoeia_id.indexOf(onomatopoeia_id) === -1) {
              new_onomatopoeia_id = result[2].rows.item(0).onomatopoeia_id + ',' + onomatopoeia_id;
            }else {
              new_onomatopoeia_id = now_onomatopoeia_id;
            }

            query_exist = 'UPDATE movie SET genre_id = ?, onomatopoeia_id = ? WHERE tmdb_id = ?';

            return DB_method.single_statement_execute(query_exist, [new_genre_id, new_onomatopoeia_id, Number(movie.movie__tmdb_id)]);
          })
          .then(function() {
            // 既に追加済みとして映画タイトル、ジャンル名、オノマトペ名を記録
            if (genre_insert_flag_exist) {
              Signin.exist.genre_array.push(movie.movie__genre__name);
            }

            if (onomatopoeia_insert_flag_exist) {
              Signin.exist.onomatopoeia_array.push(movie.onomatopoeia__name);
            }

            resolve();
          })
          .catch(function(err) {
            console.log(err);
            Utility.show_error_alert('エラー発生', err, 'OK');
            reject();
          });
        }
      });
    };
  },


  /**
   * ローカルDBにジャンルが保存しているかに応じてクエリを変える
   * @param  {Object} movie - サーバから取得したBackUp1レコード
   * @return {Object}       - DBへ問い合わせをするpromiseのarray,
                              ジャンルのINSERTを行うかのフラグ,
                              オノマトペのINSERTを行うかのフラグ
   */
  create_genre_onomatopoeia_query: function(movie) {
    var genre_insert_flag = false;
    var onomatopoeia_insert_flag = false;
    var query = '';
    var promises = [];

    if (Signin.exist.genre_array.indexOf(movie.movie__genre__name) === -1) {
      genre_insert_flag = true;
      query = 'INSERT INTO genre(genre_id, name) VALUES(?,?)';
      promises.push(DB_method.single_statement_execute(query, [movie.movie__genre__genre_id, movie.movie__genre__name]));
    }else {
      genre_insert_flag = false;
      query = 'SELECT id from genre WHERE name = ?';
      promises.push(DB_method.single_statement_execute(query, [movie.movie__genre__name]));
    }

    // ローカルDBにオノマトペが保存しているかに応じてクエリを変える
    if (Signin.exist.onomatopoeia_array.indexOf(movie.onomatopoeia__name) === -1) {
      onomatopoeia_insert_flag = true;
      query = 'INSERT INTO onomatopoeia(name) VALUES(?)';
      promises.push(DB_method.single_statement_execute(query, [movie.onomatopoeia__name]));
    }else {
      onomatopoeia_insert_flag = false;
      query = 'SELECT id from onomatopoeia WHERE name = ?';
      promises.push(DB_method.single_statement_execute(query, [movie.onomatopoeia__name]));
    }

    return {'promises': promises, 'genre_flag': genre_insert_flag, 'onomatopoeia_flag': onomatopoeia_insert_flag};
  }
};





/************************************************************
                        movies.html
 ************************************************************/
/**
* moviesで使用する関数をまとめたオブジェクト
* @type {Object}
*/
var Movies = {

  //ローカルに保存されている映画の数を保存する
  movie_count:{count: 0},

  /**
   * 自動ログイン後に映画一覧画面の表示を行う
   * 1. サインイン
   * 2. サーバからローカルに保存されている映画情報の取得
   */
  run_draw_movie_content: function() {
    Movies.movie_count.count = 0;

    //ローカルへのDB問い合わせの結果を保存する共通変数
    var local_movies = {};

    //サインインに必要なパラメータの取得、ポストデータの整形
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var token = storage.getItem(ID.get_localStorage_ID().token);
    var sign_in_post_data = {
      "username": username,
      "token": token
    };

    var query = 'SELECT tmdb_id, title, overview FROM movie';

    var promises = [
      Utility.FiNote_API('sign_in_with_token', sign_in_post_data, 'POST', 'v1'),
      DB_method.single_statement_execute(query, [])
    ];

    Promise.all(promises)
    .then(function(results){
      Movies.movie_count.count = results[1].rows.length;

      //映画を登録していない場合は、空リストをreturnする(サーバが返すのと同じ)
      if(Movies.movie_count.count === 0) {
        return '[]';
      }

      local_movies = results[1];

      //サーバへPOSTする文字列を生成
      var local_tmdb_id_list_str = '[';
      for(var i = 0; i < results[1].rows.length; i++) {
        local_tmdb_id_list_str += results[1].rows.item(i).tmdb_id + ',';
      }
      local_tmdb_id_list_str = local_tmdb_id_list_str.substr(0, local_tmdb_id_list_str.length-1);
      local_tmdb_id_list_str += ']';

      var post_data = {"tmdb_id_list": local_tmdb_id_list_str};

      return Utility.FiNote_API('get_movie_by_id', post_data, 'POST', 'v1');
    })
    .then(function(movie_info_results) {
      var movie_info_results_json = JSON.parse(movie_info_results);
      var loaded_count = 0;
      var sql_and_data_list = [];
      var base64_obj_list = [];

      //映画を登録していない場合は、映画一覧表示へ即座に遷移
      //登録している場合は、ローカルデータの更新処理を実行
      if(Movies.movie_count.count === 0) {
        Utility.check_page_init(ID.get_movies_ID().page_id,Movies.draw_no_data_message);
        Utility.push_page(ID.get_tab_ID().tmp_id,'fade',0, '');
			}else {
        for(var i = 0; i < local_movies.rows.length; i++ ){
        var local_movie = local_movies.rows.item(i);
        var sql_base = 'UPDATE movie SET poster = ?,';
        var sql_data = {};

        //該当するtmdb_idを持つオブジェクトを抽出
        var movie_info_result = movie_info_results_json.filter(function(item){
          if (Object.keys(item)[0] === String(local_movie.tmdb_id)) return true;
        });

        //タイトルの判定と追加
        if(local_movie.title !== movie_info_result[0][local_movie.tmdb_id].title) {
          sql_base += 'title = ?,';
          sql_data['title'] = movie_info_result[0][local_movie.tmdb_id].title;
        }

        //概要文の判定と追加
        if(local_movie.overview !== movie_info_result[0][local_movie.tmdb_id].overview) {
          sql_base += 'overview = ?,';
          sql_data['overview'] = movie_info_result[0][local_movie.tmdb_id].overview;
        }

        sql_data['tmdb_id'] = local_movie.tmdb_id;

        //最後のカンマを削除、条件の追加
        sql_base = sql_base.substr(0, sql_base.length-1);
        sql_base += ' WHERE tmdb_id = ?';

        sql_and_data_list.push({"sql": sql_base, "data": sql_data});

        // ポスターの取得
        var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
        var image = new Image();
        image.src = base_url + movie_info_result[0][local_movie.tmdb_id].poster_path;
        image.onload = (function(image, i){
          return function(){
            base64_obj_list.push({"promise": Utility.image_to_base64(image, 'image/jpeg'), "i": i});
            loaded_count += 1;

            if(loaded_count === local_movies.rows.length) {
						  Movies.local_movies_update_and_draw_movies(base64_obj_list, sql_and_data_list);
            }
           }
       })(image, i);
      }
      }

    })
    .catch(function(err) {
      //ログインエラー or レコード件数取得エラー
      console.log(err);
    });
  },


	/**
   * サーバ内の映画タイトル、概要が異なった際に更新を行う。ポスターは必ず更新する。
   * 更新処理後に映画一覧画面へ遷移する。
	 * @param {Array} base64_obj_list   - base64のpromiseとソート用の添え字の連想配列を格納した1次元配列
	 * @param {Array} sql_and_data_list - sql文と更新するデータの連想配列を格納した1次元配列
	 */
  local_movies_update_and_draw_movies: function (base64_obj_list, sql_and_data_list) {
    //画像の読み込み完了順になっているので、
    //映画の順番に並び替え後、promiseを抽出した配列を作成
    Utility.ObjArraySort(base64_obj_list, 'i');
    var base64_promises = [];
    base64_obj_list.forEach(function(obj) {
      base64_promises.push(obj['promise'])
    });

    Promise.all(base64_promises)
    .then(function(base64_list) {
      var promises = [];

      sql_and_data_list.forEach(function(obj, index) {
        var sql;
        var sql_data = [];

        sql = obj['sql'];
        sql_data.push(base64_list[index]);

        //title,overview,tmdb_idの取り出し
        Object.keys(obj['data']).forEach(function(key) {
          sql_data.push(obj['data'][key]);
        });

        promises.push(DB_method.single_statement_execute(sql, sql_data));
      });

      return Promise.all(promises);
    })
    .then(function() {
    var draw_content = function(){};

    //ローカルに保存されている映画情報の件数で表示内容を変える
    if (Movies.movie_count.count === 0) {
      draw_content = Movies.draw_no_data_message;
    }else {
      Global_variable.movie_update_flag = true;
      draw_content = Movies.update_movies;
    }
      Utility.check_page_init(ID.get_movies_ID().page_id,draw_content);
    })
    .then(function() {
      Utility.push_page(ID.get_tab_ID().tmp_id,'fade',0, '');
    });

    console.log('********* All image load Done *************');
  },


  /**
   * 映画一覧画面の表示を行う
   */
  update_movies: function() {
    // 映画の一覧画面内にあるinputをタップした際にキーボードのアクセサリを隠すため
    Utility.hideKeyboardAccessoryBar(true);

    if (Global_variable.movie_update_flag) {
      Global_variable.movie_update_flag = false;

      // リストのコンテンツと映画データなしのメッセージを初期化
      var movie_collection_list = document.getElementById(ID.get_movies_ID().list);
      var no_data_message = document.getElementById(ID.get_movies_ID().nodata_message_p);
      movie_collection_list.innerHTML = '';
      no_data_message.innerHTML = '';

      return new Promise(function(resolve,reject) {
        var result = [];
        var db = Utility.get_database();
        db.readTransaction(function(tx) {
          tx.executeSql('SELECT * FROM movie ORDER BY id DESC', [], function(tx, resultSet) {
            result.push(resultSet);

            tx.executeSql('SELECT * FROM genre', [], function(tx, resultSet) {
              result.push(resultSet);

              tx.executeSql('SELECT * FROM onomatopoeia', [], function(tx, resultSet) {
                result.push(resultSet);
              },
              function(tx, error) {
                console.log('SELECT error: ' + error.message);
                reject(error.message);
              });
            });
          });
        },
        function(error) {
          console.log('transaction error: ' + error.message);
          reject(error.message);
        },
        function() {
          resolve(result);
        });
      })
      .then(function(result) {
        Movies.draw_movies_list(result);
      });
    }
  },


  /**
   * 受け取ったデータベースの検索結果からリストを描画する関数
   * @param  {Array} result - 各テーブルの検索結果を格納した配列
   */
  draw_movies_list: function(result) {
    return new Promise(function(resolve) {
      DB_method.count_record('movie').then(function(movie_count_result) {
        //result[0]：movie
        //result[1]：genre
        //result[2]：onomatopoeia

        var movie_collection_list = document.getElementById(ID.get_movies_ID().list);
        var movie_count = result[0].rows.length;

        var lists_html = '';
        for(var i = 0; i < movie_count; i++) {
          var movie_record = result[0].rows.item(i);
          var button_class = {dvd:'', fav:''};

          if (movie_record.dvd === 1) {
            button_class.dvd = 'brown_color';
          }else {
            button_class.dvd = 'gray_color';
          }

          if (movie_record.fav === 1) {
            button_class.fav = 'brown_color';
          }else {
            button_class.fav = 'gray_color';
          }

          var onomatopoeia_id_list = movie_record.onomatopoeia_id.split(',');
          var onomatopoeia_name_list = [];
          var onomatopoeia_names = '';
          for(var j = 0; j < result[2].rows.length; j++) {
            var onomatopoeia = result[2].rows.item(j);
            if (onomatopoeia_id_list.indexOf(String(onomatopoeia.id)) !== -1) {
              onomatopoeia_name_list.push(onomatopoeia.name);
            }
          }

          onomatopoeia_names = onomatopoeia_name_list.join('、');

          var add_month = ('00' + movie_record.add_month).slice(-2);
          var add_day = ('00' + movie_record.add_day).slice(-2);
            lists_html += '<ons-list-item modifier="longdivider">' +
                          '<div class="left">' +
                          '<img class="list_img" src="' + movie_record.poster + '">' +
                          '</div>' +

                          '<div class="center">' +
                          '<span class="list-item__title list_title">' +
                          movie_record.title +
                          '</span>' +
                          '<span class="list-item__subtitle list_sub_title">' +
                          onomatopoeia_names +
                          '</span>' +
                          '<span class="list-item__subtitle list_sub_title_small">' +
                          '追加日:' +
                          movie_record.add_year + '-' +
                          add_month + '-' +
                          add_day +
                          '</span>' +
                          '</div>' +

                          '<div class="right">' +
                          '<ons-row class="list_button_row">' +
                          '<ons-col>' +
                          '<ons-button class="' + button_class.dvd + '" id="dvd_' + movie_record.id + '" onClick="Movies.tap_dvd_fav(this.id,0)" modifier="quiet">' +
                          '<ons-icon icon="ion-disc" size="20px"></ons-icon>' +
                          '</ons-button>' +
                          '</ons-col>' +

                          '<ons-col>' +
                          '<ons-button class="' + button_class.fav + '" id="fav_' + movie_record.id + '" onClick="Movies.tap_dvd_fav(this.id,1)" modifier="quiet">' +
                          '<ons-icon size="20px" icon="ion-android-favorite"></ons-icon>' +
                          '</ons-button>' +
                          '</ons-col>' +

                          '<ons-col>' +
                          '<ons-button class="brown_bg_color_quiet" id=' + movie_record.id + ' onClick="Movies_detail.show_contents(this.id)" modifier="quiet">' +
                          '<ons-icon size="20px" icon="ion-more"></ons-icon>' +
                          '</ons-button>' +
                          '</ons-col>' +
                          '</ons-row>' +
                          '</div>' +
                          '</ons-list-item>';
        }

        // 映画の検索結果の件数が0の場合は、メッセージの表示とリスト表示エリアの初期化をする
        if (movie_count === 0) {
          movie_collection_list.innerHTML = '';
          Movies.draw_no_data_message();
        }else {
          movie_collection_list.innerHTML = '<ons-list>' + 
                                            '<ons-list-header id="movies_list_header">全て</ons-list-header>' + 
                                            lists_html + 
                                            '</ons-list>';
        }

        var search_area = document.getElementById(ID.get_movies_ID().search_area);
        if (movie_count_result === 0) {
          search_area.style.display = 'none';
        }else {
          search_area.style.display = 'inline-block';
        }
        resolve();
      });
    });
  },


  /**
   * 追加済みの映画がないメッセージを表示する関数
   */
  draw_no_data_message: function() {
    nodata_message_p.innerHTML = '追加済みの映画はありません';
  },


  /**
   * moviesのDVDやFAVボタンを押した際にデータベースとサーバのバックアップの値を更新する関数
   * @param  {string} id - dvd or fav + タップした映画のprimary key
   * @param  {number} flag    - 0:DVD, 1:FAV
   */
  tap_dvd_fav: function(id,flag) {
    Utility.show_spinner(ID.get_movies_ID().page_id);

    var button = document.getElementById(id);
    button.setAttribute('disabled', 'disabled');

    var pk = Number(id.substring(id.indexOf('_')+1,id.length));

    /*** タップしたボタンに該当する項目の更新をする ***/
    var query = 'SELECT dvd,fav,tmdb_id FROM movie WHERE id = ?';
    DB_method.single_statement_execute(query,[pk]).then(function(result) {
      var query_obj = {query:'', data:[]};
      var dvd_status = result.rows.item(0).dvd;
      var fav_status = result.rows.item(0).fav;

      if (flag === 0) {
        query_obj.query = 'UPDATE movie SET dvd = ? WHERE id = ?';

        if (result.rows.item(0).dvd === 0) {
          query_obj.data = [1,pk];
          dvd_status = 1;
        }else {
          query_obj.data = [0,pk];
          dvd_status = 0;
        }
      }else {
        query_obj.query = 'UPDATE movie SET fav = ? WHERE id = ?';

        if (result.rows.item(0).fav === 0) {
          query_obj.data = [1,pk];
          fav_status = 1;
        }else {
          query_obj.data = [0,pk];
          fav_status = 0;
        }
      }

      var storage = window.localStorage;
      var username = storage.getItem(ID.get_localStorage_ID().username);
      var request_data = {
        "username": username,
        "movie_id": result.rows.item(0).tmdb_id,
        "dvd": dvd_status,
        "fav": fav_status
      };

      return [
          DB_method.single_statement_execute(query_obj.query, query_obj.data),
          Utility.FiNote_API('update_status', request_data, 'POST', 'v1')
      ];
    }).then(function(promises) {
      Promise.all(promises).then(function () {
        /*** 更新後にボタンの色を変更する ***/
        var lead_id = '';
        var class_name = 'brown_color';

        if (flag === 0) {
          lead_id = 'dvd';
        }else {
          lead_id = 'fav';
        }

        var element = document.getElementById(lead_id + '_' + pk);
        var has_class = element.classList.contains('gray_color');

        if (has_class) {
          element.classList.remove('gray_color');
          element.classList.add(class_name);
        }else {
          element.classList.remove(class_name);
          element.classList.add('gray_color');
        }

        Utility.stop_spinner();
        button.removeAttribute('disabled');
      });
    })
    .catch(function(err) {
      console.log(err);
      Utility.show_error_alert('更新エラー','更新時にエラーが発生しました','OK');
      Utility.stop_spinner();
      button.removeAttribute('disabled');
    });
  },


  /**
   * 検索フォームに文字が入力されるたびに、リセットボタンを表示・非表示にするかを決定するイベントを追加する
   * @param {string} event_name - focus or blur
   */
  set_event_movies_search_input: function(event_name) {
    if (event_name === 'focus') {
      document.getElementById(ID.get_movies_ID().search_input).addEventListener('input', Movies.show_hide_reset_button, false);

    } else if (event_name === 'blur') {
      document.getElementById(ID.get_movies_ID().search_input).removeEventListener('input', Movies.show_hide_reset_button, false);
    }
  },


  /**
   * 検索ボタンをタップした際に動作する関数。
   * 検索フォームに入力された文字からカタカナバージョンとひらがなバージョンのテキストを生成し、
   * 計3パターンで映画タイトルとオノマトペから検索を行い、リスト描画関数へ結果を渡す。
   */
  click_done: function() {
    // スピナー表示、フォーカス外し、リストの初期化
    Utility.show_spinner(ID.get_movies_ID().page_id);
    document.getElementById(ID.get_movies_ID().search_input).blur();
    document.getElementById(ID.get_movies_ID().list).innerHTML = '';

    // オリジナルテキストの取得、テキストの変換
    var origin_text = document.getElementById(ID.get_movies_ID().search_input).value;
    var converted_katakana_text = Utility.hiraganaToKatagana(origin_text);
    var converted_hiragara_text = Utility.katakanaToHiragana(origin_text);

    // オノマトペに入力された文字が含まれているかを検索
    var onomatopoeia_query = "SELECT id from onomatopoeia WHERE name LIKE '%" + origin_text + "%' OR name LIKE '%" + converted_katakana_text + "%' OR name LIKE '%" + converted_hiragara_text + "%'";

    return DB_method.single_statement_execute(onomatopoeia_query, []).then(function(onomatopoeia_result) {
      // 検索結果のidからORで繋いだSQL文を生成
      var onomatopoeia_OR_query = "";
      for(var i = 0; i < onomatopoeia_result.rows.length; i++) {
        onomatopoeia_OR_query += " OR onomatopoeia_id LIKE '%" + onomatopoeia_result.rows.item(i).id + "%' ";
      }

      // movieテーブルを検索するSQL文を生成
      var select_query = "SELECT * FROM movie " +
                         "WHERE title LIKE '%" + origin_text + "%' OR title LIKE '%" + converted_katakana_text + "%' OR title LIKE '%" + converted_hiragara_text + "%'"+
                         onomatopoeia_OR_query+
                         "ORDER BY id DESC";

      return new Promise(function(resolve,reject) {
        var result = [];
        var db = Utility.get_database();
        db.readTransaction(function(tx) {
          tx.executeSql(select_query, [], function(tx, resultSet) {
            result.push(resultSet);

            tx.executeSql('SELECT * FROM genre', [], function(tx, resultSet) {
              result.push(resultSet);

              tx.executeSql('SELECT * FROM onomatopoeia', [], function(tx, resultSet) {
                result.push(resultSet);
              },
              function(tx, error) {
                console.log('SELECT error: ' + error.message);
                reject(error.message);
              });
            });
          });
        },
        function(error) {
          console.log('transaction error: ' + error.message);
          reject(error.message);
          Utility.stop_spinner();
        },
        function() {
          resolve(result);
        });
      })
      .then(function(result) {
        // 結果を描画関数に渡してリストを描画、その後に上書き
        Movies.draw_movies_list(result).then(function() {
          // データなし、リストヘッダーの表示文字を上書き
          if (result[0].rows.length === 0) {
            var no_data_message = document.getElementById(ID.get_movies_ID().nodata_message_p);
            no_data_message.innerHTML = '結果が見つかりませんでした';
          }else {
            var list_header = document.getElementById(ID.get_movies_ID().list_header);
            list_header.innerHTML = '「' + origin_text + '」の検索結果';
          }
          
          Utility.stop_spinner();
        });
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
      });
    });
  },

  
  /**
   * 検索フォームに入力されている文字数を監視して、リセットボタンの表示・非表示を切り替える
   */
  show_hide_reset_button: function() {
    var text = document.getElementById(ID.get_movies_ID().search_input).value;
    var reset_button = document.getElementById(ID.get_movies_ID().reset_button);

    if (text.length > 0) {
      reset_button.style.visibility = 'visible';
    }else {
      reset_button.style.visibility = 'hidden';
    }
  },


  /**
   * 検索フォームのバツボタン(リセットボタン)をタップした際に、
   * フォーム値のリセットと映画を全表示する関数
   */
  tap_reset_button: function() {
    Utility.show_spinner(ID.get_movies_ID().page_id);
    document.getElementById(ID.get_movies_ID().list).innerHTML = '';
    document.getElementById(ID.get_movies_ID().search_input).value = '';

    var reset_button = document.getElementById(ID.get_movies_ID().reset_button);
    reset_button.style.visibility = 'hidden';

    Global_variable.movie_update_flag = true;
    Movies.update_movies();
    Utility.stop_spinner();
  }
};





/************************************************************
                        movie_detail.html
 ************************************************************/
var Movies_detail = {
  current_movie: {movie_record: {}, feeling_list: []},

  /**
   * moviesのinfoボタンを押した際に詳細画面へと遷移させる
   * @param  {number} id - タップした映画のprimary key
   */
  show_contents: function(id) {
    var query = 'SELECT * from movie WHERE id = ?';
    return DB_method.single_statement_execute(query,[id])
    .then(function(result_movie) {
      query = 'SELECT * from onomatopoeia';

      return DB_method.single_statement_execute(query,[])
      .then(function(result_onomatopoeia) {
        var movie_record = result_movie.rows.item(0);
        Movies_detail.current_movie.movie_record = {};
        Movies_detail.current_movie.movie_record = movie_record;
        var callback = Movies_detail.create_show_contents_callback(movie_record, result_onomatopoeia);

        Utility.check_page_init(ID.get_movies_detail_ID().page_id, callback);
        Utility.push_page(ID.get_movies_detail_ID().tmp_id, '', 0, '');
      });
    });
  },


  /**
   * 詳細画面の初期化が完了した後に描画を実行するコールバック関数を作成する
   * @param  {Object} movie_record        - ローカルに保存されているタップされた映画オブジェクト
   * @param  {Object} result_onomatopoeia - ローカルに保存されているオノマトペオブジェクト
   * @return {Function}                   - 描画を行うコールバック関数
   */
  create_show_contents_callback: function(movie_record, result_onomatopoeia) {
    // 画面に表示するオノマトペのテキストを生成する
    var onomatopoeia_text = '';
    var onomatopoeia_name_list = [];
    var onomatopoeia_id_list = movie_record.onomatopoeia_id.split(',');

    for (var i = 0; i < result_onomatopoeia.rows.length; i++) {
      var onomatopoeia_obj = result_onomatopoeia.rows.item(i);
      if (onomatopoeia_id_list.indexOf(String(onomatopoeia_obj.id)) !== -1) {
        onomatopoeia_name_list.push(onomatopoeia_obj.name);
      }
    }

    Movies_detail.current_movie.feeling_list = [];
    Movies_detail.current_movie.feeling_list = onomatopoeia_name_list;

    onomatopoeia_text = onomatopoeia_name_list.join('、');

    // 画面に表示する概要と指定するクラスを決定
    var overview = movie_record.overview;
    var class_name = 'small_overview';
    if (movie_record.overview === null || movie_record.overview === '') {
      overview = '詳細データなし';
      class_name = 'small_overview_opacity';
    }

    /* DVDの所持とお気に入りの登録状況に応じて、以下の2点を変える
     * ・表示するテキスト
     * ・ステータス画面の描画に使用するフラグ
    */
    var dvd = 'No';
    var fav = 'No';
    if (movie_record.dvd === 1) {
      Movieadd.userdata.dvd = true;
      dvd = 'Yes';
    }else {
      Movieadd.userdata.dvd = false;
    }

    if (movie_record.fav === 1) {
      Movieadd.userdata.fav = true;
      fav = 'Yes';
    }else {
      Movieadd.userdata.fav = false;
    }

		return function () {
			document.getElementById(ID.get_movies_detail_ID().poster).innerHTML =
				'<img onClick="Movies_detail.tap_img(this)" class="poster" src="' + movie_record.poster + '">';

			document.getElementById(ID.get_movies_detail_ID().detail).innerHTML =
				'<ons-list modifier="inset">' +
				'<ons-list-header>ステータス</ons-list-header>' +
				'<ons-list-item onClick="Movies_detail.push_page_feeling(\'' + onomatopoeia_text + '\')" modifier="chevron" tappable>' +
				onomatopoeia_text +
				'</ons-list-item>' +

				'<ons-list-item onClick="Movies_detail.push_page_status()" modifier="chevron" tappable>' +
				'<ons-icon icon="ion-disc" class="list-item__icon brown_bg_color_quiet"></ons-icon>' +
				dvd +
				'<ons-icon icon="ion-android-favorite" class="list-item__icon brown_bg_color_quiet"></ons-icon>' +
				fav +
				'</ons-list-item>' +
				'</ons-list>' +

				'<ons-list modifier="inset">' +
				'<ons-list-header>映画情報</ons-list-header>' +
				'<ons-list-item>' +
				movie_record.title +
				'</ons-list-item>' +

				'<ons-list-item class="' + class_name + '">' +
				overview +
				'</ons-list-item>' +

				'<ons-list-item class="small_overview">' +
				'追加日: ' + movie_record.add_year + '-' + ('00' + movie_record.add_month).slice(-2) + '-' + ('00' + movie_record.add_day).slice(-2) +
				'</ons-list-item>' +
				'</ons-list>' +

				'<ons-list modifier="inset">' +
				'<ons-list-header>SNS</ons-list-header>' +
				'<ons-list-item tappable onClick="Movies_detail.sns_share()">' +
				'<ons-icon icon="ion-share" class="list-item__icon brown_bg_color_quiet"></ons-icon>' +
				'この映画をシェアする' +
				'</ons-list-item>' +
				'</ons-list>' +

				'<ons-button onClick="Movies_detail.tap_delete_button()" class="delete_button" modifier="large">' +
				'削除' +
				'</ons-button>';
		};
  },


  /**
   * 既に登録されている気分を読み込んだ気分リストを表示させる
   * @param  {[String]} onomatopoeia_text [画面表示用になっているオノマトペのテキスト]
   */
  push_page_feeling: function(onomatopoeia_text) {
      Movieadd.userdata.feeling_name_list = onomatopoeia_text.split('、');

    var callback = function() {
      // 詳細画面から表示した気分リストであることを登録
      Global_variable.feeling_flag = 1;

      // 映画追加画面と同様に気分リストを描画する
      Feeling.show_contents();
    };
    Utility.check_page_init(ID.get_feeling_ID().page_id, callback);
    Utility.push_page(ID.get_feeling_ID().tmp_id, 'slide', 0, '');
  },


  /**
   * 詳細画面からステータス画面への遷移を行う関数
   */
  push_page_status: function() {
    var callback = function() {
      // 詳細画面からの遷移であることを登録
      Global_variable.status_flag = 1;

      Movieadd_status.show_contents();
    };
    Utility.check_page_init(ID.get_movieadd_status_ID().page_id, callback);
    Utility.push_page(ID.get_movieadd_status_ID().tmp_id, 'slide', 0, '');
  },


  /**
   * Twitter、Facebook、LINE等のSNSにシェアするための関数
   */
  sns_share: function() {
    var options = {
      message: '「' + Movies_detail.current_movie.movie_record.title + '」' + '\n' + Movies_detail.current_movie.feeling_list + '\n' + '#FiNote',
      subject: '',
      files: ['', ''],
      url: 'https://www.themoviedb.org/movie/' + String(Movies_detail.current_movie.movie_record.tmdb_id),
      chooserTitle: 'Pick an app'
    };

    var onSuccess = function(result) {
      if (result.completed === true && result.app !== 'com.apple.UIKit.activity.PostToFacebook') {
        document.getElementById(ID.get_movies_detail_ID().alert).show();
      }
    };

    var onError = function(msg) {
      Utility.show_error_alert('投稿エラー',msg,'OK');
    };

    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  },


  /**
   * SNSの投稿が完了した後に表示されるアラートを閉じるボタンが押された時に動作する
   */
  sns_alert_hide: function() {
    document.getElementById(ID.get_movies_detail_ID().alert).hide();
  },


  /**
   * 詳細画面の映画ポスター部分がタップされた際に、表示中のポスターをモーダルで表示する関数
   * @param  {Object} poster_img - img要素
   */
  tap_img: function(poster_img) {
    var src = poster_img.getAttribute('src');
    var modal_poster = document.getElementById(ID.get_movies_detail_ID().modal_poster);
    modal_poster.setAttribute('src', src);    
    
    var modal = document.getElementById(ID.get_movies_detail_ID().modal);
    modal.show();
  },


  /**
   * モーダルを閉じる関数
   */
  hide_modal: function() {
    var modal = document.getElementById(ID.get_movies_detail_ID().modal);
    modal.hide();
  },


  /**
   * 詳細画面から表示させた気分リストの戻るボタンをタップした際に、
   * 気分リストの変更をローカル・サーバ・詳細画面へ反映させる関数
   */
  tap_feeling_back_button: function() {
    Global_variable.movie_update_flag = true;
    
    document.addEventListener('postpop', function(event) {
      if (event.enterPage.pushedOptions.page === ID.get_movies_detail_ID().tmp_id) {
        Utility.show_spinner(ID.get_movies_detail_ID().page_id);

        // 編集済みの気分リスト
        var feeling_name_list = Movieadd.userdata.feeling_name_list;

        var movie = Movies_detail.current_movie.movie_record;

        var promises = [];
        if (feeling_name_list.length === 0) {
          promises = [Movieadd.set_onomatopoeia_local(feeling_name_list)];
        }else {
          var storage = window.localStorage;
          var username = storage.getItem(ID.get_localStorage_ID().username);

          var request_data = {
            "username": username,
            "movie_id": movie.tmdb_id,
            "onomatopoeia": feeling_name_list
          };
          promises = [Movieadd.set_onomatopoeia_local(feeling_name_list), Utility.FiNote_API('update_onomatopoeia', request_data, 'POST', 'v1')];
        }

        Promise.all(promises).then(function(results) {
          var insertID_list = results[0];
          var onomatopoeia_csv = '';
          //オノマトペIDのcsvを作成
          for(var i = 0; i < insertID_list.length; i++) {
            onomatopoeia_csv += insertID_list[i] + ',';
          }
          onomatopoeia_csv = onomatopoeia_csv.substr(0, onomatopoeia_csv.length-1);

          var query = 'UPDATE movie SET onomatopoeia_id = ? WHERE tmdb_id = ?';
          var query_data = [onomatopoeia_csv, movie.tmdb_id];

          return DB_method.single_statement_execute(query, query_data);
        })
        .then(function() {
          var query_movie = 'SELECT * from movie WHERE tmdb_id = ?';
          var query_onomatopoeia = 'SELECT * from onomatopoeia';

          promises = [
            DB_method.single_statement_execute(query_movie, [movie.tmdb_id]),
            DB_method.single_statement_execute(query_onomatopoeia, [])
          ];

          return promises;
        })
        .then(function(promises) {
          Promise.all(promises).then(function(results) {
            var movie_record = results[0].rows.item(0);
            var result_onomatopoeia = results[1];

            return new Promise(function(resolve) {
              var callback = Movies_detail.create_show_contents_callback(movie_record, result_onomatopoeia);
              callback();
              resolve('resolve');
            });
          })
          .then(function() {
            Utility.stop_spinner();
          });
        })
        .catch(function(err) {
          console.log(err);
          Utility.show_error_alert('エラー発生', err, 'OK');
        });
      }
      document.removeEventListener('postpop', arguments.callee);
    });
  },


  /**
   * 詳細画面から表示させたステータスの戻るボタンをタップした際に、
   * ステータスの変更をローカル・詳細画面へ反映させる関数
   */
  tap_status_back_button: function() {
    Global_variable.movie_update_flag = true;

    document.addEventListener('prepop', function(event) {
      if (event.enterPage.pushedOptions.page === ID.get_movies_detail_ID().tmp_id) {
        Utility.show_spinner(ID.get_movieadd_status_ID().page_id);

        //スイッチボタンの状態を保存する
        var dvd_switch_status = document.getElementById(ID.get_movieadd_status_ID().dvd).checked;
        var fav_switch_status = document.getElementById(ID.get_movieadd_status_ID().fav).checked;
        var dvd_status = 0;
        var fav_status = 0;
        if (dvd_switch_status === true) {
          Movieadd.userdata.dvd = true;
          dvd_status = 1;
        }else {
          Movieadd.userdata.dvd = false;
          dvd_status = 0;
        }

        if (fav_switch_status === true) {
          Movieadd.userdata.fav = true;
          fav_status = 1;
        }else {
          Movieadd.userdata.fav = false;
          fav_status = 0;
        }

        var movie_pk = Movies_detail.current_movie.movie_record.id;
        var query = 'UPDATE movie SET dvd = ?, fav = ? WHERE id = ?';

        var storage = window.localStorage;
        var username = storage.getItem(ID.get_localStorage_ID().username);
        var movie_tmdb_id = Movies_detail.current_movie.movie_record.tmdb_id;
        var request_data = {
          "username": username,
          "movie_id": movie_tmdb_id,
          "dvd": dvd_status,
          "fav": fav_status
        };

        var promises = [
          DB_method.single_statement_execute(query, [dvd_status, fav_status, movie_pk]),
          Utility.FiNote_API('update_status', request_data, 'POST', 'v1')
        ];

        Promise.all(promises).then(function() {
          var query_movie = 'SELECT * from movie WHERE id = ?';
          var query_onomatopoeia = 'SELECT * from onomatopoeia';

          return [
              DB_method.single_statement_execute(query_movie, [movie_pk]),
              DB_method.single_statement_execute(query_onomatopoeia, [])
          ];
        })
        .then(function(promises) {
          Promise.all(promises).then(function(results) {
            var movie_record = results[0].rows.item(0);
            var result_onomatopoeia = results[1];

            return new Promise(function(resolve) {
              var callback = Movies_detail.create_show_contents_callback(movie_record, result_onomatopoeia);
              callback();
              resolve('resolve');
            });
          })
          .then(function() {
            Utility.stop_spinner();
          });
        })
        .catch(function(err) {
          console.log(err);
          Utility.show_error_alert('エラー発生', err, 'OK');
        });
      }
      document.removeEventListener('prepop', arguments.callee);
    });
  },


  /**
   * 削除ボタンを押した際に動作
   * 削除の確認をさせるアラートの表示、削除、画面のpopと更新を行う
   */
  tap_delete_button: function() {
    var movie_pk = Movies_detail.current_movie.movie_record.id;
    var movie_tmdb_id = Movies_detail.current_movie.movie_record.tmdb_id;

    var func_after_deleted = function() {
      Utility.pop_page();
      Global_variable.movie_update_flag = true;
      Movies.update_movies();
    };

    var func_none = function() {};
    var func_delete = function() {
      Utility.show_spinner(ID.get_movies_detail_ID().page_id);

      var query = 'DELETE FROM movie WHERE id = ?';
      var storage = window.localStorage;
      var username = storage.getItem(ID.get_localStorage_ID().username);
      var request_data = {
        "username": username,
        "movie_id": movie_tmdb_id
      };
      
      var promises = [
        DB_method.single_statement_execute(query, [movie_pk]),
        Utility.FiNote_API('delete_backup', request_data, 'POST', 'v1')
      ];

      Promise.all(promises).then(function() {
        Utility.stop_spinner();
        Utility.show_confirm_alert('削除の完了', '映画の削除が完了しました', ['OK'], func_after_deleted, func_none);
      })
      .catch(function(err) {
        console.log(err);
        Utility.show_error_alert('エラー発生', '削除中にエラーが発生しました', 'OK');
      });
    };

    Utility.show_confirm_alert('映画の削除', 'この映画を削除します', ['キャンセル', '削除'], func_none, func_delete);
  }
};





/************************************************************
                    movieadd_search.html
 ************************************************************/
var Movieadd_search = {
  show_list_data: [],                         //listに表示中のデータを格納する

  //total:        合計検索結果の個数
  //now:          現在、取得した映画タイトルの個数
  //page_number:  リクエストするページネーション
  search: {total: 0, now: 0, page_number: 1},

  /**
   * Searchボタン(改行)を押した際に動作
   */
  click_done: function(){
    Movieadd_search.search.total = 0;
    Movieadd_search.search.now = 0;
    Movieadd_search.search.page_number = 1;

    Utility.hideKeyboardAccessoryBar(true);

    document.getElementById(ID.get_movieadd_search_ID().form).blur();
    Movieadd_search.get_search_movie_title_val();
  },


  /**
   * バツボタンをタップした際に動作
   */
  tap_reset: function(){
    //formのテキストを初期化、バツボタンの削除、検索結果なしメッセージの削除
    document.getElementById(ID.get_movieadd_search_ID().form).value = '';
    Movieadd_search.show_hide_reset_button();
    document.getElementById(ID.get_movieadd_search_ID().nodata_message).innerHTML = '';
    Movieadd_search.not_show_list();

    //テキスト未確定入力時にリセットボタンを押した時
    var element = document.activeElement;
    if (element.getAttribute('id') === ID.get_movieadd_search_ID().form) {
      document.getElementById(ID.get_movieadd_search_ID().form).blur();
      document.getElementById(ID.get_movieadd_search_ID().form).focus();

      //テキスト入力確定後にリセットボタンを押した時
    }else {
      document.getElementById(ID.get_movieadd_search_ID().form).focus();
    }
  },


  /**
   * 検索フォームにフォーカス時、フォーカスが外れた時のイベントを設定する
   * @param {string} event_name [focusまたはblurを受け取る]
   */
  set_event_movieadd_search_input: function(event_name) {
    if (event_name === 'focus') {
      document.getElementById(ID.get_movieadd_search_ID().form).addEventListener('input', Movieadd_search.show_hide_reset_button, false);

    } else if (event_name === 'blur') {
      document.getElementById(ID.get_movieadd_search_ID().form).removeEventListener('input', Movieadd_search.show_hide_reset_button, false);
    }
  },


  /**
   * 映画タイトルの検索フォームに入力されている文字数に応じて、
   * リセットボタンの表示・非表示を切り替える関数
   */
  show_hide_reset_button: function() {
    var text = document.getElementById(ID.get_movieadd_search_ID().form).value;
    var reset_button = document.getElementById(ID.get_movieadd_search_ID().reset);

    if (text.length > 0) {
      reset_button.style.visibility = 'visible';
    }else {
      reset_button.style.visibility = 'hidden';
    }
  },


  /**
   * 検索ボタンが押されたら入力したテキストでTMDB検索結果を描画する
   */
  get_search_movie_title_val: function(){
    var text = document.getElementById(ID.get_movieadd_search_ID().form).value;
    var no_match_message = document.getElementById(ID.get_movieadd_search_ID().nodata_message);
    no_match_message.innerHTML = '';

    if (text.length > 0) {
      Utility.show_spinner(ID.get_movieadd_search_ID().nodata_message);

      //日本語と英語のリクエスト、ローカルDBから記録した映画リストの取得
      var query = 'SELECT tmdb_id FROM movie';
      var promises = [
        Movieadd_search.create_request_movie_search_in_tmdb(text,'ja'),
        Movieadd_search.create_request_movie_search_in_tmdb(text,'en'),
        DB_method.single_statement_execute(query,[])
      ];

      Promise.all(promises).then(function(results) {
        //idだけの配列を作成
        var local_tmdb_id = [];
        for(var i = 0; i < results[2].rows.length; i++) {
            local_tmdb_id.push(results[2].rows.item(i).tmdb_id);
        }

        Utility.stop_spinner();

        //検索結果として表示するデータを生成する
        var list_data = Movieadd_search.create_list_data(results[0],results[1]);
        Movieadd_search.show_list_data = list_data;

        //データによって表示するコンテンツを動的に変える
        if (list_data.length === 0) {
          no_match_message.innerHTML = '検索結果なし' + Movieadd_search.get_original_title_search_link_dom(false);
          Movieadd_search.not_show_list();
        }else{
          no_match_message.innerHTML = '';
          var list_data_poster = Movieadd_search.get_poster(list_data);

          //サムネイル取得後にリストを表示する
          var movieadd_SearchList = document.getElementById(ID.get_movieadd_search_ID().list);
          var list_doc = '';

          for(i = 0; i < list_data.length; i++) {
            var movie_releasedate = '公開日：';
            var exist_message = '';
            var modifier = '';
            var tappable = '';

            // ローカルに保存済みの映画はチェックマークと追加済みのメッセージを表示
            var index = local_tmdb_id.indexOf(list_data[i].id);
            if (index === -1) {
              exist_message = '';
              modifier = 'longdivider chevron';
              tappable = 'tappable onClick="Movieadd_search.tap_list(this)"';
            }else {
              exist_message = '<div class="exist_message">'+
                              '<ons-icon icon="ion-ios-checkmark-outline"></ons-icon>'+
                              '</div>';
              modifier = 'longdivider';
              tappable = 'tappable onClick="Movieadd_search.exist_movie_list_alert_show()"';
            }

            //TMDBから取得したrelease_dateが空だった場合は情報なしを代入する
            var date = list_data[i].release_date;
            if (date.length === 0) {
              movie_releasedate += '情報なし';
            }else {
              movie_releasedate += list_data[i].release_date;
            }

            var title = Utility.get_movie_ja_title(list_data[i]);

            list_doc += '<ons-list>'+
                        '<ons-list-item id="' + i + '" modifier="' + modifier + '"' + ' ' + tappable + '>' +
                        '<div class="left">' +
                        '<img id="' + i + '_img" class="list_img_large" src="' + list_data_poster[i] + '">' +
                        '</div>' +

                        '<div class="center">' +
                        '<span class="list_title_bold">' + title + '</span>' +
                        '<span id="overview_' + i + '" class="list_sub_title_small">' + list_data[i].overview + '</span>' +
                        '<span class="list_sub_title_small">' + movie_releasedate + '</span>' +
                        '</div>' +
                        exist_message +
                        '</ons-list-item>'+'' +
                        '</ons-list>';
          }

          movieadd_SearchList.innerHTML = list_doc;

          movieadd_SearchList.innerHTML +=  Movieadd_search.get_original_title_search_link_dom(true);

          //overviewが長すぎて範囲内に収まらない場合に文字列をカットする処理
          for(i = 0; i < list_data.length; i++) {
            var flag = false;
            var span = document.getElementById('overview_'+i);
            var span_height = span.offsetHeight;
            var copy_overview = list_data[i].overview;

            while(span_height > 85 && copy_overview.length > 0) {
              flag = true;
              copy_overview = copy_overview.substr(0, copy_overview.length-5);
              document.getElementById('overview_'+i).innerHTML = copy_overview;
              span_height = document.getElementById('overview_'+i).offsetHeight;
            }

            if (flag) {
              document.getElementById('overview_' + i).innerHTML += '…';
            }
          }
        }
      }).catch(function(err) {
        console.log(err);
      });

    } else {
      no_match_message.innerHTML = '';
    }
  },


	/**
   * 原題でさらに検索というリンクのhtmlを返す
	 * @param   {boolean} flag  - trueならリストと同様に表示、falseならリンク文字のみ
	 * @returns {string}        - リンクのhtml
	 */
  get_original_title_search_link_dom: function (flag) {
    var class_name = '';
    if(flag) {
      class_name = 'center_link_block';
    }else {
      class_name = 'center_link';
    }
    return '<a id="'+ ID.get_movieadd_search_ID().first_search_link + '" href="javascript:void(0);" onclick="Movieadd_search.search_and_draw_results_title()" class="'+ class_name + '">検索結果が見つからない場合</a>';
  },


	/**
   * 検索フォームに入力されている映画タイトルでヤフー映画を検索して、結果を描画する関数
	 */
	search_and_draw_results_title: function () {
    Utility.show_spinner(ID.get_movieadd_search_ID().page_id);

    var text = document.getElementById(ID.get_movieadd_search_ID().form).value;
    var post_data = {
      "movie_title": text,
      "page_number": Movieadd_search.search.page_number
    };

    Utility.FiNote_API('get_search_movie_title_results', post_data, 'POST', 'v1')
    .then(function(search_results) {
      Utility.stop_spinner();

			var search_results_json = JSON.parse(search_results);
			var movie_title_id_results = search_results_json['results'];
			var total_results = search_results_json['total'];

			//共通変数に、検索結果のトータル数と現在の取得数を保存
			Movieadd_search.search.total = Number(total_results);
			Movieadd_search.search.now += movie_title_id_results.length;

			//ヤフー映画の検索結果の件数チェック
			if(movie_title_id_results.length === 0) {
			  Utility.show_error_alert('', '原題でさらに検索しましたが見つかりませんでした', 'OK');
      }else {


			  //APIで取得した映画名のリストを表示
        var list_html = '';
        for(var i = 0; i < movie_title_id_results.length; i++) {
          list_html += '<ons-list-item onclick="Movieadd_search.tap_more_search_result_list(this)" modifier="chevron" tappable data_id="' + movie_title_id_results[i].id + '">'+
                        '<div class="left">'+
                        '<ons-icon icon="ion-android-search" class="list-item__icon"></ons-icon>'+
                        '</div>'+
                        '<div class="center">'+
                        movie_title_id_results[i].title+
                        '</div>'+
                        '</ons-list-item>';
        }

        var movieadd_SearchList = document.getElementById(ID.get_movieadd_search_ID().list);
        var list_header_text = '可能性のある映画タイトル('+Movieadd_search.search.now+'/'+Movieadd_search.search.total+'件)';
        var first_search_link = document.getElementById(ID.get_movieadd_search_ID().first_search_link);
        var more_link = document.getElementById(ID.get_movieadd_search_ID().more_search_link);

        // 「映画が見つからない場合は」や「さらに表示」などのリンク要素があったら削除
        if(first_search_link !== null) {
          movieadd_SearchList.removeChild(first_search_link);
        }
        if(more_link !== null) {
          movieadd_SearchList.removeChild(more_link);
        }

        //初回の検索時は、リストヘッダーがないので書き込み。それ以降はinnerHTMLを更新する。
        if(Movieadd_search.search.page_number === 1) {
          movieadd_SearchList.innerHTML +=  '<ons-list>'+
                                          '<ons-list-header id="'+ID.get_movieadd_search_ID().search_result_list_header+'">'+ list_header_text +'</ons-list-header>'+
                                          list_html+
                                          '</ons-list>';
        }else {
          movieadd_SearchList.innerHTML +=  '<ons-list>'+
                                          list_html+
                                          '</ons-list>';
          document.getElementById(ID.get_movieadd_search_ID().search_result_list_header).innerHTML = list_header_text;
        }

        //現在表示中のリスト件数(取得した映画タイトル数)と合計ヒット数が異なる場合
        if(Movieadd_search.search.now !== Movieadd_search.search.total) {
          Movieadd_search.search.page_number += 1;
          movieadd_SearchList.innerHTML += '<a id="'+ ID.get_movieadd_search_ID().more_search_link + '" href="javascript:void(0);" onclick="Movieadd_search.search_and_draw_results_title()" class="center_link_block">さらに読み込む</a>';
        }
      }
		})
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
    });
	},


	/**
   * 追加で表示された検索結果のリストの要素をタップした際に、
   * ヤフー映画のサイトから原題を取得してTMDBで検索を実行する関数
	 * @param {object} list_obj - タップされたlist-itemの要素
	 */
  tap_more_search_result_list: function (list_obj) {
    Utility.show_spinner(ID.get_movieadd_search_ID().page_id);

    var post_data = {"id": list_obj.getAttribute('data_id')};

    Utility.FiNote_API('get_original_title', post_data, 'POST', 'v1')
    .then(function (original_title) {
      Utility.stop_spinner();

      var original_title_json = JSON.parse(original_title);

      if(original_title_json === '') {
        Utility.show_error_alert('', '結果が見つかりませんでした', 'OK');
      }else {
        //フォームに値をセットして再検索
        var form = document.getElementById(ID.get_movieadd_search_ID().form);
        form.value = original_title_json;
        Movieadd_search.get_search_movie_title_val();
      }

		})
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('エラー発生', err, 'OK');
    });

	},

  
  /**
   * 映画をタイトルで検索するリクエストを生成して実行する
   * @param  {string} movie_title   - 検索したい映画タイトル
   * @param  {string} language      - jaで日本語情報、enで英語情報
   * @return {string}               - 検索結果をjsonに変換したもの
   */
  create_request_movie_search_in_tmdb: function(movie_title, language){
    return new Promise(function(resolve) {
      var storage = window.localStorage;
      var adult = storage.getItem(ID.get_localStorage_ID().adult);

      var request = new XMLHttpRequest();
      var api_key = Utility.get_tmdb_apikey();
      var request_url = 'https://api.themoviedb.org/3/search/movie?query=' +movie_title +'&api_key=' + api_key + '&language=' +language + '&include_adult=' + adult;

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
   * @param  {Array} ja_results_json - jaリクエストの配列
   * @param  {Array} en_results_json - enリクエストの配列
   * @return {Array}                 - jaとen検索結果をまとめた配列
   */
  create_list_data: function(ja_results_json,en_results_json){
    if (ja_results_json.length === 0 && en_results_json.length === 0) {
      return [];
    }else{
      var list_data = [];                     //overviewが空文字でないオブジェクトを格納する
      var overview_nodata = [];               //overviewが空文字のオブジェクトのidプロパティを格納する

      var ja_results = ja_results_json.results;
      var en_results = en_results_json.results;

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

          if (nodata_id === en_id) {
            list_data.push(en_results[k]);
          }
        }
      }

      return list_data;
    }
  },


  /**
   * サムネイルとして表示する画像を取得する
   * @param  {Array} list_data - 映画オブジェクトの配列
   * @return {string}          - 画像のパス
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
    var movieadd_search_list = document.getElementById(ID.get_movieadd_search_ID().list);
    movieadd_search_list.innerHTML = '';
  },


  /**
   * リストをタップした際に動作する
   * @param  {Object} obj - タップしたオブジェクト
   */
  tap_list: function(obj){
    var list_data = Movieadd_search.show_list_data;
    var tap_id = obj.id;

    //movieaddの画面初期化後に動作する関数を定義
    var callback = function(){
      Movieadd.show_contents(list_data,tap_id);
    };
    Utility.check_page_init(ID.get_moveadd_ID().page_id,callback);

    Movieadd.current_movie = list_data[tap_id];

    //映画追加画面へ遷移
    Utility.push_page(ID.get_moveadd_ID().tmp_id, '', 0,'');
  },

  exist_movie_list_alert_hide: function() {
    document.getElementById(ID.get_movieadd_search_ID().exist_alert).hide();
  },

  exist_movie_list_alert_show: function() {
    document.getElementById(ID.get_movieadd_search_ID().exist_alert).show();
  }
};





/************************************************************
                        movieadd.html
 ************************************************************/
var Movieadd = {
  userdata: {feeling_name_list: [], dvd: false, fav: false},
  current_movie: {},


  /**
   * [映画追加画面のコンテンツを表示する]
   * @param  {Array} list_data  - 検索結果の映画オブジェクトが格納された配列
   * @param  {number} tap_id    - 映画検索画面のリストのうちタップされたリスト番号
   */
  show_contents: function(list_data,tap_id){

    //映画のユーザデータを初期化する
    Movieadd.userdata.feeling_name_list = [];
    Movieadd.userdata.dvd = false;
    Movieadd.userdata.fav = false;

    //card部分に表示する画像を取得して表示
    var card = document.getElementById(ID.get_moveadd_ID().poster);
    var tap_list_obj = document.getElementById(tap_id+'_img');
    var img_url = tap_list_obj.getAttribute('src');

    card.style.backgroundImage = 'url(' + img_url + ')';

    //noimageとサムネイルでサイズ設定を変える
    if (img_url.indexOf('noimage.png') !== -1) {
      card.style.backgroundSize = 'contain';
    }else {
      card.style.backgroundSize = 'cover';
    }

    //card部分や吹き出しタップ時に表示する情報の取得と追加
    var title = list_data[tap_id].title;
    var overview = list_data[tap_id].overview;
    var release_date = list_data[tap_id].release_date;
    var rating_html = '<div class="rating">'+
                      '<div class="rating-num">'+
                      Movieadd.show_vote_average(list_data[tap_id].vote_average)+
                      '</div></div>';
    
    card.innerHTML = '<div class="modal card_modal_prev" id="'+ID.get_moveadd_ID().detail_info+'"><div class="modal__content"><p>'+ title +'</p><p>'+ overview +'</p><p>'+ release_date +'</p>' + rating_html + '</div></div>';

    //overviewが長すぎて範囲内に収まらない場合に文字列をカットする処理を開始
    var flag = false;
    var copy_overview = overview;
    var info = document.getElementById(ID.get_moveadd_ID().detail_info);
    var info_clone = info.cloneNode(true);
    info_clone.innerHTML = '<div class="modal__content"><p>'+ title +'</p><p>'+ copy_overview +'</p><p>'+ release_date +'</p>' + rating_html + '</div></div>';
    card.appendChild(info_clone);

    // 高さがポスター表示領域の高さ付近になるまで文字列をカットする
    while((copy_overview.length > 0) && (info_clone.clientHeight > card.clientHeight)) {
      flag = true;
      copy_overview = copy_overview.substr(0, copy_overview.length-100);
      info_clone.innerHTML = '<div class="modal__content"><p>'+ title +'</p><p>'+ copy_overview +'</p><p>'+ release_date +'</p>' + rating_html + '</div></div>';
    }

    // 文字列カットの処理を実行していたら3点リーダを追加
    if (flag) {
      copy_overview = copy_overview + '...';
    }

    // カット後の文字列でhtmlを上書きする
    card.innerHTML = '<div class="modal card_modal" id="'+ID.get_moveadd_ID().detail_info+'"><div class="modal__content"><p>'+ title +'</p><p>'+ copy_overview +'</p><p>'+ release_date +'</p>' + rating_html + '</div></div>';
  },


  /**
   * 映画追加画面上部のツールバーにあるバックボタンをタップした際にpopPageを行う
   */
  tap_backbutton: function(){
    document.getElementById(ID.get_utility_ID().navigator).popPage();
  },


  /**
   * card部分や吹き出しタップ時にアニメーション表示を行う
   */
  fadeTo_detail_info: function(){
    var movie_detail_info = document.getElementById(ID.get_moveadd_ID().detail_info);
    movie_detail_info.style.transition = 'opacity 0.5s';

    if (movie_detail_info.style.opacity === '1') {
      movie_detail_info.style.opacity = '0';
    }else {
      movie_detail_info.style.opacity = '1';
    }
  },


  /**
   * 映画のレーティングを最大評価5に合うように計算して表示する
   * @param  {number} vote_average - 最大評価10.0の評価値
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
    var few = Number(String(result).split(".")[1]);

    //星と数値を書き込む
    var innerHTML_string = '';
    var few_write = false;
    for(var i = 0; i < 5; i++){
      if (i < integer) {
        innerHTML_string += '<ons-icon icon="ion-ios-star" fixed-width="false"></ons-icon>';
      }else if (few === 5 && few_write === false) {
        innerHTML_string += '<ons-icon icon="ion-ios-star-half" fixed-width="false"></ons-icon>';
        few_write = true;
      }else{
        innerHTML_string += '<ons-icon icon="ion-ios-star-outline" fixed-width="false"></ons-icon>';
      }
    }

    innerHTML_string += result;

    return innerHTML_string;
  },


  /**
   * 映画追加ボタンを押したらローカルDBへ保存する
   */
  add_movie: function(){
    var userdata = Movieadd.userdata;
    document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '';

    if (userdata.feeling_name_list.length === 0) {
      ons.notification.alert(
      {
        title: '映画追加エラー',
        message: '気分リストに気分が追加されていません',
        buttonLabel: 'OK'
      });
    }else {
      // スピナーの表示
      Utility.show_spinner(ID.get_moveadd_ID().poster);

      // ローカルからユーザ名の取得
      var storage = window.localStorage;
      var username = storage.getItem(ID.get_localStorage_ID().username);

      // ツールバーとユーザアクション部分のボタンを無効にする
      // 気分リストへの登録件数の表示を透過させる
      var button_list = [ID.get_moveadd_ID().add_button,ID.get_moveadd_ID().feeling_button,ID.get_moveadd_ID().dvd_button,ID.get_moveadd_ID().share_button,ID.get_moveadd_ID().show_info_button,ID.get_moveadd_ID().back_button];
      Utility.setAttribute_list_object(button_list, 'disabled', 'disabled');
      document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '.4';

      var user_onomatopoeia_list = Movieadd.userdata.feeling_name_list;
      var movie = Movieadd.current_movie;

      //dvd所持情報を作成
      var dvd = 0;
      if (Movieadd.userdata.dvd === true) {
        dvd = 1;
      }else {
        dvd = 0;
      }
      // お気に入り情報を作成
      var fav = 0;
      if (Movieadd.userdata.fav === true) {
        fav = 1;
      }else {
        fav = 0;
      }

      var data = {
        "username": username,
        "movie_title": Utility.get_movie_ja_title(movie),
        "overview": movie.overview,
        "poster_path": movie.poster_path,
        "movie_id": movie.id,
        "genre_id_list": movie.genre_ids,
        "onomatopoeia": user_onomatopoeia_list,
        "dvd": dvd,
        "fav": fav
      };

      Utility.FiNote_API('movie_add', data, 'POST', 'v1').then(function(result) {
        var genre_obj_json = JSON.parse(result);

        /*********************ローカル保存処理を開始*********************/
        // 画像のダウンロード
        var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
        var image = new Image();
        image.src = base_url + movie.poster_path;
        var image_b64 = '';

        var promises = [Movieadd.set_genre_local(genre_obj_json), Movieadd.set_onomatopoeia_local(user_onomatopoeia_list), Utility.image_to_base64(image, 'image/jpeg')];

        Promise.all(promises).then(function(results) {
          image_b64 = results[2];

          // 新規追加と追加済みのprimary keyを保存
          var genre_pk_array = results[0];
          var onomatopoeia_pk_array = results[1];

          var genre_csv = '';
          var onomatopoeia_csv = '';

          //ジャンルIDのcsvを作成
          for(var i = 0; i < genre_pk_array.length; i++) {
            genre_csv += genre_pk_array[i] + ',';
          }
          genre_csv = genre_csv.substr(0, genre_csv.length-1);

          //オノマトペIDのcsvを作成
          for(i = 0; i < onomatopoeia_pk_array.length; i++) {
            onomatopoeia_csv += onomatopoeia_pk_array[i] + ',';
          }
          onomatopoeia_csv = onomatopoeia_csv.substr(0, onomatopoeia_csv.length-1);

          var query = 'INSERT INTO movie(title, tmdb_id, genre_id, onomatopoeia_id, poster, overview, dvd, fav, add_year, add_month, add_day) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
          var today = new Date();
          var year = today.getFullYear();
          var month = today.getMonth()+1;
          var day = today.getDate();
          var data = [Utility.get_movie_ja_title(movie), movie.id, genre_csv, onomatopoeia_csv, image_b64, movie.overview, dvd, fav, year, month, day];

          return DB_method.single_statement_execute(query, data);
        })
        .then(function(result) {
          console.log(result);
          Utility.stop_spinner();
          document.getElementById(ID.get_moveadd_ID().success_alert).show();
          Global_variable.movie_update_flag = true;
        })
        .catch(function(err) {
            console.log(err);
            Utility.stop_spinner();
            Utility.show_error_alert('映画追加エラー','映画追加時にエラーが発生しました','OK');
            Utility.removeAttribute_list_object(button_list, 'disabled');
            document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '';
            document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '1';
          });
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('映画追加前処理エラー','映画追加の前処理でエラーが発生しました','OK');
        Utility.removeAttribute_list_object(button_list, 'disabled');
        document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '';
        document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '1';
      });
    }
  },


  /**
   * ローカルDBのgenreテーブルにサーバから受け取ったgenre_idとnameを格納
   * @param {string} genre_obj_json - サーバから受け取ったgenre_idをkey、nameをvalueにしたjson
   */
  set_genre_local: function(genre_obj_json) {
    var exist_genre_id_list = [];

    return new Promise(function(resolve,reject) {
      //ローカルからジャンルリストを取得
      DB_method.single_statement_execute('SELECT id, genre_id FROM genre',[]).then(function(results) {
        //ジャンルID(ユーザ登録)だけの配列を作成
        var genre_id_list = [];
        for(var key in genre_obj_json) {
          genre_id_list.push(Number(key));
        }

        //ジャンルIDとpkの(ローカル)配列を作成
        var genre_pk_list_local = [];
        var genre_id_list_local = [];
        for(var i = 0; i < results.rows.length; i++ ) {
          genre_pk_list_local.push(results.rows.item(i).id);
          genre_id_list_local.push(results.rows.item(i).genre_id);
        }

        //ローカルから取得したリストにジャンルID(ユーザ登録)が含まれていなければpromiseに登録する
        var promises = [];
        for(i = 0; i < genre_id_list.length; i++) {
          if (genre_id_list_local.indexOf(genre_id_list[i]) === -1) {
            var genre_id = genre_id_list[i];
            var name = genre_obj_json[genre_id];

            var query = 'INSERT INTO genre(genre_id,name) VALUES(?,?)';
            var data = [genre_id, name];
            promises.push(DB_method.single_statement_execute(query,data));
          }else {
            var index = genre_id_list_local.indexOf(genre_id_list[i]);
            exist_genre_id_list.push(genre_pk_list_local[index]);
          }
        }

        return promises;
      })
      .then(function(promises) {
        Promise.all(promises).then(function(results) {
          // insertIDを保存
          var insertID_list = [];
          for(var i = 0; i < results.length; i++) {
            insertID_list.push(results[i].insertId);
          }

          // exist_genre_idをまとめる
          Array.prototype.push.apply(insertID_list, exist_genre_id_list);

          insertID_list.sort(function(a,b){
            if( a < b ) return -1;
            if( a > b ) return 1;
            return 0;
          });

          resolve(insertID_list);
        })
        .catch(function(error) {
          console.log(error);
          reject(error);
        });
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
    });
  },


  /**
   * ローカルDBのonomatopoeiaテーブルにonomatopoeiaの名前を格納する
   * @param {Array} onomatopoeia_name_list - ユーザが追加したオノマトペリスト
   */
  set_onomatopoeia_local: function(onomatopoeia_name_list) {
    var exist_onomatopoeia_id_list = [];

    return new Promise(function(resolve,reject) {
        //ローカルからオノマトペリストを取得
        DB_method.single_statement_execute('SELECT id, name FROM onomatopoeia', []).then(function(results) {
          var onomatopoeia_id_list_local = [];
          var onomatopoeia_name_list_local = [];
          for(var i = 0; i < results.rows.length; i++) {
            onomatopoeia_id_list_local.push(results.rows.item(i).id);
            onomatopoeia_name_list_local.push(results.rows.item(i).name);
          }

          //ローカルから取得したリストにオノマトペ(ユーザ登録)が含まれていなければpromiseに登録する
          var promises = [];
          for(i = 0; i < onomatopoeia_name_list.length; i++) {
            if (onomatopoeia_name_list_local.indexOf(onomatopoeia_name_list[i]) === -1) {
              var query = 'INSERT INTO onomatopoeia(name) VALUES(?)';
              var data = [onomatopoeia_name_list[i]];
              promises.push(DB_method.single_statement_execute(query,data));
            }else {
              var index = onomatopoeia_name_list_local.indexOf(onomatopoeia_name_list[i]);
              exist_onomatopoeia_id_list.push(onomatopoeia_id_list_local[index]);
            }
          }
          return promises;
        })
        .then(function(promises) {
          Promise.all(promises).then(function(results) {
            // insertIDを保存
            var insertID_list = [];
            for(var i = 0; i < results.length; i++) {
              insertID_list.push(results[i].insertId);
            }

            // exist_genre_idをまとめる
            Array.prototype.push.apply(insertID_list, exist_onomatopoeia_id_list);

            insertID_list.sort(function(a,b){
              if( a < b ) return -1;
              if( a > b ) return 1;
              return 0;
            });

            resolve(insertID_list);
          })
          .catch(function(error) {
            console.log(error);
            reject(error);
          });
        })
        .catch(function(error) {
          console.log(error);
          reject(error);
        });   
    });
  },


  /**
   * 映画の詳細を表示している画面の気分リストをタップした際に画面遷移する
   */
  pushpage_feeling: function(){
    var callback = function(){
      Global_variable.feeling_flag = 0;
      Feeling.show_contents();
    };

    Utility.check_page_init(ID.get_feeling_ID().page_id, callback);
    Utility.push_page(ID.get_feeling_ID().tmp_id, 'lift', 0, '');
  },


  /**
   * 映画の詳細を表示している画面のDVDをタップした際に画面遷移する
   */
  pushpage_status: function(){
    var callback = function(){
      // 映画追加画面からの遷移であることを登録
      Global_variable.status_flag = 0;
      Movieadd_status.show_contents();
    };

    Utility.check_page_init(ID.get_movieadd_status_ID().page_id, callback);
    Utility.push_page(ID.get_movieadd_status_ID().tmp_id, 'lift', 0, '');
  },


  /**
   * 登録されたリストの件数をもとにボタン透過率とラベルを更新する関数
   */
  update_labels: function(){
    var list_length = Movieadd.userdata.feeling_name_list.length;
    var list_number = document.getElementById(ID.get_moveadd_ID().feeling_number);

    list_number.innerHTML = list_length;

    var movieadd_add_button = document.getElementById(ID.get_moveadd_ID().add_button);
    if (list_length === 0) {
      movieadd_add_button.style.opacity = '.4';
    }else {
      movieadd_add_button.style.opacity = '1';
    }
  },


  /**
   * 映画追加が完了した後に表示するアラートのOKボタンをタップして動作
   */
  success_movieadd_alert_hide: function() {
    document.getElementById(ID.get_moveadd_ID().success_alert).hide().then(function(){
      //追加した結果を反映させるために検索を行う
      Movieadd_search.get_search_movie_title_val();
      
      Utility.pop_page();
    });
  },


  /**
   * Twitter、FaceBook、LINEなどのSNSに投稿する
   */
  sns_share: function() {
    var message_text = '';
    if (Movieadd.userdata.feeling_name_list.length === 0 ) {
      message_text = '「' + Movieadd.current_movie.title + '」' + '\n' + '#FiNote';
    }else {
      message_text = '「' + Movieadd.current_movie.title + '」' + '\n' + Movieadd.userdata.feeling_name_list + '\n' + '#FiNote';
    }

    var options = {
      message: message_text,
      subject: '',
      files: ['', ''],
      url: 'https://www.themoviedb.org/movie/' + Movieadd.current_movie.id,
      chooserTitle: 'Pick an app'
    };

    var onSuccess = function(result) {
      if (result.completed === true && result.app !== 'com.apple.UIKit.activity.PostToFacebook') {
        document.getElementById(ID.get_moveadd_ID().success_sns_alert).show();

        //映画追加画面のボタンオブジェクト
          var button_list = [ID.get_moveadd_ID().add_button,ID.get_moveadd_ID().feeling_button,ID.get_moveadd_ID().dvd_button,ID.get_moveadd_ID().share_button,ID.get_moveadd_ID().show_info_button,ID.get_moveadd_ID().back_button];

          Utility.setAttribute_list_object(button_list, 'disabled', 'disabled');

          document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '.4';
          document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '.4';
      }
    };

    var onError = function(msg) {
      Utility.show_error_alert('投稿エラー',msg,'OK');

      //映画追加画面のボタンオブジェクト
        var button_list = [ID.get_moveadd_ID().add_button,ID.get_moveadd_ID().feeling_button,ID.get_moveadd_ID().dvd_button,ID.get_moveadd_ID().share_button,ID.get_moveadd_ID().show_info_button,ID.get_moveadd_ID().back_button];

        Utility.setAttribute_list_object(button_list, 'disabled', 'disabled');
        document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '.4';
        document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '.4';
    };

    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  },


  /**
   * SNSの投稿が完了した後に表示されるアラートを閉じるボタンが押された時に動作する
   */
  sns_alert_hide: function() {
    //映画追加画面のボタンオブジェクト
    var button_list = [document.getElementById(ID.get_moveadd_ID().add_button),document.getElementById(ID.get_moveadd_ID().feeling_button),document.getElementById(ID.get_moveadd_ID().dvd_button),document.getElementById(ID.get_moveadd_ID().share_button),document.getElementById(ID.get_moveadd_ID().show_info_button),document.getElementById(ID.get_moveadd_ID().back_button)];

    document.getElementById(ID.get_moveadd_ID().success_sns_alert).hide();
    Utility.removeAttribute_list_object(button_list, 'disabled');
    document.getElementById(ID.get_moveadd_ID().feeling_number).style.opacity = '';

    if (Movieadd.userdata.feeling_name_list.length === 0) {
      document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '.4';
    }else {
      document.getElementById(ID.get_moveadd_ID().add_button).style.opacity = '1';
    }
  }
};





/************************************************************
                        feeling.html
 ************************************************************/
var Feeling = {

  // タップしたリストのidを保存する
  data: {tap_id: 0},


  /**
   * 気分リストのコンテンツを表示する関数
   */
  show_contents: function(){
    //flagに応じてツールバーの戻る・閉じるボタンを動的に変える
    var toolbar_left = document.getElementById(ID.get_feeling_ID().toolbar);
    toolbar_left.innerHTML = '';
    toolbar_left.innerHTML = Global_variable.get_toolbar_feeling(Global_variable.feeling_flag);
    
    // 詳細画面から表示した場合
    if (Global_variable.feeling_flag === 1) {
      document.getElementById(ID.get_feeling_ID().caution_message).innerHTML = '※ この画面から戻る際に気分リストが保存されます。';
      document.getElementById(ID.get_feeling_ID().toolbar).setAttribute('onClick', 'Movies_detail.tap_feeling_back_button()');
    }
    
    //アラート表示後に自動フォーカスするためのイベントを登録する
    Feeling.feeling_input_name_addEvent();

    var nodata_message = document.getElementById(ID.get_feeling_ID().nodata_message);
    var feeling_list = document.getElementById(ID.get_feeling_ID().list);
    var length = Movieadd.userdata.feeling_name_list.length;

    feeling_list.innerHTML = '';

    if (length === 0) {
      nodata_message.style.height = '100%';
      nodata_message.innerHTML = '感情を1件以上登録してください<br>(1件につき6文字以内)';
    }else {
      nodata_message.style.height = '0%';
      nodata_message.innerHTML = '';

      //リスト表示
      feeling_list.innerHTML = '<ons-list-header>登録済みの気分</ons-list-header>';

      for(var i = 0; i < length; i++) {
        feeling_list.innerHTML += '<ons-list-item modifier="longdivider">'+
                                  '<div class="left">'+
                                  Movieadd.userdata.feeling_name_list[i]+
                                  '</div>'+

                                  '<div class="right">'+
                                  '<ons-button class="brown_bg_color_quiet" modifier="quiet" onClick="Feeling.tap_edit('+ i +')">'+
                                  '<ons-icon size="25px" icon="ion-edit"></ons-icon>'+
                                  '</ons-button>'+

                                  '<ons-button class="brown_bg_color_quiet" modifier="quiet" onClick="Feeling.tap_delete('+ i +')">'+
                                  '<ons-icon size="25px" icon="ion-trash-a"></ons-icon>'+
                                  '</ons-button>'+
                                  '</div>'+
                                  '</ons-list-item>';
      }
    }
  },


  /**
   * アラート表示後にフォーカスを当てる処理を行う
   */
  feeling_input_name_addEvent: function(){
    document.addEventListener('postshow', function(event) {
      if (event.target.id === ID.get_feeling_ID().add_dialog) {
        document.getElementById(ID.get_feeling_ID().add_button).setAttribute('disabled', 'disabled');
        document.getElementById(ID.get_feeling_ID().input).focus();
      }else if (event.target.id === ID.get_feeling_ID().edit_dialog) {
        document.getElementById(ID.get_feeling_ID().edit_input).focus();
      }
    });
  },


  /**
   * 気分を入力するアラートを表示してinputのvalueを初期化する
   */
  show_input_alert: function(){
    document.getElementById(ID.get_feeling_ID().add_dialog).show();

    var input_form = document.getElementById(ID.get_feeling_ID().input);
    input_form.value = '';
    input_form.addEventListener('keyup', Feeling.check_add_input_form);
  },


  /**
   * 気分の追加フォームの値を監視して登録ボタンの有効・無効を設定する関数
   */
  check_add_input_form: function(){
    var value = document.getElementById(ID.get_feeling_ID().input).value;
    var add_button = document.getElementById(ID.get_feeling_ID().add_button);

    if (value.replace(/\s+/g, '') !== '') {
      add_button.removeAttribute('disabled');
    }else {
      add_button.setAttribute('disabled');
    }
  },


  /**
   * 気分の変更フォームの値を監視して変更ボタンの有効・無効を設定する関数
   */
  check_edit_input_form: function(){
    var value = document.getElementById(ID.get_feeling_ID().edit_input).value;
    var change_button = document.getElementById(ID.get_feeling_ID().edit_button);

    if (value.replace(/\s+/g, '') !== '') {
      change_button.removeAttribute('disabled');
    }else {
      change_button.setAttribute('disabled');
    }
  },


  /**
   * アラートを閉じるor閉じてリストへ追加する関数
   * @param  {string} func_id   - cancel or add or change
   * @param  {string} dialog_id - feeling_add_dialog or feeling_edit_dialog
   */
  hide_input_alert: function(func_id, dialog_id){
    if (func_id === 'cancel') {
      document.getElementById(dialog_id).hide();
    }else if (func_id === 'add' ){
      var feeling_name = document.getElementById(ID.get_feeling_ID().input).value;
      feeling_name = feeling_name.replace(/\s+/g, '');

      //既出でない場合
      if (Movieadd.userdata.feeling_name_list.indexOf(feeling_name) === -1) {
        //リスト追加と表示
        Movieadd.userdata.feeling_name_list.push(feeling_name);
        Feeling.show_contents();

        //ラベルの更新(映画の追加画面からの気分リストの表示時はラベルの更新を行う)
        if (Global_variable.feeling_flag === 0) {
          Movieadd.update_labels();
        }

        document.getElementById(dialog_id).hide();

      //既出の場合
      }else {
        document.getElementById(dialog_id).hide();
        Utility.show_error_alert('登録エラー','既に登録済みです','OK');
      }
    }else {
      // changeの場合
      var value = document.getElementById(ID.get_feeling_ID().edit_input).value;
      if (Movieadd.userdata.feeling_name_list.indexOf(value) === -1) {
        Movieadd.userdata.feeling_name_list[Feeling.data.tap_id] = value;
        document.getElementById(ID.get_feeling_ID().edit_dialog).hide();
        Feeling.show_contents();
      }else {
        document.getElementById(dialog_id).hide();
        Utility.show_error_alert('登録エラー','既に登録済みです','OK');
      }
    }
  },


  /**
   * リストの編集ボタンをタップした際に、入力用のアラートを表示する
   * @param  {number} i - タップしたリストの配列の添え字
   */
  tap_edit: function(i) {
    Feeling.data.tap_id = i;
    
    var feeling_name_list = Movieadd.userdata.feeling_name_list;
    var edit_input = document.getElementById(ID.get_feeling_ID().edit_input);
    edit_input.value= feeling_name_list[Feeling.data.tap_id];

    document.getElementById(ID.get_feeling_ID().edit_dialog).show();
    edit_input.addEventListener('keyup', Feeling.check_edit_input_form);
  },


  /**
   * リストの削除ボタンをタップした際に、確認用のアラートを表示して削除を行う
   * @param  {number} i - タップしたリストの配列の添え字
   */
  tap_delete: function(i) {
    Feeling.data.tap_id = i;

    var feeling_name_list = Movieadd.userdata.feeling_name_list;
    var message = '「' + feeling_name_list[i] + '」を削除します';

    var func_cancel = function() {};
    var func_delete = function() {
      feeling_name_list.splice(i, 1);
      Feeling.show_contents();
      Movieadd.update_labels();
    };
    
    Utility.show_confirm_alert('気分の削除', message, ['キャンセル', '削除'], func_cancel, func_delete);
  }
};





/************************************************************
                      movieadd_status.html
 ************************************************************/
var Movieadd_status = {

  /**
   * 保存しているスイッチボタンの状態をもとにチェックをつける
   */
  show_contents: function(){
    //flagに応じてツールバーの戻る・閉じるボタンを動的に変える
    var toolbar_left = document.getElementById(ID.get_movieadd_status_ID().toolbar);
    toolbar_left.innerHTML = '';
    toolbar_left.innerHTML = Global_variable.get_toolbar_status(Global_variable.status_flag);

    var small_message = document.getElementById(ID.get_movieadd_status_ID().small_message);
    if (Global_variable.status_flag === 0) {
      small_message.innerHTML = '初期状態は「No」で登録されます。';
    }else {
      small_message.innerHTML = '※ この画面から戻る際にステータスが保存されます。';
    }

    var check_list = [Movieadd.userdata.dvd, Movieadd.userdata.fav];
    var id_list = [ID.get_movieadd_status_ID().dvd, ID.get_movieadd_status_ID().fav];

    for(var i = 0; i < id_list.length; i++) {
      var switch_dom = document.getElementById(id_list[i]);

      switch_dom.checked = check_list[i] === true;
    }
  },


  /**
   * movieadd_status.html(DVDの所持、お気に入り画面)を閉じる時にスイッチボタンの状態を一時保存する
   */
  close_movieadd_status: function(){
    //スイッチボタンの状態を保存する
    var dvd_switch_status = document.getElementById(ID.get_movieadd_status_ID().dvd).checked;
    var fav_switch_status = document.getElementById(ID.get_movieadd_status_ID().fav).checked;

    Movieadd.userdata.dvd = dvd_switch_status === true;

    Movieadd.userdata.fav = fav_switch_status === true;

    Utility.pop_page();
  }
};





/************************************************************
                        social.html
 ************************************************************/
var Social = {
	/**
   * @param {Object} local_onomatopoeia   - ローカルに保存されているオノマトペ全件(id,name)
   * @param {Object} reaction_api_results - get_movie_reaction APIの結果
   * @param {Object} local_movies         - ローカルに保存されている映画全件(title, poster, overview, tmdb_id, onomatopoeia_id)
	 */
	data: {local_onomatopoeia: {}, reaction_api_results: {}, local_movies: {}},

	/**
   * 2カラムで映画のポスターを表示する関数
	 * @param {string} result - APIレスポンスのjson文字列
	 * @param {number} count - ユーザ数のカウント
	 * @param {boolean} rank_flag - ランクを表示するかのブール値
	 */
  draw_2_column_poster: function (result, count, rank_flag) {
    var html = '<ons-row>';
    var json_result = JSON.parse(result);
    for(var i = 0; i < json_result.length; i++) {
      var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
      var image_url = base_url + json_result[i].poster_path;

      var escaped_title = Utility.escaped_string(json_result[i].title);
      var escaped_overview = Utility.escaped_string(json_result[i].overview);

      if(rank_flag) {
        html += '<ons-col width="50vw">' +
                '<img onclick="Social.show_movie_detail(' + (i+1)+', ' + count + ', \'' + escaped_title + '\', \'' + escaped_overview + '\')" class="cover_img" src=' + image_url + '>'+
                '</ons-col>';
      }else {
        html += '<ons-col width="50vw">' +
                '<img onclick="Social.show_movie_detail(-1, '+ count+ ', \'' + escaped_title + '\', \'' + escaped_overview + '\')" class="cover_img" src=' + image_url + '>'+
                '</ons-col>';
      }

      if(i % 2 === 1) {
        html += '</ons-row><ons-row>'
      }
    }

    var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
    if(json_result.length === 0 ) {
      social_movie_list.innerHTML = '<p class="all_center_message">入力した気分を登録している映画は<br>見つかりませんでした</p>';
    }else {
     social_movie_list.innerHTML = html;
    }
  },


	/**
   * 最新ランキングの表示を実行する関数
	 */
	draw_get_recently_movie_list: function () {
    var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
    social_movie_list.innerHTML = '';

    Utility.show_spinner(ID.get_social_ID().page_id);

    Utility.FiNote_API('get_recently_movie','', 'GET', 'v1').then(function(result) {
      Utility.stop_spinner();

      //結果を描画
      Social.draw_2_column_poster(result, -1, true);

    })
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('APIエラー', err, 'OK');
    });
	},

	/**
   * socialタブがタップされて、表示される度にAPIを叩いて結果を描画する
	 * @param  {string} page_id   - page_id(social)
	 */
	run_draw_get_recently_movie_list: function (page_id) {
    document.addEventListener('show', function(event) {
      if (event.target.id === page_id) {
        Social.draw_get_recently_movie_list();
      }
    });
  },


	/**
   * 詳細情報をモーダルで表示する
   * @param {number} rank        - ランキング
   * @param {number} count       - ユーザの登録人数
	 * @param {string} title       - 映画のタイトル
	 * @param {string} overview    - 映画の概要
	 */
  show_movie_detail: function (rank, count, title, overview) {
    var modal_rank = document.getElementById(ID.get_social_ID().modal_rank);
    var modal_title = document.getElementById(ID.get_social_ID().modal_title);
    var modal_overview = document.getElementById(ID.get_social_ID().modal_overview);
    var modal = document.getElementById(ID.get_social_ID().modal);


    if(count === -1 && rank === -1 ) {
      modal_rank.innerHTML = '';
    }else if(count === -1 && rank !== -1) {
      modal_rank.innerHTML = rank + '位';
    }else {
      modal_rank.innerHTML = rank + '位 (' + count + '人)';
    }

    modal_title.innerHTML = title;
    modal_overview.innerHTML = overview;

    modal.show();
	},


	/**
   * モーダルを閉じる関数
	 */
	hide_modal: function() {
		var modal = document.getElementById(ID.get_social_ID().modal);
		modal.hide();
	},


	/**
   * 表示切り替え用のアクションシートを表示する
	 */
	show_action_sheet: function () {
	  ons.openActionSheet({
      title: '表示を切り替える',
      cancelable: true,
      buttons: [
        '最新ランキング',
        '気分の比較一覧',
        '気分で映画を検索',
        '年代別の人気ランキング',
        {
          label: 'キャンセル',
          icon: 'md-close'
        }
      ]
    }).then(function(index){
      console.log('index: ' + index);

      switch (index){
        //最新ランキング
        case 0:
          document.getElementById(ID.get_social_ID().search_area).style.display = 'none';
          Social.draw_get_recently_movie_list();
          break;

        //気分の比較一覧
        case 1:
          document.getElementById(ID.get_social_ID().search_area).style.display = 'none';
          Social.get_movie_reactions();
          break;

        //気分で追加されている映画を検索
        case 2:
          Utility.hideKeyboardAccessoryBar(true);
          document.getElementById(ID.get_social_ID().movie_list).innerHTML = '';
          document.getElementById(ID.get_social_ID().search_area).style.display = 'inline-block';
          break;

        //年代別の人気ランキング
        case 3:
          document.getElementById(ID.get_social_ID().search_area).style.display = 'none';
          Social.draw_get_movie_by_age();
          break;
      }
    })
	},


	/**
   * 年代別の映画ランキングを描画する関数
	 */
	draw_get_movie_by_age: function () {
	  var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
	  social_movie_list.innerHTML = '';

	  Utility.show_spinner(ID.get_social_ID().page_id);

    Utility.FiNote_API('get_movie_by_age', '', 'GET', 'v1').then(function(result) {
      Utility.stop_spinner();

      var json_result = JSON.parse(result);

      var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
      var html = '';
      var count = 10;

      //全年代の映画ポスターを描画するhtmlを生成
      for(var i = 0; i < json_result.length; i++ ) {
        var by_age = String(count);
        var by_age_results = json_result[i][by_age];

        html += '<ons-list-header>' + by_age + '代</ons-list-header><div class="my_slick_class">';

        //1つの年代
        for(var j = 0; j < by_age_results.length; j++ ){
          var img_url = base_url + by_age_results[j].poster_path;
          var escaped_title = Utility.escaped_string(by_age_results[j].title);
          var escaped_overview = Utility.escaped_string(by_age_results[j].overview);
          var user_count = by_age_results[j][by_age];

          html += '<div><img onclick="Social.show_movie_detail(' + (j+1)+', '+user_count+', \'' + escaped_title + '\', \'' + escaped_overview + '\')" class="img_30vh_height" src="' + img_url + '"></div>';
        }

        count += 10;
        html += '</div>';
      }

      social_movie_list.innerHTML = '<ons-list>' + html + '</ons-list>';

      //slickの設定
      $(document).ready(function(){
        $('.my_slick_class').slick({
          infinite: false,
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: true,
          arrows: false
        });
      });
    })
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('APIエラー', err, 'OK');
    });
	},


	/**
   * 検索フォームに文字入力されるたびに発火するイベントを登録する関数
	 * @param {string} event_name - focus or blur
	 */
	set_event_social_movies_search_input: function(event_name) {
    if (event_name === 'focus') {
      document.getElementById(ID.get_social_ID().social_movies_input).addEventListener('input', Social.social_form_show_hide_reset_button, false);
    } else if (event_name === 'blur') {
      document.getElementById(ID.get_social_ID().social_movies_input).removeEventListener('input', Social.social_form_show_hide_reset_button, false);
    }
  },


	/**
   * リセットボタンの表示・非表示を制御する関数
	 */
	social_form_show_hide_reset_button: function() {
    var text = document.getElementById(ID.get_social_ID().social_movies_input).value;
    var reset_button = document.getElementById(ID.get_social_ID().social_movies_reset_button);

    if (text.length > 0) {
      reset_button.style.visibility = 'visible';
    }else {
      reset_button.style.visibility = 'hidden';
    }
  },


	/**
   * 検索フォームに表示されたリセットボタンを押した際に、
   * フォームに入力されている値を初期化してフォームへフォーカスを当てる関数
	 */
	tap_reset_button: function () {
	  var input = document.getElementById(ID.get_social_ID().social_movies_input);
    input.value = '';
	  input.focus();

	  //リセットボタンの非表示
	  Social.social_form_show_hide_reset_button();
  },


	/**
   * 検索フォームへ入力された気分が登録されている映画を取得して描画する関数
	 */
	post_and_draw_get_movie_by_onomatopoeia: function () {
	  document.getElementById(ID.get_social_ID().movie_list).innerHTML = '';
	  Utility.show_spinner(ID.get_social_ID().page_id);
	  document.getElementById(ID.get_social_ID().social_movies_input).blur();

	  var value = document.getElementById(ID.get_social_ID().social_movies_input).value;
    var data = {"onomatopoeia_name": value};

		Utility.FiNote_API('get_movie_by_onomatopoeia', data, 'POST', 'v1').then(function(result) {
      Utility.stop_spinner();

      //結果を描画
      Social.draw_2_column_poster(result, -1, false);
		})
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('APIエラー', err, 'OK');
    });
  },


	/**
   *「気分の比較」を描画するために必要な情報(映画に紐付いているオノマトペ、ローカルの映画情報)を取得し、描画関数へ渡す
	 */
	get_movie_reactions: function () {
	  var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
	  social_movie_list.innerHTML = '';

	  Utility.show_spinner(ID.get_social_ID().page_id);

	  var local_movie_results = {};

	  var query = 'SELECT title, poster, overview, tmdb_id, onomatopoeia_id from movie order by id DESC';
	  DB_method.single_statement_execute(query, []).then(function(result) {
	    local_movie_results = result;

	    if(local_movie_results.rows.length === 0) {
        //  メッセージ表示
        return -1;
      }else {
	      //POSTするtmdb_idの配列文字列を生成
        var list_data = '[';
        for(var i = 0; i < result.rows.length; i++ ) {
          list_data += result.rows.item(i).tmdb_id + ',';
        }
        list_data = list_data.substr(0, list_data.length-1);
        list_data += ']';

        var post_data = {"tmdb_id_list": list_data};
        var onomatopoeia_query = 'SELECT id,name from onomatopoeia';

        return Promise.all(
          [DB_method.single_statement_execute(onomatopoeia_query, []),
          Utility.FiNote_API('get_movie_reaction', post_data, 'POST', 'v1')]
        );
      }
    })
    .then(function(promises) {
      if(promises === -1 ) {
        var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
        social_movie_list.innerHTML = '<p class="all_center_message">映画を追加すると比較結果が表示されます</p>';
      }else {
        var api_results = JSON.parse(promises[1]);
        Social.draw_get_movie_reactions(promises[0], api_results, local_movie_results);

        //詳細画面で表示するために情報を保存
        Social.data.local_onomatopoeia = promises[0];
        Social.data.reaction_api_results = api_results;
        Social.data.local_movies = local_movie_results;
      }

      Utility.stop_spinner();
    })
    .catch(function(err) {
      Utility.stop_spinner();
      console.log(err);
      Utility.show_error_alert('エラー発生', err, 'OK');
    });
  },


	/**
   * ローカルの映画に付与されているオノマトペと、サーバ上で登録されているオノマトペを比較するリストを描画する関数
	 * @param {Object} local_onomatopoeia - ローカルに保存されているオノマトペ全件(id,name)
	 * @param {Object} api_results        - get_movie_reaction APIの結果
	 * @param {Object} local_movies       - ローカルに保存されている映画全件(title, poster, overview, tmdb_id, onomatopoeia_id)
	 */
  draw_get_movie_reactions: function (local_onomatopoeia, api_results, local_movies) {
	  var draw_limit = 6;
    var html = '';

    for(var i = 0; i < local_movies.rows.length; i++ ) {
      var movie = local_movies.rows.item(i);

      //ローカルのオノマトペを生成
      var movie_onomatopoeia_array = movie.onomatopoeia_id.split(',');
      var local_onomatopoeia_html = '';
      for(var j = 0; j < draw_limit; j++ ) {
        for(var k = 0; k < local_onomatopoeia.rows.length; k++ ) {
          var onomatopoeia_record = local_onomatopoeia.rows.item(k);
          if(String(onomatopoeia_record.id) === movie_onomatopoeia_array[j]) {
            local_onomatopoeia_html += onomatopoeia_record.name + ', ';
            break;
          }
        }
      }
      local_onomatopoeia_html = local_onomatopoeia_html.substr(0, local_onomatopoeia_html.length-2);

      //サーバ上に登録されているオノマトペを生成
      var server_onomatopoeia_html = '';
      for(j = 0; j < api_results.length; j++ ) {
        var key = Object.keys(api_results[j])[0];

        if(key === String(movie.tmdb_id)) {
          var for_count = draw_limit;                     // 映画に付与されているオノマトペがdraw_limitより少ない場合は、
          if(api_results[j][key].length < draw_limit ) {  // 全て描画するようにfor文の回数を調整する
            for_count = api_results[j][key].length;
          }

          for(k = 0; k < for_count; k++ ) {
            var value = api_results[j][key];
            server_onomatopoeia_html += value[k]['name'] + ', ';
          }
          break;
        }
      }
      server_onomatopoeia_html = server_onomatopoeia_html.substr(0, server_onomatopoeia_html.length-2);

      html += '<ons-list-item modifier="longdivider">'+
              '<div class="left">'+
              '<img class="list_img_large" src="' + movie.poster + '">'+
              '</div>'+

              '<div class="origin_list_width">'+
              '<div class="harf_list_height_top">'+
              '<ons-icon size="30px" icon="ion-person" class="brown_color"></ons-icon>'+
              '<p class="list_p">' + local_onomatopoeia_html + '</p>'+
              '</div>'+

              '<div class="harf_list_height">'+
              '<ons-icon size="30px" icon="ion-earth" class="brown_color"></ons-icon>'+
              '<p class="list_p">' + server_onomatopoeia_html + '</p>'+
              '</div>'+
              '</div>'+
              '</ons-list-item>';
    }

    var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
    social_movie_list.innerHTML = '<ons-list>' + html + '</ons-list>';
	}
};





/************************************************************
                        user.html
 ************************************************************/
var User = {

  /**
   * ユーザ情報画面が表示されるたびに発火するイベントを追加
   * @param  {[String]}   page_id  [ページのID]
   * @param  {Function} callback [該当ページが表示された後に実行する関数]
   */
  show_event: function(page_id, callback) {
    document.addEventListener('show', function(event) {
      if (event.target.id === page_id) {
        console.log(event.target.id + ' is show');

        DB_method.count_record('movie').then(function(movie_count) {

          if (movie_count === 0) {
            document.getElementById(ID.get_user_ID().graph_area).innerHTML = '<div><p class="no_data_graph_message">映画を登録するとグラフが表示されます</p></div>';
            document.getElementById(ID.get_user_ID().movies_number).innerHTML = '0';
            document.getElementById(ID.get_user_ID().dvds_number).innerHTML = '0';
            document.getElementById(ID.get_user_ID().favorites_number).innerHTML = '0';
          }else {
            document.getElementById(ID.get_user_ID().graph_area).innerHTML = 
            '<ons-list>'+
            '<ons-list-item modifier="longdivider" id="chart1_list_item">'+
            '<div class="left"><div class="ct-chart ct-perfect-fourth chart_area" id="chart1"></div></div>'+
            '<div class="right"><ons-list id="onomatopoeia_top3"></ons-list></div>'+
            '</ons-list-item>'+
            '<ons-list-item modifier="longdivider">'+
            '<div class="left"><div class="ct-chart ct-perfect-fourth chart_area" id="chart2"></div></div>'+
            '<div class="right"><ons-list id="genre_top3"></div></div>'+
            '</ons-list-item>'+
            '</ons-list>';

            // グラフ描画等を行う
            callback();
          }
        });
      }
    });
  },


  /**
   * データベースからデータを取得して、件数やグラフを描画する関数
   * @return {[Promise]} [空のresolve]
   */
  show_contents: function() {

    var draw_graph_contents_count = 15;

    return new Promise(function(resolve, reject) {
      Utility.show_spinner(ID.get_user_ID().page_id);

      var result = [];
      var db = Utility.get_database();

      db.readTransaction(function(tx) {
        tx.executeSql('SELECT dvd,fav,genre_id,onomatopoeia_id FROM movie', [], function(tx, resultSet) {
          result.push(resultSet);

          tx.executeSql('SELECT * FROM genre', [], function(tx, resultSet) {
            result.push(resultSet);

            tx.executeSql('SELECT * FROM onomatopoeia', [], function(tx, resultSet) {
              result.push(resultSet);
            },
            function(tx, error) {
              console.log('SELECT error: ' + error.message);
              reject(error.message);
            });
          });
        });
      },
      function(error) {
        console.log('transaction error: ' + error.message);
        reject(error.message);
      },
      function() {
        resolve(result);
      });
    }).then(function(result) {
      // result[0] movie
      // result[1] genre
      // result[2] onomatopoeia

      // オノマトペとジャンルの名前とカウント数をまとめた連想配列、
      // DVDとお気に入りの登録数をそれぞれ取得
      var params = User.create_name_count_obj_and_counts(result);

      // グラフの描画関数に渡す1つ1つの出現回数を格納した配列を作成する
      var o_array_count = [];
      var g_array_count = [];
      for(var o_key in params.o_obj) {
        var o_value = params.o_obj[o_key];
        o_array_count.push(o_value);
      }

      for(var g_key in params.g_obj) {
        var g_value = params.g_obj[g_key];
        g_array_count.push(g_value);
      }


      // 降順でカウント数をソート
      Utility.sort_array(o_array_count, 1);
      Utility.sort_array(g_array_count, 1);


      // カウント数の降順でジャンルとオノマトペ名を保存
      var o_array_name = [];
      var g_array_name = [];
      for(var i = 0; i < o_array_count.length; i++) {
        for(o_key in params.o_obj) {
          if (o_array_count[i] === params.o_obj[o_key]) {
            o_array_name.push(o_key);
            delete params.o_obj[o_key];
            break;
          }
        }
      }

      for(i = 0; i < g_array_count.length; i++) {
        for(g_key in params.g_obj) {
          if (g_array_count[i] === params.g_obj[g_key]) {
            g_array_name.push(g_key);
            delete params.g_obj[g_key];
            break;
          }
        }
      }


      // トップ3を書き込む
      var onomatopoeia_top3 = document.getElementById(ID.get_user_ID().onomatopoeia_top3);
      var genre_top3 = document.getElementById(ID.get_user_ID().genre_top3);
      var onomatopoeia_top3_html = '';
      var genre_top3_html = '';
      for(i = 0; i < 3; i++) {
        var tmp_o_name = o_array_name[i];
        var tmp_g_name = g_array_name[i];
        var o_style = '';
        var g_style = '';

        if (typeof o_array_name[i] === 'undefined') {
          tmp_o_name = 'データなし';
          o_style = 'opacity: .5;';
        }

        if (typeof g_array_name[i] === 'undefined') {
          tmp_g_name = 'データなし';
          g_style = 'opacity: .5;';
        }

        onomatopoeia_top3_html += '<ons-list-item style="' + o_style + '">' + (i+1) + '. ' + tmp_o_name + '</ons-list-item>';
        genre_top3_html += '<ons-list-item style="' + g_style + '">' + (i+1) + '. ' + tmp_g_name + '</ons-list-item>';
      }

      onomatopoeia_top3.innerHTML = '<ons-list-header>気分 トップ3</ons-list-header>' + onomatopoeia_top3_html;
      genre_top3.innerHTML = '<ons-list-header>ジャンル トップ3</ons-list-header>' + genre_top3_html;


      // 映画、DVD、FAVの件数をhtmlに書き込む
      var movies_count = document.getElementById(ID.get_user_ID().movies_number);
      var dvds_count = document.getElementById(ID.get_user_ID().dvds_number);
      var favorites_count = document.getElementById(ID.get_user_ID().favorites_number);
      movies_count.innerHTML = String(result[0].rows.length);
      dvds_count.innerHTML = String(params.dvds);
      favorites_count.innerHTML = String(params.favs);


      // オノマトペとジャンルの合計数をそれぞれ求める
      var list_sum = function sum(a) {
        return a.reduce(function(x, y) { return x + y; });
      };
      var o_total_count = list_sum(o_array_count.slice(0, draw_graph_contents_count));
      var g_total_count = list_sum(g_array_count.slice(0, draw_graph_contents_count));

      // チャートの描画
      User.draw_chart(ID.get_user_ID().chart1, o_total_count, o_array_count.slice(0, draw_graph_contents_count));
      User.draw_chart(ID.get_user_ID().chart2, g_total_count, g_array_count.slice(0, draw_graph_contents_count));

      Utility.stop_spinner();
      resolve();
    });
  },


  /**
   * ジャンルとオノマトペを名前とカウント数でまとめた連想配列の作成と、
   * DVDとお気に入りの登録数を求める関数
   * @param  {Object} results - 0がmovie、1がgenre、2がonomatopoeia
   * @return {Object}         - 連想配列とカウント数をまとめたオブジェクト
   */
  create_name_count_obj_and_counts: function(results) {
    // ジャンルとオノマトペのpkと名前からなる連想配列を作成
    var genre_pk_name_obj = {};
    var onomatopoeia_pk_name_obj = {};
    for(var i = 0; i < results[1].rows.length; i++) {
      var genre_obj = results[1].rows.item(i);
      genre_pk_name_obj[genre_obj.id] = genre_obj.name;
    }

    for(i = 0; i < results[2].rows.length; i++) {
      var onomatopoeia_obj = results[2].rows.item(i);
      onomatopoeia_pk_name_obj[onomatopoeia_obj.id] = onomatopoeia_obj.name;
    }


    var dvd_count = 0;
    var fav_count = 0;

    var genre_pk_count_obj = {};
    var onomatopoeia_pk_count_obj = {};

    for(i = 0; i < results[0].rows.length; i++) {
      var movie_record = results[0].rows.item(i);

      // DVDとFAVの件数をカウント
      if (movie_record.dvd === 1) {
        dvd_count += 1;
      }

      if (movie_record.fav === 1) {
        fav_count += 1;
      }

      // ジャンルとオノマトペのcsvから配列を作成
      var genre_id_list = movie_record.genre_id.split(',');
      var onomatopoeia_id_list = movie_record.onomatopoeia_id.split(',');

      // ジャンルのpk(id)とカウント数からなる連想配列を作成
      for(var j = 0; j < genre_id_list.length; j++) {
        var key_genre = genre_id_list[j];
        if (key_genre in genre_pk_count_obj) {
          genre_pk_count_obj[key_genre] += 1;
        }else {
          genre_pk_count_obj[key_genre] = 1;
        }
      }

      // オノマトペのpk(id)とカウント数からなる連想配列を作成
      for(j = 0; j < onomatopoeia_id_list.length; j++) {
        var key_onomatopoeia = onomatopoeia_id_list[j];
        if (key_onomatopoeia in onomatopoeia_pk_count_obj) {
          onomatopoeia_pk_count_obj[key_onomatopoeia] += 1;
        }else {
          onomatopoeia_pk_count_obj[key_onomatopoeia] = 1;
        }
      }
    }

    // 名前とカウントからなる連想配列を作成
    var genre_name_count_obj = {};
    var onomatopoeia_name_count_obj = {};
    for(var genre_key in genre_pk_name_obj) {
      if (genre_key in genre_pk_count_obj) {
        var genre_name = genre_pk_name_obj[genre_key];
          genre_name_count_obj[genre_name] = genre_pk_count_obj[genre_key];
      }
    }

    for(var onomatopoeia_key in onomatopoeia_pk_name_obj) {
      if (onomatopoeia_key in onomatopoeia_pk_count_obj) {
        var onomatopoeia_name = onomatopoeia_pk_name_obj[onomatopoeia_key];
          onomatopoeia_name_count_obj[onomatopoeia_name] = onomatopoeia_pk_count_obj[onomatopoeia_key];
      }
    }

    return {g_obj: genre_name_count_obj,
            o_obj:onomatopoeia_name_count_obj, 
            dvds: dvd_count, 
            favs:fav_count};
  },


  /**
   * グラフを描画する
   * @param  {string} id           - 描画したいdiv要素のid
   * @param  {number} total_count  - 円グラフの合計値
   * @param  {Array} series_array  - 表示するデータ
   */
  draw_chart: function(id, total_count, series_array) {
    var intViewportWidth = window.innerWidth;

    new Chartist.Pie('#'+id, {
      series: series_array
    },
    {
      donut: true,
      donutWidth: 30,
      showLabel: false,
      width: intViewportWidth * 0.45,
      height: intViewportWidth * 0.45,
      total: total_count
    });
  }
};




/************************************************************
                        setting.html
 ************************************************************/
var Setting = {

  /**
   * 設定画面の描画に必要な情報を取得して表示を行う
   */
  show_contents: function() {
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var email = storage.getItem(ID.get_localStorage_ID().email);
    var adult = storage.getItem(ID.get_localStorage_ID().adult);

    var callback = function() {
      DB_method.count_record('profile_img').then(function(count_result) {
        // ユーザ名とメールアドレスの表示
        document.getElementById(ID.get_setting_ID().username).innerHTML = username;
        document.getElementById(ID.get_setting_ID().email).innerHTML = email;

        // アダルト作品のフラグからチェック状態を変更
        var adult_check = document.getElementById(ID.get_setting_ID().adult_check);
        if (adult === 'true') {
          adult_check.setAttribute('checked', 'checked');
        }else {
          adult_check.removeAttribute('checked');
        }

        // チェック状態が変更されるたびに保存を行うイベントを登録
        Setting.add_event_adult_check();

        var query = '';
        if (count_result === 0) {
          var img_html = document.getElementById(ID.get_setting_ID().profile_img);

          Utility.local_image_to_base64(img_html.src).then(function(base64) {
            return base64;
          })
          .then(function(base64) {
            query = 'INSERT INTO profile_img(img) VALUES(?)';
            return DB_method.single_statement_execute(query, [base64]);
          })
          .then(function(result) {
            console.log(result);
          })
          .catch(function(err) {
            console.log(err);
          });
        }else {
          var profile_img = document.getElementById(ID.get_setting_ID().profile_img);

          // 初期設定している画像がローカルから取得した画像を反映するまで表示されないようにする
          profile_img.src = '';

          query = 'SELECT img FROM profile_img WHERE id = 1';

          DB_method.single_statement_execute(query, []).then(function(result) {
            Utility.base64_to_image(result.rows.item(0).img, function(img) {
              profile_img.src = img.src;
            });
          })
          .catch(function(err) {
            console.log(err);
          });
        }
      })
      .catch(function(err) {
        console.log(err);
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    };
    
    Utility.check_page_init(ID.get_setting_ID().page_id,callback);
    Utility.push_page(ID.get_setting_ID().tmp_id, 'lift', 0, '');
  },


  /**
   * アダルトのチェックボタンが変更されるたびに、
   * ローカルへ保存するイベントを登録する
   */
  add_event_adult_check: function() {
    document.addEventListener('change', function(event) {
      if (event.target.id === ID.get_setting_ID().adult_check) {
        console.log(event.target.id + ' is changed ' + event.value);

        // チェック状態が変更されたらローカルDBへ保存
        var storage = window.localStorage;
        storage.setItem(ID.get_localStorage_ID().adult, event.value);
      }
    });
  },


  /**
   * パスワード、メールアドレス、性別の変更が完了した際に表示されるアラートを非表示にしてpop_pageを行う
   * @param  {[String]} id [アラートのid]
   */
  alert_hide: function(id) {
    var alert = document.getElementById(id);
    alert.hide();
    Utility.pop_page();
  },


  /**
   * プロフ画像の選択、ローカルとサーバへの保存を行う
   */
  tap_profile_img: function() {
    var cameraSuccess = function(image) {
      Utility.show_spinner(ID.get_setting_ID().page_id);

      var storage = window.localStorage;
      var query = 'UPDATE profile_img SET img = ? WHERE id = 1';
      var data = 'data:image/jpeg;base64,'+image;
      var api_request_data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "img": data
      };
      var promises =
      [
        DB_method.single_statement_execute(query, [data]),
        Utility.FiNote_API('update_profile_img', api_request_data, 'POST', 'v1')
      ];

      Promise.all(promises).then(function() {
        Utility.stop_spinner();

        // プロフィール画像を描画
        var img = document.getElementById(ID.get_setting_ID().profile_img);
        img.src = data;
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    };

    var cameraError = function(message) {
      console.log('Camera Error: ' + message);
    };

    var options = {
      quality: 25,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.PICTURE,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: window.innerWidth * 0.2
    };

    // 写真の選択を行う
    navigator.camera.getPicture(cameraSuccess, cameraError, options);
  }
};


app.initialize();

// ユーザ情報画面を表示するたびに、DBからデータを取得して表示データを更新する
User.show_event(ID.get_user_ID().page_id, User.show_contents);
Social.run_draw_get_recently_movie_list(ID.get_social_ID().page_id);