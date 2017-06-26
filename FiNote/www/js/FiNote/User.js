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