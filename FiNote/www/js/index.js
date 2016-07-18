
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        setTimeout(function() {
            navigator.splashscreen.hide();}, 500);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
       // app.receivedEvent('deviceready');
        var db = get_database();

          db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key, title text unique, tmdb_id integer unique, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail_path text, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS genre (id integer primary key, name text unique, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS keyword (id integer primary key, name text unique, username text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS onomatopoeia (id integer primary Key, name text, joy_status integer, anger_status integer, sadness_status integer, happiness_status integer)');
          }, function(err) {
            console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
          });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
};

//会員登録で使用  
function signup(){
    //mobile backendアプリとの連携
    var ncmb = get_ncmb();
    var user = new ncmb.User();

    //ユーザー名・パスワードを設定
    user.set("userName", document.getElementById("username").value)
        .set("password", document.getElementById("password").value)

    // 新規登録
    user.signUpByAccount()
        .then(function(){
            /*登録後処理*/
            //ローカルにユーザ名とパスワードを保存する。
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;
            var storage = window.localStorage;
            storage.setItem('username', username)
            storage.setItem('password', password)

            //同時にこれらの情報が記録されているかを判断するフラグも保存する
            storage.setItem('signup_flag', true)

            document.getElementById('signup-alert-success').show();
        })
        .catch(function(err){
            // エラー処理
            document.getElementById('signup-alert-error').show();

            var info = document.getElementById('error-message');
            var textNode;

            if (err.name == "NoUserNameError") {
                textNode = document.createTextNode('ユーザ名を入力してください');
            }else if (err.name == "NoPasswordError") {
                textNode = document.createTextNode('パスワードを入力してください');
            }else if (err.message.indexOf("cannot POST") > -1) {
                textNode = document.createTextNode('入力したユーザ名は既に使用されています');
            }else if (err.message.indexOf("Request has been terminated") > -1) {
                textNode = document.createTextNode('ネットワーク接続がオフラインのため登録ができません');
            }
            info.appendChild(textNode);
        });
}

function alert_hide(id){
    //画面遷移をするコールバックを渡す
    if (id == "signup-alert-success") {
        var pushpage_tabbar = function(){
            function autoLink(){
                location.href="index.html";
            }
         setTimeout(autoLink(),0);
        };

        document.getElementById(id).hide(pushpage_tabbar());

    //追加したエラーメッセージ(子ノード)を削除する
    }else if (id == "signup-alert-error") {
        document.getElementById(id).hide();
        var info = document.getElementById('error-message');
        var childNode = info.firstChild;
        info.removeChild(childNode);
    }
}

//ncmbを返す
function get_ncmb(){
    var ncmb = new NCMB("f5f6c2e3aa823eea2c500446a62c5645c04fc2fbfd9833cb173e1d876f464f6c","605298c95c0ba9c654315f11c6817e790f21f83a0e9ff60dc2fdf626b1485899");
    return ncmb;
}

//ローカルストレージの初期化をする
function delete_localstorage(){
    var storage = window.localStorage;
    storage.removeItem('username')
    storage.removeItem('password')
    storage.removeItem('signup_flag')
}

//ログイン中のユーザ名が含まれるMovieオブジェクトを最新順で取得する
function get_movies_ncmbobject(username, callback){
    // var ncmb = get_ncmb();
    // var Movie = ncmb.DataStore("Movie");
    // Movie.equalTo("UserName", username)
    // .order("updateDate",true)
    // .fetchAll()
    // .then(function(results){
    //     insert_movie(results);
    //     callback();
    // })
    // .catch(function(err){
    //     console.log(err);
    // });
}

//指定したページの読み込み終了後に指定したcallbackを実行する
function check_page_init(pageid,callback){
    // document.addEventListener("init", function(event) {
    //     if (event.target.id == pageid) {
    //         console.log(pageid + ' is inited')
    //         console.log(document.getElementById("test"))
    //         callback();
    //     }
    // }, false);
}

//データベースのオブジェクトを返す
function get_database(){
    var db = window.sqlitePlugin.openDatabase({name: 'my_db', location: 'default'});
    return db;
}

// //ローカルのデータベースにサーバから取得したmovieを記録する
// function insert_movie(movies){
//     var db = this.get_database();
    
//     for (var i = 0; i < movies.length; i++) {
//         console.log(movies[i]);

//        db.executeSql("INSERT INTO movie(title, tmdb_id, genre_id, keyword_id, onomatopoeia_id, thumbnail_path, username) VALUES('title', 'tmdb_id', 'genre_id')");
//         //id integer primary key, title text unique, tmdb_id integer unique, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail_path text, username text
//     }

//     // db.transaction(function(tx) {
//     //     // console.log('Open database success');
//     //     for (var i = 0; i >= 0; i--) {
//     //         Things[i]
//     //     }
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS movie (id integer primary key, title text, tmdb_id text, genre_id text, keyword_id text, onomatopoeia_id text, thumbnail text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS Genre (id integer primary key, name text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS KeyWord (id integer primary key, name text, username text)');
//     //     tx.executeSql('CREATE TABLE IF NOT EXISTS Onomatopoeia (id integer primary Key, name text, joy_status text, anger_status text, sadness_status text, happiness_status text)');
//     // }, function(err) {
//     //     console.log('Open database ERROR: ' +JSON.stringify(err) +' ' + err.message);
//     //     });
// }
     

app.initialize();