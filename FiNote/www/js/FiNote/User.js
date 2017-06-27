/************************************************************
                        user.html
 ************************************************************/
var User = {
  info: {onomatopoeia_count: [], genre_count: [], movie_count: 0, dvd_count: 0, fav_count: 0},

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
            '<ons-list-item modifier="longdivider" onclick="">'+
            '<div class="left"><div class="ct-chart ct-perfect-fourth chart_area" id="chart1"></div></div>'+
            '<div class="right"><ons-list class="taped_area" id="onomatopoeia_top3"></ons-list></div>'+
            '</ons-list-item>'+
            '<ons-list-item modifier="longdivider" onclick="">'+
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

    Utility.show_spinner(ID.get_user_ID().page_id);

    var promises = [
      User.set_user_info(true),
      User.set_user_info(false)
    ];

    Promise.all(promises).then(function() {
      // トップ3を書き込む
      var onomatopoeia_top3 = document.getElementById(ID.get_user_ID().onomatopoeia_top3);
      var genre_top3 = document.getElementById(ID.get_user_ID().genre_top3);
      var onomatopoeia_top3_html = '';
      var genre_top3_html = '';

      for(var i = 0; i < 3; i++) {
        var onomatopoeia_name_html = '';
        var genre_name_html = '';
        var o_style = '';
        var g_style = '';

        if (typeof User.info.onomatopoeia_count[i] === 'undefined') {
          onomatopoeia_name_html = 'データなし';
          o_style = 'opacity: .5;';
        }else {
          onomatopoeia_name_html = User.info.onomatopoeia_count[i]['name'];
        }

        if (typeof User.info.genre_count[i] === 'undefined') {
          genre_name_html = 'データなし';
          g_style = 'opacity: .5;';
        }else {
          genre_name_html = User.info.genre_count[i]['name'];
        }

        onomatopoeia_top3_html += '<ons-list-item style="' + o_style + '">' + (i+1) + '. ' + onomatopoeia_name_html + '</ons-list-item>';
        genre_top3_html += '<ons-list-item style="' + g_style + '">' + (i+1) + '. ' + genre_name_html + '</ons-list-item>';
      }

      onomatopoeia_top3.innerHTML = '<ons-list-header>気分 トップ3</ons-list-header>' + onomatopoeia_top3_html;
      genre_top3.innerHTML = '<ons-list-header>ジャンル トップ3</ons-list-header>' + genre_top3_html;


      // 映画、DVD、FAVの件数をhtmlに書き込む
      var movies_count = document.getElementById(ID.get_user_ID().movies_number);
      var dvds_count = document.getElementById(ID.get_user_ID().dvds_number);
      var favorites_count = document.getElementById(ID.get_user_ID().favorites_number);
      movies_count.innerHTML = String(User.info.movie_count);
      dvds_count.innerHTML = String(User.info.dvd_count);
      favorites_count.innerHTML = String(User.info.fav_count);


      // オノマトペとジャンルの合計数をそれぞれ求める
      var o_slice_list = User.info.onomatopoeia_count.slice(0, draw_graph_contents_count);
      var g_slice_list = User.info.genre_count.slice(0, draw_graph_contents_count);
      var o_total_count = 0;
      var g_total_count = 0;
      var o_count_list = [];
      var g_count_list = [];
      o_slice_list.forEach(function (o_obj) {
        o_total_count += o_obj['count'];
        o_count_list.push(o_obj['count']);
			});
      g_slice_list.forEach(function (g_obj) {
        g_total_count += g_obj['count'];
        g_count_list.push(g_obj['count']);
			});

      // チャートの描画
      User.draw_chart(ID.get_user_ID().chart1, o_total_count, o_count_list);
      User.draw_chart(ID.get_user_ID().chart2, g_total_count, g_count_list);

      Utility.stop_spinner();
    }).catch(function (err) {
      console.log(err);
      Utility.stop_spinner();
		});
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
  },


	/**
   * オノマトペとジャンルの名前と出現回数、映画・DVD・お気に入りの登録数を求めて保存する関数
	 * @param {boolean} flag   - trueならオノマトペの処理、falseならジャンルの処理
	 * @returns {*|Promise}    - resolveなら求めた名前と出現回数のオブジェクト配列、rejectならエラー文
	 */
  set_user_info: function (flag) {
    //初期化
    User.info.movie_count = 0;
    User.info.dvd_count = 0;
    User.info.fav_count = 0;

		return new Promise(function (resolve, reject) {
		  var column = '';
      var table = '';
      if(flag) {
        User.info.onomatopoeia_count = [];
        column = 'onomatopoeia_id';
        table = 'onomatopoeia';
      }else {
        User.info.genre_count = [];
        column = 'genre_id';
        table = 'genre';
      }

      var promises = [
        DB_method.single_statement_execute('SELECT '+column+',dvd,fav FROM movie', []),
        DB_method.single_statement_execute('SELECT id,name FROM '+table, [])
      ];

      Promise.all(promises).then(function (results) {
        var dvd = 0;
        var fav = 0;

        //pkをkey、出現回数をvalueにした連想配列のArrayを生成
        var pk_count = [];
        for(var i = 0; i < results[0].rows.length; i++ ) {
          if(results[0].rows.item(i).dvd === 1) {
            dvd += 1;
          }
          if(results[0].rows.item(i).fav === 1) {
            fav += 1;
          }

          //flagによってidの参照名を変える
          var id_list;
          if(flag) {
            id_list = results[0].rows.item(i).onomatopoeia_id.split(',');
          }else {
            id_list = results[0].rows.item(i).genre_id.split(',');
          }

          //movieレコードに付与されているidのループ
          id_list.forEach(function (id) {
            var plus_flag = false;
            pk_count.some(function (count_obj) {
              if(count_obj['pk'] === id) {
                count_obj['count'] += 1;
                plus_flag = true;
                return true;
              }
              return false;
            });

            //数を増やしていなかったら(追加済みが見つからない)新規追加
            if(!plus_flag) {
              pk_count.push({"pk": id, "count": 1});
            }
          });
        }

        var name_count = [];
        pk_count.forEach(function (count_obj) {
          for(i = 0; i < results[1].rows.length; i++ ) {
            if(Number(count_obj['pk']) === results[1].rows.item(i).id) {
              name_count.push({"name": results[1].rows.item(i).name, "count": count_obj['count']});
              break;
            }
          }
        });

        Utility.ObjArraySort(name_count, 'count', 'desc');

        //結果の保存
        if(flag) {
          User.info.onomatopoeia_count = name_count;
        }else {
          User.info.genre_count = name_count;
        }
        User.info.movie_count = results[0].rows.length;
        User.info.dvd_count = dvd;
        User.info.fav_count = fav;

        resolve(name_count);

      }).catch(function (err) {
        console.log(err);
        reject(err);
      });
		});
	}
};