/************************************************************
                            Cordova
 ************************************************************/
var app = {
  initialize: function() {
    this.bindEvents();
  },


  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    setTimeout(function() {
      navigator.splashscreen.hide();}, 500);
  },


  onDeviceReady: function() {
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
                            ID
 ************************************************************/

/**
 * js内で参照するIDをまとめたオブジェクト
 * @type {Object}
 */
var ID = {
  get_index_ID: function() {
      return {tmp_id: 'index.html', page_id: 'index'};
  },


  get_top_ID: function() {
      return {
        tmp_id: 'top.html', page_id: 'top',
        toolbar_center: 'carousel_toolbar_center', carousel: 'top_carousel'
    };
  },


  get_tab_ID: function() {
      return {tmp_id: 'tab.html', page_id: 'tab'};
  },


  get_signin_ID: function() {
      return {
        username: 'signin_username', password: 'signin_password',
        signin_button: 'signin_button', signin_carousel: 'signin_carousel'
    };
  },


  get_signup_ID: function() {
      return {
        tmp_id: 'signup.html',
        page_id: 'signup',
        signup_button: 'signup_button',
        list_id: 'signup_list',
        username: 'username',
        password: 'password',
        email: 'email',
        birthday: 'birthday',
        success_alert: 'signup-alert-success',
        error_message: 'error-message',
        radio: 'radio_m'
    };
  },


  get_movies_ID: function() {
      return {
        tmp_id: 'movies.html',
        page_id: 'movies',
        nodata_message: 'nodata_message',
        nodata_message_p: 'nodata_message_p',
        list: 'movie_collection_list',
        reset_button: 'movies_reset_button',
        search_input: 'search_local_movies_input',
        list_header: 'movies_list_header',
        search_area: 'movies_search_area'
    };
  },


  get_movies_detail_ID: function() {
      return {
        tmp_id: 'movies_detail.html', page_id: 'movies_detail',
        poster: 'detail_poster_area', detail: 'movie_detail_area',
        alert: 'success_sns_alert_detail', modal: 'modal_detail',
        modal_poster: 'modal_poster'
    };
  },


  get_feeling_ID: function() {
      return {
        tmp_id: 'feeling.html', page_id: 'feeling',
        toolbar: 'feeling_toolbar_left', nodata_message: 'feeling_nodata_message',
        caution_message: 'feeling_caution_message', list: 'feeling_list',
        add_dialog: 'feeling_add_dialog', edit_dialog: 'feeling_edit_dialog',
        add_button: 'feeling_add_button', edit_button: 'feeling_edit_button',
        input: 'feeling_input_name', edit_input: 'feeling_edit_input_name'
    };
  },


  get_movieadd_search_ID: function() {
      return {
        form: 'search_movie_title', nodata_message: 'movieadd_no_match_message',
        reset: 'movieadd_reset_button', list: 'movieadd_search_list',
        exist_alert: 'tap_exist_movie_list'
    };
  },


  get_moveadd_ID: function() {
      return {
        tmp_id: 'movieadd.html', page_id: 'movieadd', poster: 'movieadd_card',
        detail_info: 'movie_detail_info', add_button: 'movieadd_add_button',
        feeling_button: 'movieadd_pushfeeling_button',
        dvd_button: 'movieadd_pushdvd_button',
        share_button: 'movieadd_share_button',
        show_info_button: 'movieadd_show_info_button',
        back_button: 'movieadd_back_button', feeling_number: 'list_number',
        success_alert: 'success_movieadd_alert',
        success_sns_alert: 'success_sns_alert'
    };
  },


  get_movieadd_status_ID: function() {
      return {
        tmp_id: 'movieadd_status.html', page_id: 'movieadd_status',
        dvd: 'dvd_switch', fav: 'fav_switch',
        toolbar: 'status_toolbar_left', small_message: 'small_message'
    };
  },


  get_user_ID: function() {
      return {
        tmp_id: 'user.html', page_id: 'user', movies_number: 'movies_count_number',
        dvds_number: 'dvds_count_number',
        favorites_number: 'favorites_count_number',
        onomatopoeia_top3: 'onomatopoeia_top3', genre_top3: 'genre_top3',
        chart1: 'chart1', chart2: 'chart2', graph_area: 'user_graph_area'
    };
  },


  get_setting_ID: function() {
      return {
        tmp_id: 'setting.html',
        page_id: 'setting',
        username: 'user_username',
        email: 'user_email',
        adult_check: 'adult_check',
        profile_img: 'profile_img'
    };
  },


  get_change_password_ID: function() {
      return {
        tmp_id: 'change_password.html',
        page_id: 'change_password',
        now_password: 'now_password',
        new_password: 'new_password',
        re_new_password: 're_new_password',
        submit_password: 'submit_change_password',
        success_alert: 'change_password_success_alert'
    };
  },


  get_change_email_ID: function() {
      return {
        tmp_id: 'change_email.html', page_id: 'change_email',
        input_new_email: 'new_email', submit_email: 'submit_change_email',
        success_alert: 'change_email_success_alert'
    };
  },


  get_change_sex_ID: function() {
      return {
        tmp_id: 'change_sex.html', page_id: 'change_sex',
        radio_m: 'change_m', radio_f: 'change_f',
        success_alert: 'change_sex_success_alert'
    };
  },


  get_utility_ID: function() {
      return {navigator: 'myNavigator'};
  },

  get_localStorage_ID: function() {
      return {
        username: 'username',
        password: 'password',
        email: 'email',
        birthday: 'birthday',
        sex: 'sex',
        adult: 'adult',
        token: 'token',
        profile_img: 'profile_img',
        signup_flag: 'signup_flag'
    };
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
      Movies.draw_movie_content();
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

    if (username.length === 0 || email.length === 0 || password.length < 6) {
      Index.formcheck[0] = false;
    }else{
      Index.formcheck[0] = true;
    }
    
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
      if (event.target.id == 'top_carousel') {
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

      promises.reduce(function(prev, curr, index, array) {
        return prev.then(curr);
      }, Promise.resolve())
      .then(function(result) {
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
        Movies.draw_movie_content();
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
        if (Signin.exist.movie_title_array.indexOf(movie.movie__title) == -1) {
          // 画像のダウンロード
          var base_url = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2';
          var image = new Image();
          image.src = base_url + movie.movie__poster_path;
          image.onload = function () {
            var image_b64 = '';

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
            }).then(function(insert_result) {
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

            if (now_genre_id.indexOf(genre_id) == -1) {
              new_genre_id = result[2].rows.item(0).genre_id + ',' + genre_id;
            }else {
              new_genre_id = now_genre_id;
            }

            if (now_onomatopoeia_id.indexOf(onomatopoeia_id) == -1) {
              new_onomatopoeia_id = result[2].rows.item(0).onomatopoeia_id + ',' + onomatopoeia_id;
            }else {
              new_onomatopoeia_id = now_onomatopoeia_id;
            }

            query_exist = 'UPDATE movie SET genre_id = ?, onomatopoeia_id = ? WHERE tmdb_id = ?';

            return DB_method.single_statement_execute(query_exist, [new_genre_id, new_onomatopoeia_id, Number(movie.movie__tmdb_id)]);
          })
          .then(function(update_result) {
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
   * @param  {string} movie - サーバから取得したBackUp1レコード
   * @return {Object}       - DBへ問い合わせをするpromiseのarray,
                              ジャンルのINSERTを行うかのフラグ,
                              オノマトペのINSERTを行うかのフラグ
   */
  create_genre_onomatopoeia_query: function(movie) {
    var genre_insert_flag = false;
    var onomatopoeia_insert_flag = false;
    var query = '';
    var promises = [];

    if (Signin.exist.genre_array.indexOf(movie.movie__genre__name) == -1) {
      genre_insert_flag = true;
      query = 'INSERT INTO genre(genre_id, name) VALUES(?,?)';
      promises.push(DB_method.single_statement_execute(query, [movie.movie__genre__genre_id, movie.movie__genre__name]));
    }else {
      genre_insert_flag = false;
      query = 'SELECT id from genre WHERE name = ?';
      promises.push(DB_method.single_statement_execute(query, [movie.movie__genre__name]));
    }

    // ローカルDBにオノマトペが保存しているかに応じてクエリを変える
    if (Signin.exist.onomatopoeia_array.indexOf(movie.onomatopoeia__name) == -1) {
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
  /**
   * 自動ログイン後に映画一覧画面の表示を行う
   */
  draw_movie_content: function() {
    //自動ログイン
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var signup_flag = storage.getItem(ID.get_localStorage_ID().signup_flag);
    var token = storage.getItem(ID.get_localStorage_ID().token);

    //ユーザ情報が存在する場合はローディング画面を表示する
    var callback = function(){
      if (signup_flag == 'true') {
        document.getElementById(ID.get_index_ID().page_id).innerHTML = '<img  src="img/splash.gif" alt="" / width="100%" height="100%">';
      }
    };
    Utility.check_page_init(ID.get_index_ID().page_id,callback);

    var data = {
      "username": username,
      "token": token
    };
    

    Utility.FiNote_API('sign_in_with_token', data, 'POST', 'v1').then(function(result){
      // ログイン後に映画情報をデータベースから取得
      var query = 'SELECT tmdb_id FROM movie';
      return DB_method.single_statement_execute(query,[]);
    })
    .then(function(movie_result) {
      var movie_count = movie_result.rows.length;
      var draw_content = function(){};

      //ローカルに保存されている映画情報の件数で表示内容を変える
      if (movie_count === 0) {
        draw_content = Movies.draw_no_data_message;
      }else {
        Global_variable.movie_update_flag = true;
        draw_content = Movies.update_movies;
      }

      Utility.check_page_init(ID.get_movies_ID().page_id,draw_content);
    })
    .then(function() {
      Utility.push_page(ID.get_tab_ID().tmp_id,'fade',0, '');
    })
    .catch(function(err) {
      //ログインエラー or レコード件数取得エラー
      console.log(err);
    });
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
    return new Promise(function(resolve,reject) {
      DB_method.count_record('movie').then(function(movie_count_result) {
        //result[0]：movie
        //result[1]：genre
        //result[2]：onomatopoeia

        var movie_collection_list = document.getElementById(ID.get_movies_ID().list);
        movie_count = result[0].rows.length;

        var lists_html = '';
        for(var i = 0; i < movie_count; i++) {
          var movie_record = result[0].rows.item(i);
          var button_class = {dvd:'', fav:''};

          if (movie_record.dvd == 1) {
            button_class.dvd = 'brown_color';
          }else {
            button_class.dvd = 'gray_color';
          }

          if (movie_record.fav == 1) {
            button_class.fav = 'brown_color';
          }else {
            button_class.fav = 'gray_color';
          }

          var onomatopoeia_id_list = movie_record.onomatopoeia_id.split(',');
          var onomatopoeia_name_list = [];
          var onomatopoeia_names = '';
          for(var j = 0; j < result[2].rows.length; j++) {
            var onomatopoeia = result[2].rows.item(j);
            if (onomatopoeia_id_list.indexOf(String(onomatopoeia.id)) != -1) {
              onomatopoeia_name_list.push(onomatopoeia.name);
            }
          }

          onomatopoeia_names = onomatopoeia_name_list.join('、');

          var add_month = ('00' + movie_record.add_month).slice(-2);
          var add_day = ('00' + movie_record.add_day).slice(-2);
          var list = '<ons-list-item modifier="longdivider">'+
                     '<div class="left">'+
                     '<img class="list_img" src="' + movie_record.poster + '">'+
                     '</div>'+

                     '<div class="center">'+
                     '<span class="list-item__title list_title">'+
                     movie_record.title+
                     '</span>'+
                     '<span class="list-item__subtitle list_sub_title">'+
                     onomatopoeia_names+
                     '</span>'+
                     '<span class="list-item__subtitle list_sub_title_small">'+
                     '追加日:'+
                     movie_record.add_year+'-'+
                     add_month+'-'+
                     add_day+
                     '</span>'+
                     '</div>'+

                     '<div class="right">'+
                     '<ons-row class="list_button_row">'+
                     '<ons-col>'+
                     '<ons-button class="' + button_class.dvd + '" id="dvd_'+ movie_record.id +'" onClick="Movies.tap_dvd_fav(this.id,0)" modifier="quiet">'+
                     '<ons-icon icon="ion-disc" size="20px"></ons-icon>'+
                     '</ons-button>'+
                     '</ons-col>'+

                     '<ons-col>'+
                     '<ons-button class="' + button_class.fav + '" id="fav_' + movie_record.id + '" onClick="Movies.tap_dvd_fav(this.id,1)" modifier="quiet">'+
                     '<ons-icon size="20px" icon="ion-android-favorite"></ons-icon>'+
                     '</ons-button>'+
                     '</ons-col>'+

                     '<ons-col>'+
                     '<ons-button class="brown_bg_color_quiet" id=' + movie_record.id + ' onClick="Movies_detail.show_contents(this.id)" modifier="quiet">'+
                     '<ons-icon size="20px" icon="ion-more"></ons-icon>'+
                     '</ons-button>'+
                     '</ons-col>'+
                     '</ons-row>'+
                     '</div>'+
                     '</ons-list-item>';

          lists_html += list;
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
   * 登録済みの映画がないメッセージを表示する関数
   */
  draw_no_data_message: function() {
    nodata_message_p.innerHTML = '登録された映画はありません';
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
      var promises = [
        DB_method.single_statement_execute(query_obj.query,query_obj.data),
        Utility.FiNote_API('status_update', request_data, 'POST', 'v1')
      ];

    return DB_method.single_statement_execute(query_obj.query,query_obj.data);
    }).then(function(result) {
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
    if (event_name == 'focus') {
      document.getElementById(ID.get_movies_ID().search_input).addEventListener('input', Movies.show_hide_reset_button, false);

    } else if (event_name == 'blur') {
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
        Movies.draw_movies_list(result).then(function(resolve) {
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
      if (onomatopoeia_id_list.indexOf(String(onomatopoeia_obj.id)) != -1) {
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

    var callback = function(){
    var poster_html = '<img onClick="Movies_detail.tap_img(this)" class="poster" src="' + movie_record.poster + '">';
    document.getElementById(ID.get_movies_detail_ID().poster).innerHTML = poster_html;

    var movie_detail_html = '<ons-list modifier="inset">'+
                            '<ons-list-header>ステータス</ons-list-header>'+
                            '<ons-list-item onClick="Movies_detail.push_page_feeling(\''+onomatopoeia_text+'\')" modifier="chevron" tappable>'+
                            onomatopoeia_text+
                            '</ons-list-item>'+

                            '<ons-list-item onClick="Movies_detail.push_page_status()" modifier="chevron" tappable>'+
                            '<ons-icon icon="ion-disc" class="list-item__icon brown_bg_color_quiet"></ons-icon>'+
                            dvd+
                            '<ons-icon icon="ion-android-favorite" class="list-item__icon brown_bg_color_quiet"></ons-icon>'+
                            fav+
                            '</ons-list-item>'+
                            '</ons-list>'+

                            '<ons-list modifier="inset">'+
                            '<ons-list-header>映画情報</ons-list-header>'+
                            '<ons-list-item>'+
                            movie_record.title+
                            '</ons-list-item>'+

                            '<ons-list-item class="'+ class_name +'">'+
                            overview+
                            '</ons-list-item>'+

                            '<ons-list-item class="small_overview">'+
                            '追加日: ' + movie_record.add_year + '-' + ('00' + movie_record.add_month).slice(-2) + '-' + ('00' + movie_record.add_day).slice(-2)+
                            '</ons-list-item>'+
                            '</ons-list>'+

                            '<ons-list modifier="inset">'+
                            '<ons-list-header>SNS</ons-list-header>'+
                            '<ons-list-item tappable onClick="Movies_detail.sns_share()">'+
                            '<ons-icon icon="ion-share" class="list-item__icon brown_bg_color_quiet"></ons-icon>'+
                            'この映画をシェアする'+
                            '</ons-list-item>'+
                            '</ons-list>'+

                            '<ons-button onClick="Movies_detail.tap_delete_button()" class="delete_button" modifier="large">'+
                            '削除'+
                            '</ons-button>';
    document.getElementById(ID.get_movies_detail_ID().detail).innerHTML = movie_detail_html;
    };

    return callback;
  },


  /**
   * 既に登録されている気分を読み込んだ気分リストを表示させる
   * @param  {[String]} onomatopoeia_text [画面表示用になっているオノマトペのテキスト]
   */
  push_page_feeling: function(onomatopoeia_text) {
    var onomatopoeia_name_list = onomatopoeia_text.split('、');
    Movieadd.userdata.feeling_name_list = onomatopoeia_name_list;

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
      if (result.completed === true && result.app != 'com.apple.UIKit.activity.PostToFacebook') {
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
      if (event.enterPage.pushedOptions.page == ID.get_movies_detail_ID().tmp_id) {
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
          promises = [Movieadd.set_onomatopoeia_local(feeling_name_list), Utility.FiNote_API('onomatopoeia_update', request_data, 'POST', 'v1')];
        }

        Promise.all(promises).then(function(results) {
          var insertID_list = results[0];
          var onomatopoeia_csv = '';
          //オノマトペIDのcsvを作成
          for(i = 0; i < insertID_list.length; i++) {
            onomatopoeia_csv += insertID_list[i] + ',';
          }
          onomatopoeia_csv = onomatopoeia_csv.substr(0, onomatopoeia_csv.length-1);

          var query = 'UPDATE movie SET onomatopoeia_id = ? WHERE tmdb_id = ?';
          var query_data = [onomatopoeia_csv, movie.tmdb_id];

          return DB_method.single_statement_execute(query, query_data);
        })
        .then(function(result) {
          var query_movie = 'SELECT * from movie WHERE tmdb_id = ?';
          var query_onomatopoeia = 'SELECT * from onomatopoeia';

          promises = [
            DB_method.single_statement_execute(query_movie, [movie.tmdb_id]),
            DB_method.single_statement_execute(query_onomatopoeia, []),
          ];

          return promises;
        })
        .then(function(promises) {
          Promise.all(promises).then(function(results) {
            var movie_record = results[0].rows.item(0);
            var result_onomatopoeia = results[1];

            return new Promise(function(resolve, reject) {
              var callback = Movies_detail.create_show_contents_callback(movie_record, result_onomatopoeia);
              callback();
              resolve('resolve');
            });
          })
          .then(function(result) {
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
      if (event.enterPage.pushedOptions.page == ID.get_movies_detail_ID().tmp_id) {
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
          Utility.FiNote_API('status_update', request_data, 'POST', 'v1')
        ];

        Promise.all(promises).then(function(result) {
          var query_movie = 'SELECT * from movie WHERE id = ?';
          var query_onomatopoeia = 'SELECT * from onomatopoeia';
          var promises = [
            DB_method.single_statement_execute(query_movie,[movie_pk]),
            DB_method.single_statement_execute(query_onomatopoeia, [])
          ];

          return promises;
        })
        .then(function(promises) {
          Promise.all(promises).then(function(results) {
            var movie_record = results[0].rows.item(0);
            var result_onomatopoeia = results[1];

            return new Promise(function(resolve, reject) {
              var callback = Movies_detail.create_show_contents_callback(movie_record, result_onomatopoeia);
              callback();
              resolve('resolve');
            });
          })
          .then(function(result) {
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

      Promise.all(promises).then(function(result) {
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
  show_list_data: [],     //listに表示中のデータを格納する

  /**
   * Searchボタン(改行)を押した際に動作
   */
  click_done: function(){
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
    if (element.getAttribute('id') == ID.get_movieadd_search_ID().form) {
      document.getElementById(ID.get_movieadd_search_ID().form).blur();
      document.getElementById(ID.get_movieadd_search_ID().form).focus();

      //テキスト入力確定後にリセットボタンを押した時
    }else {
      document.getElementById(ID.get_movieadd_search_ID().form).focus();
    }
  },


  /**
   * 検索フォームにフォーカス時、フォーカスが外れた時のイベントを設定する
   * @param {[String]} event_name [focusまたはblurを受け取る]
   */
  set_event_movieadd_search_input: function(event_name) {
    if (event_name == 'focus') {
      document.getElementById(ID.get_movieadd_search_ID().form).addEventListener('input', Movieadd_search.show_hide_reset_button, false);

    } else if (event_name == 'blur') {
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
   * 検索窓にテキストを入力するたびに入力したテキストを取得する
   * 検索窓の文字数が1以上ならリセットボタンを表示させる
   */
  get_search_movie_title_val: function(){
    var text = document.getElementById(ID.get_movieadd_search_ID().form).value;
    var no_match_message = document.getElementById(ID.get_movieadd_search_ID().nodata_message);
    no_match_message.innerHTML = '';

    if (text.length > 0) {
      //テキストエリアのスピナー表示
      Utility.show_spinner(ID.get_movieadd_search_ID().nodata_message);

      //日本語と英語のリクエスト、ローカルDBから記録した映画リストの取得を行う
      var query = 'SELECT tmdb_id, dvd FROM movie';
      var promises = [Movieadd_search.create_request_movie_search(text,'ja'),Movieadd_search.create_request_movie_search(text,'en'), DB_method.single_statement_execute(query,[])];

      Promise.all(promises).then(function(results) {
        //idだけの配列を作成
        var local_tmdb_id = [];
        var local_dvd = [];
        for(var i = 0; i < results[2].rows.length; i++) {
            local_tmdb_id.push(results[2].rows.item(i).tmdb_id);
            local_dvd.push(results[2].rows.item(i).dvd);
        }

        Utility.stop_spinner();

        //検索結果として表示するデータを生成する
        var list_data = Movieadd_search.create_list_data(results[0],results[1]);
        Movieadd_search.show_list_data = list_data;

        //データによって表示するコンテンツを動的に変える
        if (list_data.length === 0) {
          no_match_message.innerHTML = '検索結果なし';          
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
            if (index == -1) {
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

            var list_item_doc =
            '<ons-list-item id="'+ i +'" modifier="' + modifier + '"'+' ' + tappable + '>'+
            '<div class="left">'+
            '<img id="'+ i +'_img" class="list_img_large" src="'+ list_data_poster[i] +'">'+
            '</div>'+

            '<div class="center">'+
            '<span class="list_title_bold">'+ title +'</span>'+
            '<span id="overview_'+i +'" class="list_sub_title_small">'+ list_data[i].overview +'</span>'+
            '<span class="list_sub_title_small">'+ movie_releasedate +'</span>'+
            '</div>'+
            exist_message+
            '</ons-list-item>';

            list_doc += list_item_doc;
          }

          movieadd_SearchList.innerHTML = list_doc;

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
              document.getElementById('overview_'+i).innerHTML += '…';
            }
          }
        }

      }, function(reason) {
        console.log(reason);
      });

    } else {
      no_match_message.innerHTML = '';
    }
  },

  
  /**
   * 映画をタイトルで検索するリクエストを生成して実行する
   * @param  {string} movie_title   - 検索したい映画タイトル
   * @param  {string} language      - jaで日本語情報、enで英語情報
   * @return {string}               - 検索結果をjsonに変換したもの
   */
  create_request_movie_search: function(movie_title, language){
    return new Promise(function(resolve, reject) {
      var storage = window.localStorage;
      var adult = storage.getItem(ID.get_localStorage_ID().adult);
      console.log(adult);

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
    if (img_url.indexOf('noimage.png') != -1) {
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
    var few = String(result).split(".")[1];

    //星と数値を書き込む
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
          for(i = 0; i < genre_pk_array.length; i++) {
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
        for(i = 0; i < results.rows.length; i++) {
          genre_pk_list_local.push(results.rows.item(i).id);
          genre_id_list_local.push(results.rows.item(i).genre_id);
        }

        //ローカルから取得したリストにジャンルID(ユーザ登録)が含まれていなければpromiseに登録する
        var promises = [];
        for(i = 0; i < genre_id_list.length; i++) {
          if (genre_id_list_local.indexOf(genre_id_list[i]) == -1) {
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
          for(i = 0; i < results.rows.length; i++) {
            onomatopoeia_id_list_local.push(results.rows.item(i).id);
            onomatopoeia_name_list_local.push(results.rows.item(i).name);
          }

          //ローカルから取得したリストにオノマトペ(ユーザ登録)が含まれていなければpromiseに登録する
          var promises = [];
          for(var i = 0; i < onomatopoeia_name_list.length; i++) {
            if (onomatopoeia_name_list_local.indexOf(onomatopoeia_name_list[i]) == -1) {
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
      if (result.completed === true && result.app != 'com.apple.UIKit.activity.PostToFacebook') {
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
      if (event.target.id == ID.get_feeling_ID().add_dialog) {
        document.getElementById(ID.get_feeling_ID().add_button).setAttribute('disabled', 'disabled');
        document.getElementById(ID.get_feeling_ID().input).focus();
      }else if (event.target.id == ID.get_feeling_ID().edit_dialog) {
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
    if (func_id == 'cancel') {
      document.getElementById(dialog_id).hide();
    }else if (func_id == 'add' ){
      var feeling_name = document.getElementById(ID.get_feeling_ID().input).value;
      feeling_name = feeling_name.replace(/\s+/g, '');

      //既出でない場合
      if (Movieadd.userdata.feeling_name_list.indexOf(feeling_name) == -1) {
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
      if (Movieadd.userdata.feeling_name_list.indexOf(value) == -1) {
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

      if (check_list[i] === true) {
        switch_dom.checked = true;
      }else {
        switch_dom.checked = false;
      }
    }
  },


  /**
   * movieadd_status.html(DVDの所持、お気に入り画面)を閉じる時にスイッチボタンの状態を一時保存する
   */
  close_movieadd_status: function(){
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

    Utility.pop_page();
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
      if (event.target.id == page_id) {
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


      // オノマトペとジャンルの合計数をそれぞれ求める
      // グラフの描画関数に渡す配列を作成する
      var o_total = 0;
      var g_total = 0;
      var o_array_count = [];
      var g_array_count = [];
      for(var o_key in params.o_obj) {
        var o_value = params.o_obj[o_key];
        o_total += o_value;
        o_array_count.push(o_value);
      }

      for(var g_key in params.g_obj) {
        var g_value = params.g_obj[g_key];
        g_total += g_value;
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
          if (o_array_count[i] == params.o_obj[o_key]) {
            o_array_name.push(o_key);
            delete params.o_obj[o_key];
            break;
          }
        }
      }

      for(i = 0; i < g_array_count.length; i++) {
        for(g_key in params.g_obj) {
          if (g_array_count[i] == params.g_obj[g_key]) {
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


      // チャートの描画
      User.draw_chart(ID.get_user_ID().chart1, o_total, o_array_count);
      User.draw_chart(ID.get_user_ID().chart2, g_total, g_array_count);

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
      if (movie_record.dvd == 1) {
        dvd_count += 1;
      }

      if (movie_record.fav == 1) {
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
        var genre_count = genre_pk_count_obj[genre_key];
        genre_name_count_obj[genre_name] = genre_count;
      }
    }

    for(var onomatopoeia_key in onomatopoeia_pk_name_obj) {
      if (onomatopoeia_key in onomatopoeia_pk_count_obj) {
        var onomatopoeia_name = onomatopoeia_pk_name_obj[onomatopoeia_key];
        var onomatopoeia_count = onomatopoeia_pk_count_obj[onomatopoeia_key];
        onomatopoeia_name_count_obj[onomatopoeia_name] = onomatopoeia_count;
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

    var sum = function(a, b) { return a + b;};

    var chart = new Chartist.Pie('#'+id, {
      series: series_array
    }, {
      labelInterpolationFnc: function(value) {
        return Math.round(value / series_array.reduce(sum) * 100) + '%';
      },
      donut: true,
      donutWidth: 30,
      showLabel: true,
      width: intViewportWidth * 0.45,
      height: intViewportWidth * 0.45,
      total: total_count
    });

    chart.on('draw', function(data) {
      if(data.type === 'slice') {
        var pathLength = data.element._node.getTotalLength();

        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });

        var animationDefinition = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 300,
            from: -pathLength + 'px',
            to:  '0px',
            easing: Chartist.Svg.Easing.easeOutQuint,
            fill: 'freeze'
          }
        };

        if(data.index !== 0) {
          animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
        }

        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });

        data.element.animate(animationDefinition, false);
      }
    });

    chart.on('created', function() {
      chart.update.bind(chart);
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
        if (adult == 'true') {
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
      if (event.target.id == ID.get_setting_ID().adult_check) {
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
        Utility.FiNote_API('set_profile_img', api_request_data, 'POST', 'v1')
      ];

      Promise.all(promises).then(function(result) {
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





/************************************************************
                        change_password.html
 ************************************************************/
var Change_Password = {

  /**
   * パスワード画面へ遷移を行い、keyupイベントを登録する
   */
  initialize: function() {
    Utility.hideKeyboardAccessoryBar(false);

    //イベント登録
    var addevent = function(){
      document.getElementById(ID.get_change_password_ID().now_password).addEventListener('keyup',Change_Password.check_form);
      document.getElementById(ID.get_change_password_ID().new_password).addEventListener('keyup',Change_Password.check_form);
      document.getElementById(ID.get_change_password_ID().re_new_password).addEventListener('keyup',Change_Password.check_form);
    };

    Utility.check_page_init(ID.get_change_password_ID().page_id, addevent);
    Utility.push_page(ID.get_change_password_ID().tmp_id, '', 0, '');
  },


  /**
   * パスワード入力フォームの文字数を監視し、変更ボタンの無効・有効を切り替える
   */
  check_form: function() {
    var now_pass = document.getElementById(ID.get_change_password_ID().now_password).value;
    var new_pass = document.getElementById(ID.get_change_password_ID().new_password).value;
    var re_new_pass = document.getElementById(ID.get_change_password_ID().re_new_password).value;

    var submit_button = document.getElementById(ID.get_change_password_ID().submit_password);
    if (now_pass.length >= 6 && new_pass.length >= 6 && re_new_pass.length >= 6) {
      submit_button.removeAttribute('disabled');
    }else {
      submit_button.setAttribute('disabled', 'disabled');
    }
  },


  /**
   * 変更ボタンを押した際に、パスワード入力フォームのチェックを行い、
   * APIへリクエストを送信する。
   */
  tap_submit_button: function() {
    Utility.show_spinner(ID.get_change_password_ID().page_id);

    var now_pass = document.getElementById(ID.get_change_password_ID().now_password).value;
    var new_pass = document.getElementById(ID.get_change_password_ID().new_password).value;
    var re_new_pass = document.getElementById(ID.get_change_password_ID().re_new_password).value;
    var storage = window.localStorage;

    if (now_pass != storage.getItem(ID.get_localStorage_ID().password)) {
      Utility.show_error_alert('パスワード変更エラー', '現在のパスワードが間違っています', 'OK');
      Utility.stop_spinner();
    }else if(now_pass == new_pass) {
      Utility.show_error_alert('パスワード変更エラー', '現在のパスワードと新しいパスワードは同じにできません', 'OK');
      Utility.stop_spinner();
    }else if(new_pass != re_new_pass) {
      Utility.show_error_alert('パスワード変更エラー', '新しいパスワードの入力を再度確認してください', 'OK');
      Utility.stop_spinner();
    }else if(now_pass == storage.getItem(ID.get_localStorage_ID().password)) {
      var data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "now_password": now_pass,
        "new_password": new_pass
      };

      Utility.FiNote_API('change_password', data, 'POST', 'v1').then(function(token_obj) {
        var json_data = JSON.parse(token_obj);
        storage.setItem(ID.get_localStorage_ID().password, new_pass);
        storage.setItem(ID.get_localStorage_ID().token, json_data.token);

        Utility.stop_spinner();
        var alert = document.getElementById(ID.get_change_password_ID().success_alert);
        alert.show();
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    }
  }
};





/************************************************************
                       change_email.html
 ************************************************************/
var Change_Email = {

  /**
   * メールアドレス変更画面へ遷移を行い、イベントを登録する
   */
  initialize: function() {
    Utility.hideKeyboardAccessoryBar(true);

    //イベント登録
    var addevent = function(){
      document.getElementById(ID.get_change_email_ID().input_new_email).addEventListener('keyup',Change_Email.check_form);
    };

    Utility.check_page_init(ID.get_change_email_ID().page_id, addevent);
    Utility.push_page(ID.get_change_email_ID().tmp_id, '', 0, '');
  },


  /**
   * 新しいメールアドレス入力フォームのスペースを除く文字数に応じて、
   * 変更ボタンの有効・無効を切り替える
   */
  check_form: function() {
    var new_email = document.getElementById(ID.get_change_email_ID().input_new_email).value;
    new_email = new_email.replace(/\s+/g, '');

    var submit_button = document.getElementById(ID.get_change_email_ID().submit_email);
    if (new_email.length !== 0) {
      submit_button.removeAttribute('disabled');
    }else {
      submit_button.setAttribute('disabled', 'disabled');
    }
  },


  /**
   * メールアドレスのバリデーションをローカルでチェックし、
   * 問題がなければAPIへリクエストを送信し、
   * 返ってきた新しいメールアドレスをローカルに保存する
   */
  tap_submit_button: function() {
    Utility.show_spinner(ID.get_change_email_ID().page_id);

    var new_email = document.getElementById(ID.get_change_email_ID().input_new_email).value;

    if(Utility.validateMail(new_email)) {
      var storage = window.localStorage;
      var data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "new_email": new_email
      };

      Utility.FiNote_API('change_email', data, 'POST', 'v1').then(function(new_email_obj) {
        Utility.stop_spinner();

        // json形式にしてからローカルへ新しいメールアドレスを保存
        var json_data = JSON.parse(new_email_obj);
        storage.setItem(ID.get_localStorage_ID().email, json_data.new_email);

        // 新しいメールアドレスで設定画面の文字を上書き
        document.getElementById(ID.get_setting_ID().email).innerHTML = new_email;

        // メールアドレスの変更に成功した旨を伝えるアラートを表示
        var alert = document.getElementById(ID.get_change_email_ID().success_alert);
        alert.show();
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    }else {
      Utility.stop_spinner();
      Utility.show_error_alert('エラー', '有効なメールアドレスを入力してください', 'OK');
    }
  }
};





/************************************************************
                      change_sex.html
 ************************************************************/
var Change_Sex = {

  /**
   * ローカルに保存されている性別の値に応じて、チェック状態を変える。
   * その後、画面遷移を行う。
   */
  initialize: function() {
    var callback = function() {
      var storage = window.localStorage;
      var now_sex = storage.getItem(ID.get_localStorage_ID().sex);

      var radio_id = '';
      if (now_sex == 'M') {
        radio_id = ID.get_change_sex_ID().radio_m;
      }else {
        radio_id = ID.get_change_sex_ID().radio_f;
      }

      document.getElementById(radio_id).setAttribute('checked', 'checked');
    };

    Utility.check_page_init(ID.get_change_sex_ID().page_id, callback);
    Utility.push_page(ID.get_change_sex_ID().tmp_id, '', 0, '');
  },


  /**
   * 引き渡された性別の識別子をサーバとローカルに保存する
   * @param  {string} sex - M or F
   */
  save_data: function(sex) {
    Utility.show_spinner(ID.get_change_sex_ID().page_id);

    var storage = window.localStorage;
    var data = {
      "token": storage.getItem(ID.get_localStorage_ID().token),
      "new_sex": sex
    };

    Utility.FiNote_API('change_sex', data, 'POST', 'v1').then(function(sex_obj) {
      // json形式にしてからローカルへ新しい性別を保存
      var json_data = JSON.parse(sex_obj);
      storage.setItem(ID.get_localStorage_ID().sex, json_data.new_sex);

      Utility.stop_spinner();
      console.log(storage.getItem(ID.get_localStorage_ID().sex) + ' is seted.');

      // アラートの表示
      var alert = document.getElementById(ID.get_change_sex_ID().success_alert);
      alert.show();
    })
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('エラー発生', err, 'OK');
    });
  }
};





/************************************************************
                          SignOut
 ************************************************************/
var SignOut = {

  /**
   * サインアウトを実行する関数。
   * ローカルデータの全削除、全ページのリセット、トップページへの遷移
   */
  run_signout: function() {
    var func0 = function(){};
    var func1 = function(){
      Utility.show_spinner(ID.get_setting_ID().page_id);

      // ローカルデータの削除
      DB_method.delete_all_record();
      Utility.delete_localstorage();

      Utility.stop_spinner();

      // 全てのページをリセット
      document.getElementById(ID.get_utility_ID().navigator).resetToPage();

      Utility.show_confirm_alert('ログアウトの完了', 'ログアウトしました', ['OK'], Index.check_signup);
    };

    Utility.show_confirm_alert('ログアウトの確認', 'ログアウトしますか？', ['キャンセル', 'ログアウト'], func0, func1);
  }
};





/************************************************************
                          Utility
 ************************************************************/
/**
* 便利関数をまとめたオブジェクト
* @type {Object}
*/
var Utility = {

  /**
   * ローカルストレージの初期化をする
   */
  delete_localstorage: function(){
    var storage = window.localStorage;
    storage.removeItem('username');
    storage.removeItem('password');
    storage.removeItem('email');
    storage.removeItem('birthday');
    storage.removeItem('sex');
    storage.removeItem('signup_flag');
    storage.removeItem('adult');
    storage.removeItem('token');
  },


  /**
   * ローカルストレージの状態を表示する
   */
  show_localstorage: function(){
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var password = storage.getItem(ID.get_localStorage_ID().password);
    var email = storage.getItem(ID.get_localStorage_ID().email);
    var birthday = storage.getItem(ID.get_localStorage_ID().birthday);
    var sex = storage.getItem(ID.get_localStorage_ID().sex);
    var signup_flag = storage.getItem(ID.get_localStorage_ID().signup_flag);
    var adult = storage.setItem(ID.get_localStorage_ID().adult, false);
    var obj = {'username':username, 'password':password, 'email': email, 'birthday':birthday, 'sex':sex, 'signup_flag':signup_flag, 'adult': adult};
    console.log(obj);
  },


  /**
   * 指定したページの読み込み終了後に指定したcallbackを実行する
   * @param  {[String]}   pageid   [pageのid]
   * @param  {Function} callback [読み込み終了後に実行したいコールバック関数]
   */
  check_page_init: function(pageid,callback){
    document.addEventListener('init', function(event) {
      if (event.target.id == pageid) {
        console.log(pageid + ' is inited');
        callback();
        document.removeEventListener('init', arguments.callee);
      }
    });
  },


  /**
   * データベースのオブジェクトを返す    
   * @return {[Object]} [description]
   */
  get_database: function(){
    var db = window.sqlitePlugin.openDatabase({name: 'my_db.db', location: 'default'});
    return db;
  },


  /**
   * TMDBのAPIキーを返す
   * @return {[String]} [TMDBのAPIキー]
   */
  get_tmdb_apikey: function(){
    return 'dcf593b3416b09594c1f13fabd1b9802';
  },


  /**
   * htmlファイル、アニメーション、delay時間を指定するとアニメーションを行って画面遷移する
   * @param  {string} html_name      - 画面遷移したいhtmlファイル名
   * @param  {string} animation_name - アニメーション名
   * @param  {number} delaytime      - Timeoutの時間
   * @param  {Function} callback     - push_page実施後のコールバック
   */
  push_page: function(html_name, animation_name, delaytime, callback) {
    var showpage = function(){
      document.getElementById(ID.get_utility_ID().navigator).pushPage(html_name,
        { animation: animation_name,
          callback: callback 
        }
      );
    };

    setTimeout(showpage, delaytime);
  },


  /**
   * onsen uiのpopPageを実行する関数
   */
  pop_page: function(){
    document.getElementById(ID.get_utility_ID().navigator).popPage();
  },


  /**
   * ブラウザで強制的にログインするための関数
   */
  browser_signup: function(){
    var callback = function(){
      document.getElementById(ID.get_signup_ID().username).value = 'ブラウザユーザ';
      document.getElementById(ID.get_signup_ID().password).value = 'password';
      document.getElementById(ID.get_signup_ID().birthday).value = '1994';

      Index.formcheck[0] = true;
      Index.formcheck[1] = true;

      var storage = window.localStorage;
      storage.setItem(ID.get_localStorage_ID().username, document.getElementById(ID.get_signup_ID().username).value);
      storage.setItem(ID.get_localStorage_ID().password, document.getElementById(ID.get_signup_ID().password).value);
      storage.setItem(ID.get_localStorage_ID().birthday, Number(document.getElementById(ID.get_signup_ID().birthday).value));
      storage.setItem(ID.get_localStorage_ID().sex, 'M');
      storage.setItem(ID.get_localStorage_ID().signup_flag, true);
      storage.setItem(ID.get_localStorage_ID().adult, false);
    };
    Utility.check_page_init(ID.get_signup_ID().page_id,callback);
  },


  spinner: {},        //spinnerオブジェクト格納用

  /**
   * 指定した親要素にスピナーを表示する
   * @param  {string} parent - 親要素のid
   */
  show_spinner: function(parent){
    var opts = {
      lines: 13, //線の数
      length: 8, //線の長さ
      width: 3, //線の幅
      radius: 16, //スピナーの内側の広さ
      corners: 1, //角の丸み
      rotate: 74, //向き
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

    //重複表示を避けるため既にオブジェクトに格納されていない時のみ処理を行う
    if (Object.keys(Utility.spinner).length === 0) {
      //描画先の親要素
      var spin_target = document.getElementById(parent);
      //スピナーオブジェクト
      var spinner = new Spinner(opts);
      Utility.spinner = spinner;
      //スピナー描画
      spinner.spin(spin_target);
    }
  },


  /**
   * スピナーの表示を止める
   */
  stop_spinner: function(){
    Utility.spinner.spin();
    Utility.spinner = {};
  },


  /**
   * エラーのアラートを表示する
   * @param  {string} title       - タイトル
   * @param  {string} message     - メッセージ
   * @param  {string} buttonLabel - ボタンのラベル
   */
  show_error_alert: function(title,message,buttonLabel) {
    ons.notification.alert(
    {
        title: title,
        message: message,
        buttonLabel: buttonLabel
    });
  },


  /**
   * confirmアラートを表示する
   * @param  {string} title        - タイトル
   * @param  {string} message      - メッセージ
   * @param  {Array} buttonLabels  - ボタンのラベルを文字列で格納した配列
   * @param  {Function} func0      - ボタンのラベル配列の0番目をタップすると実行される関数
   * @param  {Function} func1      - ボタンのラベル配列の1番目をタップすると実行される関数
   */
  show_confirm_alert: function(title, message, buttonLabels, func0, func1) {
    ons.notification.confirm(
    {
        title: title,
        message: message,
        buttonLabel: buttonLabels
    })
    .then(function(index) {
      if (index === 0) {
        func0();
      }else {
        func1();
      }
    });
  },


  /**
   * TMDBに関するエラーアラートを表示する
   * @param  {number} err_status - エラーのHTTPstatus
   */
  show_tmdb_error: function(err_status) {
    switch(err_status) {
      case 0:
        Utility.show_error_alert('通信エラー','ネットワーク接続を確認して下さい','OK');
        break;
      case 401:
        Utility.show_error_alert('APIエラー','有効なAPIキーを設定して下さい','OK');
        break;
      case 404:
        Utility.show_error_alert('Not found','リソースが見つかりませんでした','OK');
        break;
      default:
        Utility.show_error_alert('不明なエラー','不明なエラーが発生しました','OK');
        break;
    }
  },


  /**
   * 画像をbase64エンコードする
   * @param  {Image} image_src  - img要素
   * @param  {string} mine_type - データ型
   * @return {Promise}          - 成功時：画像をbase64エンコードした文字列
   */
  image_to_base64: function(image_src, mine_type) {
    return new Promise(function(resolve,reject) {
      var canvas = document.createElement('canvas');
      canvas.width  = image_src.width;
      canvas.height = image_src.height;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(image_src, 0, 0);

      resolve(canvas.toDataURL(mine_type));
    });
  },


  /**
   * ローカルのImage Fileをbase64へ変換する
   * @param  {string} image_path - 変換したい画像のパス
   * @return {Promise}           - base64文字列
   */
  local_image_to_base64: function(image_path) {
    return new Promise(function(resolve,reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", image_path, true);
      xhr.responseType = "blob";
      xhr.onload = function (e) {
        console.log(this.response);
        var reader = new FileReader();
        reader.onload = function(event) {
         var res = event.target.result;
         resolve(res);
        };
        var file = this.response;
        reader.readAsDataURL(file);
      };
      xhr.send();
    });
  },
  

  /**
   * base64をデコードする
   * @param  {string}   base64img - base64の文字列
   * @param  {Function} callback  - 変換後のコールバック
   */
  base64_to_image: function(base64img, callback) {
    var img = new Image();
    img.onload = function() {
      callback(img);
    };
    img.src = base64img;
  },


  /**
   * 引数で渡されたidと属性を一括でセットする
   * @param {Array} id_list           - 属性をセットしたいidを含んだ配列
   * @param {string} attribute_name_0 - 属性名
   * @param {string} attribute_name_1 - 属性値
   */
  setAttribute_list_object: function(id_list, attribute_name_0, attribute_name_1) {
    for(var i = 0; i < id_list.length; i++) {
      document.getElementById(id_list[i]).setAttribute(attribute_name_0, attribute_name_1);
    }
  },


  /**
   * 複数のオブジェクトから同じattributeを取り除く
   * @param  {Array} id_list          - 属性を取り除きたいidを格納した配列
   * @param  {string} attribute_name  - 取り除きたい属性名
   */
  removeAttribute_list_object: function(id_list, attribute_name) {
    for(var i = 0; i < id_list.length; i++) {
      document.getElementById(id_list[i]).removeAttribute(attribute_name);
    }
  },


  /**
   * キーボードのアクセサリーバーの表示・非表示を設定する
   * @param  {bool} bool - description
   */
  hideKeyboardAccessoryBar:function(bool) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(bool);
  },


  /**
   * FiNoteのAPIを実行してpromiseを受け取る
   * @param {string} api_name - 利用するAPIの名前
   * @param {string} data     - postする場合のデータ
   * @param {string} method   - postなどのメソッド名
   * @param {string} version  - apiのバージョン(v1, v2…)
   */
  FiNote_API: function(api_name, data, method, version) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      var request_url = 'http://kentaiwami.jp/FiNote/api/' + version + '/' + api_name + '/';
      request.open(method, request_url);
      request.setRequestHeader("Content-type", "application/json");

      request.onreadystatechange = function () {
        if (this.readyState === 4) {
          if(this.status === 200) {
            resolve(this.responseText);
          }else {
            reject(this.responseText);
          }
        }
      };

      request.send(JSON.stringify(data));
    });
  },


  /**
   * できるだけ日本語の映画タイトルを返す関数
   * @param  {string} movie_json - TMDBから取得した映画データ
   * @return {string}            - 映画のタイトル
   */
  get_movie_ja_title: function(movie_json) {
    if (movie_json.original_language == 'ja') {
      if (movie_json.original_title !== '') {
        return movie_json.original_title;
      }else {
        return movie_json.title;
      }
    }else {
      if (movie_json.title !== '' ) {
        return movie_json.title;
      }else {
        return movie_json.original_title;
      }
    }
  },


  /**
   * by kawanet(https://gist.github.com/kawanet/5553478)
   * ひらがなをカタカナに変換する
   * @param  {string} src - 変換したい文字列
   * @return {string}     - 文字列中のひらがなをカタカナに変換した文字列
   */
  hiraganaToKatagana: function(src) {
    return src.replace(/[\u3041-\u3096]/g, function(match) {
      var chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  },


  /**
   * by kawanet(https://gist.github.com/kawanet/5553478)
   * カタカナをひらがなに変換する
   * @param  {string} src - 変換したい文字列
   * @return {string}     - 文字列中のカタカナをひらがなに変換した文字列
   */
  katakanaToHiragana: function(src) {
    return src.replace(/[\u30a1-\u30f6]/g, function(match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  },


  /**
   * 標準的な1次元配列を昇順 or 降順でソートする
   * @param  {Array} array - ソート前の配列
   * @param  {number} flag  - 0なら昇順、1なら降順
   */
  sort_array: function(array, flag) {
    if (flag === 0) {
      array.sort(function(a,b){
        if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
      });
    }else {
      array.sort(function(a,b){
        if( a > b ) return -1;
        if( a < b ) return 1;
        return 0;
      });
    }
  },


  /**
   * メールアドレスのバリデーションを行う
   * @param  {string} val - チェックを行いたいメールアドレス
   * @return {bool}       - 有効ならtrue、無効ならfalse
   */
  validateMail: function(val){
    if(val.match(/.+@.+\..+/) === null){
      return false;
    } else {
      return true;
    }
  }
};





/************************************************************
                        DB Method
 ************************************************************/
/*
  データベース関連のメソッドをまとめたオブジェクト
*/
var DB_method = {

  /**
   * 指定したテーブルのレコード件数を返す
   * @param  {string} table_name - レコード件数を取得したいテーブル名
   * @return {Promise}           - 成功時：レコード件数、失敗時：エラーメッセージ
   */
  count_record: function(table_name) {
    return new Promise(function(resolve,reject) {
      var db = Utility.get_database();
      var query = 'SELECT COUNT(*) AS count FROM ' + table_name;
      db.executeSql(query, [], function (resultSet) {
        resolve(Number(JSON.stringify(resultSet.rows.item(0).count)));
      }, 
      function(error) {
        console.log('COUNT RECORD ERROR: ' + error.message);
        reject(error.message);
      });
    });
  },


  /**
   * データベースのレコードを全削除する
   */
  delete_all_record: function() {
    var db = Utility.get_database();

    db.transaction(function(tx) {
      tx.executeSql('DELETE FROM movie');
      tx.executeSql('DELETE FROM genre');
      tx.executeSql('DELETE FROM onomatopoeia');
      tx.executeSql('DELETE FROM profile_img');
      tx.executeSql('DELETE FROM sqlite_sequence');
    },
    function(err) {
      console.log('DELETE ALL RECORD ERROR: ' +JSON.stringify(err) +' ' + err.message);
    });
  },


  /**
   * シングルSQLを実行する関数
   * @param  {string} query     - クエリー文
   * @param  {Array} data_list  - クエリー内に埋め込む値を格納した配列
   * @return {Promise}          - 成功時：クエリーの実行結果，失敗時：エラーメッセージ
   */
  single_statement_execute: function(query,data_list) {
    return new Promise(function(resolve,reject) {
      var db = Utility.get_database();

      db.executeSql(query, data_list, function(resultSet) {
        resolve(resultSet);
      },
      function(error) {
        console.log(error.message);
        reject(error.message);
      });
    });
  }
};

app.initialize();

// ユーザ情報画面を表示するたびに、DBからデータを取得して表示データを更新する
User.show_event(ID.get_user_ID().page_id, User.show_contents);
