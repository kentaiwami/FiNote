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

          if(movie_info_result[0][local_movie.tmdb_id].poster_path.length === 0) {
            image.src = 'img/noimage.png';
          }else {
            image.src = base_url + movie_info_result[0][local_movie.tmdb_id].poster_path;
          }

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