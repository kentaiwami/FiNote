/************************************************************
                            Cordova
 ************************************************************/
var app = {
  initialize: function() {
    this.bindEvents();
  },


  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },


  onDeviceReady: function() {
    navigator.splashscreen.hide();

    //ステータスバーの自動調整を無効にする
    ons.disableAutoStatusBarFill();

    //キーボードのアクセサリーバーを表示する
    Utility.hideKeyboardAccessoryBar(false);

    //データベースのテーブルを構築する
    var db = Utility.get_database();

    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key AUTOINCREMENT, title text unique, tmdb_id integer unique, genre_id text, onomatopoeia_id text, poster text, overview text, dvd integer, fav integer, add_year integer, add_month integer, add_day integer)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS genre (id integer primary key AUTOINCREMENT, genre_id integer, name text unique)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS onomatopoeia (id integer primary Key AUTOINCREMENT, name text)');
      tx.executeSql('CREATE TABLE IF NOT EXISTS profile_img (id integer primary Key AUTOINCREMENT, img text)');
    }, function(err) {
      console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
    });
    // DB_method.delete_all_record();
    Index.check_signup();
  }
};