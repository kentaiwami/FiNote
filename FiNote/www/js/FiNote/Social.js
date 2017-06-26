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