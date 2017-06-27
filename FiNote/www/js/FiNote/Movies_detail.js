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