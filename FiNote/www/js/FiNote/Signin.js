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

          if(movie.movie__poster_path.length === 0) {
            image.src = 'img/noimage.png';
          }else {
            image.src = base_url + movie.movie__poster_path;
          }

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