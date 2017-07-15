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
      Utility.show_spinner(ID.get_movieadd_search_ID().page_id);

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
   * 「検索結果が見つからない場合」というリンクのhtmlを返す
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
   * @return {Array}          - 画像のパス
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