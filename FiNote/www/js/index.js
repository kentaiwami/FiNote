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





app.initialize();

//ユーザ情報画面を表示するたびに、DBからデータを取得して表示データを更新する
User.show_event(ID.get_user_ID().page_id, User.show_contents);


//ソーシャル画面を表示するたびに、表示実行を行う関数を登録
Utility.document_addEventListener(ID.get_social_ID().page_id, 'show', Social.draw_get_recently_movie_list);


//アクティブになっているタブをサイド選択した場合に、スクロールを行うイベントを登録
Utility.document_addEventListener(ID.get_tab_ID().tab, 'reactive', function () {
  console.log(event.tabItem._page);

  //ページIDの抽出
  var template_id = event.tabItem._page;
  var page_id = template_id.substr(0, template_id.indexOf('.'));

  //指定したページIDの一番上までスクロール
  $('#'+page_id+', .page__content').animate({scrollTop:0}, 500, 'swing');
});
