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
  status_flag: 0,

  //falseならソーシャル画面を一度も表示していない状態、trueなら一度でも表示した状態
  //最初だけ最新ランキングを表示して、それ以降は自動で表示する挙動をさせない(ユーザが遷移した画面を初期化しない)ため
  social_show_flag: false
};





app.initialize();

//ユーザ情報画面を表示するたびに、DBからデータを取得して表示データを更新する
User.show_event(ID.get_user_ID().page_id, User.show_contents);


//アクティブになっているタブを再度選択した場合に、スクロールを行うイベントを登録
Utility.document_addEventListener(ID.get_tab_ID().tab, 'reactive', function () {
  console.log(event.tabItem._page);

  //ページIDの抽出
  var template_id = event.tabItem._page;
  var page_id = template_id.substr(0, template_id.indexOf('.'));

  //指定したページIDの一番上までスクロール
  $('#'+page_id+', .page__content').animate({scrollTop:0}, 500, 'swing');
});


//ソーシャル画面の初回表示のみ、最新ランキングの表示実行を行う関数を登録
Utility.document_addEventListener(ID.get_tab_ID().tab, 'postchange', function () {
  if(event.tabItem._page === 'social.html' && Global_variable.social_show_flag === false) {
   Social.draw_get_recently_movie_list();
   Global_variable.social_show_flag = true;
  }
});
