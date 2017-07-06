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
	 * 気分の比較で使用
	 * @param {Number} first_limit 							- 最初にリクエストする映画の数
	 * @param {Number} after       							- 最初以降にリクエストする映画の数
	 * @param {Number} onomatopoeia_draw_limit 	- 気分の比較画面に表示するオノマトペの個数
	 * @param {Number} request_limit						- 同時にxmlhttp通信を行う上限個数
	 */
	control: {first_limit: 20, after_limit: 10, onomatopoeia_draw_limit: 6, request_limit: 2},

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

	  var query = 'SELECT title, poster, overview, tmdb_id, onomatopoeia_id from movie order by id DESC';
	  DB_method.single_statement_execute(query, []).then(function(result) {
	    Social.data.local_movies = result;

	    if(Social.data.local_movies.rows.length === 0) {
        //  メッセージ表示
        return -1;
      }else {
	    	//登録している映画がリミット値より少ない場合にforループ回数の調整
	    	var for_count = Social.control.first_limit;
	    	if(Social.control.first_limit > result.rows.length) {
	    		for_count = result.rows.length;
				}

	      //POSTするtmdb_idの配列文字列を生成
        var list_data = '[';
				for(var i = 0; i < for_count; i++ ) {
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
    	Utility.stop_spinner();

      if(promises === -1 ) {
        var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
        social_movie_list.innerHTML = '<p class="all_center_message">映画を追加すると比較結果が表示されます</p>';
      }else {
        var api_results = JSON.parse(promises[1]);

				//詳細画面で表示するために情報を保存
				Social.data.local_onomatopoeia = promises[0];
				Social.data.reaction_api_results = api_results;

				//リストの描画(Social.control.first_limitの分はローカルとサーバを表示、それ以外はローカルのみ)
				Social.draw_get_movie_reactions(promises[0], api_results, Social.data.local_movies);

				//Social.control.after_limitの値ごとにtmdb_idをまとめる
				//ex.) [{"tmdb_id_list": "[x,x,x]"}, {...}, {...}]
				var post_remain_data_list = Social.create_post_remain_data();

				//Social.create_post_remain_dataでまとめたtmdb_idのオブジェクトを、2つずつのlistとしてまとめる
				//ex.) [[{"tmdb_id_list": "[x,x,x]"},{"tmdb_id_list": "[x,x,x]"}], [...], [...]]
				var two_obj_list = [];
				var s = 0;
				var e = Social.control.request_limit;

				while(post_remain_data_list.slice(s, e).length !== 0) {
					two_obj_list.push(post_remain_data_list.slice(s, e));
					s = e;
					e += Social.control.request_limit;
				}

				//Promiseの生成と実行
				var all_promise;
				two_obj_list.forEach(function (obj_list, index) {
					//5.5秒おきに、post通信を行う関数の作成
					var post_ajax = function () {
						return new Promise(function(resolve) {
							setTimeout(function () {
								console.log('Social comparison onomatopoeia ' + (index+1)+' count request');

								//オブジェクトの個数分だけpromiseを生成
								var promises = [];
								obj_list.forEach(function (obj) {
									promises.push(Utility.FiNote_API('get_movie_reaction', obj, 'POST', 'v1'));
								});

								Promise.all(promises).then(function (results) {
									results.forEach(function (result) {
										var json_val = JSON.parse(result);

										//結果の描画
										Social.draw_get_movie_remain_data(json_val);

										//結果の統合
										Array.prototype.push.apply(Social.data.reaction_api_results, json_val);
									});

									// console.log(Social.data.reaction_api_results);
									resolve();
								});
							}, 5500);
						});
					};

					//最初の関数代入だけ実行形式で代入する
					if(index === 0) {
						all_promise = post_ajax();
					}else {
						all_promise = all_promise.then(post_ajax);
					}
				});
			}
		})
		.catch(function (err) {
			Utility.stop_spinner();
			console.log(err);
			Utility.show_error_alert('エラー発生', err, 'OK');
		});
	},


	/**
	 * 画面表示時にリクエストしたデータ以外のポスト用データを生成する関数
	 * @returns {Array} - {"tmdb_id_list": "[x,x,x,]"}を格納した1次元配列
	 */
	create_post_remain_data: function () {
		var post_data_list = [];

		var now_index = Social.control.first_limit;
		var last_flag = false;

		while(1) {
			var end_index = now_index + Social.control.after_limit;

			if(end_index >= Social.data.local_movies.rows.length) {
				end_index = Social.data.local_movies.rows.length;
				last_flag = true;
			}

			var list_data = '[';
			for(var i = now_index; i < end_index; i++ ) {
				list_data += Social.data.local_movies.rows.item(i).tmdb_id + ',';
			}
			list_data = list_data.substr(0, list_data.length-1);
			list_data += ']';

			var post_data = {"tmdb_id_list": list_data};
			post_data_list.push(post_data);

			if(last_flag) {
				break;
			}

			now_index += Social.control.after_limit;
		}

		return post_data_list;
	},


	/**
	 * 後から問い合わせしたデータを受け取り、対応するリストにオノマトペを書き込む関数
	 * @param {Object} remain_data - 問い合わせの結果 ex.) [{"123": [{"name":xxx},{"name":xxx}]]
	 */
	draw_get_movie_remain_data: function (remain_data) {

		//映画の数だけループ
		remain_data.forEach(function (obj) {
			var tmdb_id = Object.keys(obj)[0];
			var list_p = document.getElementById(tmdb_id);
			var html = '';
			var limit_flag = false;

			//付与されているオノマトペの数だけループ
			obj[tmdb_id].some(function (onomatopoeia_obj, index) {
				if(index+1 > Social.control.onomatopoeia_draw_limit) {
					limit_flag = true;
					return true;
				}
				html += onomatopoeia_obj['name'] + ', ';
			});

			html = html.substr(0, html.length-2);

			if(limit_flag) {
				html += '…';
			}

			list_p.innerHTML = html;
		});
	},


	//TODO 
	show_detail_comparison_onomatopoeia: function (index) {
		Utility.show_spinner(ID.get_social_ID().page_id);

		var tmdb_id = Object.keys(Social.data.reaction_api_results[index])[0];

		//ポストするためのリストの文字列を返す関数の定義
		var create_post_data = function (onomatopoeia_list) {
			var onomatopoeia_name_list_str = '[';

			onomatopoeia_list.forEach(function (onomatopoeia_obj) {
				onomatopoeia_name_list_str += onomatopoeia_obj['name'] + ',';
			});

			onomatopoeia_name_list_str = onomatopoeia_name_list_str.substr(0, onomatopoeia_name_list_str.length-1);
			onomatopoeia_name_list_str += ']';

			return onomatopoeia_name_list_str;
		};

		var post_data = {
			"tmdb_id": tmdb_id,
			"onomatopoeia_name_list": create_post_data(Social.data.reaction_api_results[index][tmdb_id])
		};

		Utility.FiNote_API('get_onomatopoeia_count_by_movie_id', post_data, 'POST', 'v1').then(function (results) {
			Utility.stop_spinner();

			var json_results = JSON.parse(results);
			Utility.ObjArraySort(json_results, 'count', 'desc');
			//TODO 画面遷移と値渡し


		})
		.catch(function (err) {
			Utility.stop_spinner();
			Utility.show_error_alert('通信エラー発生', 'もう一度試してください。', 'OK');
			console.log(err);
		});
	},


	/**
   * ローカルの映画に付与されているオノマトペと、サーバ上で登録されているオノマトペを比較するリストを描画する関数
	 * @param {Object} local_onomatopoeia - ローカルに保存されているオノマトペ全件(id,name)
	 * @param {Object} api_results        - get_movie_reaction APIの結果
	 * @param {Object} local_movies       - ローカルに保存されている映画全件(title, poster, overview, tmdb_id, onomatopoeia_id)
	 */
  draw_get_movie_reactions: function (local_onomatopoeia, api_results, local_movies) {
    var html = '';

    for(var i = 0; i < local_movies.rows.length; i++ ) {
      var movie = local_movies.rows.item(i);

      //ローカルのオノマトペを生成
      var movie_onomatopoeia_array = movie.onomatopoeia_id.split(',');
      var local_onomatopoeia_html = '';
      for(var j = 0; j < Social.control.onomatopoeia_draw_limit; j++ ) {
        for(var k = 0; k < local_onomatopoeia.rows.length; k++ ) {
          var onomatopoeia_record = local_onomatopoeia.rows.item(k);
          if(String(onomatopoeia_record.id) === movie_onomatopoeia_array[j]) {
            local_onomatopoeia_html += onomatopoeia_record.name + ', ';
            break;
          }
        }
      }
      local_onomatopoeia_html = local_onomatopoeia_html.substr(0, local_onomatopoeia_html.length-2);

      //表示されているオノマトペの個数よりも本来の個数が多ければ三点リーダを表示
      if(Social.control.onomatopoeia_draw_limit < movie_onomatopoeia_array.length) {
      	local_onomatopoeia_html += '…';
			}

      //サーバ上に登録されているオノマトペを生成
      var server_onomatopoeia_html = '';
      for(j = 0; j < api_results.length; j++ ) {
        var key = Object.keys(api_results[j])[0];

        if(key === String(movie.tmdb_id)) {
          var for_count = Social.control.onomatopoeia_draw_limit;                     // 映画に付与されているオノマトペがdraw_limitより少ない場合は、
          if(api_results[j][key].length < Social.control.onomatopoeia_draw_limit ) {  // 全て描画するようにfor文の回数を調整する
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

      //表示されているオノマトペの個数よりも本来の個数が多ければ三点リーダを表示
      if(Social.control.onomatopoeia_draw_limit < api_results.length) {
      	server_onomatopoeia_html += '…';
			}

      html += '<ons-list-item modifier="longdivider chevron" tappable onclick="Social.show_detail_comparison_onomatopoeia('+i+')">'+
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
              '<p class="list_p" id="'+movie.tmdb_id+'">' + server_onomatopoeia_html + '</p>'+
              '</div>'+
              '</div>'+
              '</ons-list-item>';
    }

    var social_movie_list = document.getElementById(ID.get_social_ID().movie_list);
    social_movie_list.innerHTML = '<ons-list>' + html + '</ons-list>';
	}
};