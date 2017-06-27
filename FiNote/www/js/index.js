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
  status_flag: 0
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
   * 気分リストのコンテンツを表示する関数
   */
  show_contents: function(){
    //flagに応じてツールバーの戻る・閉じるボタンを動的に変える
    var toolbar_left = document.getElementById(ID.get_feeling_ID().toolbar);
    toolbar_left.innerHTML = '';
    toolbar_left.innerHTML = Feeling.get_toolbar_feeling(Global_variable.feeling_flag);
    
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
  },

  /**
   * 保存しているスイッチボタンの状態をもとにチェックをつける
   */
  show_contents: function(){
    //flagに応じてツールバーの戻る・閉じるボタンを動的に変える
    var toolbar_left = document.getElementById(ID.get_movieadd_status_ID().toolbar);
    toolbar_left.innerHTML = '';
    toolbar_left.innerHTML = Movieadd_status.get_toolbar_status(Global_variable.status_flag);

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




app.initialize();

// ユーザ情報画面を表示するたびに、DBからデータを取得して表示データを更新する
User.show_event(ID.get_user_ID().page_id, User.show_contents);
Social.run_draw_get_recently_movie_list(ID.get_social_ID().page_id);