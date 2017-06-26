/************************************************************
                          Utility
 ************************************************************/
/**
* 便利関数をまとめたオブジェクト
* @type {Object}
*/
var Utility = {

  /**
   * ローカルストレージの初期化をする
   */
  delete_localstorage: function(){
    var storage = window.localStorage;
    storage.removeItem('username');
    storage.removeItem('password');
    storage.removeItem('email');
    storage.removeItem('birthday');
    storage.removeItem('sex');
    storage.removeItem('signup_flag');
    storage.removeItem('adult');
    storage.removeItem('token');
  },


  /**
   * ローカルストレージの状態を表示する
   */
  show_localstorage: function(){
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var password = storage.getItem(ID.get_localStorage_ID().password);
    var email = storage.getItem(ID.get_localStorage_ID().email);
    var birthday = storage.getItem(ID.get_localStorage_ID().birthday);
    var sex = storage.getItem(ID.get_localStorage_ID().sex);
    var signup_flag = storage.getItem(ID.get_localStorage_ID().signup_flag);
    var adult = storage.setItem(ID.get_localStorage_ID().adult, false);
    var obj = {'username':username, 'password':password, 'email': email, 'birthday':birthday, 'sex':sex, 'signup_flag':signup_flag, 'adult': adult};
    console.log(obj);
  },


  /**
   * 指定したページの読み込み終了後に指定したcallbackを実行する
   * @param  {[String]}   pageid   [pageのid]
   * @param  {Function} callback [読み込み終了後に実行したいコールバック関数]
   */
  check_page_init: function(pageid,callback){
    document.addEventListener('init', function(event) {
      if (event.target.id === pageid) {
        console.log(pageid + ' is inited');
        callback();
        document.removeEventListener('init', arguments.callee);
      }
    });
  },


  /**
   * データベースのオブジェクトを返す
   * @return {[Object]} [description]
   */
  get_database: function(){
      return window.sqlitePlugin.openDatabase({name: 'my_db.db', location: 'default'});
  },


  /**
   * TMDBのAPIキーを返す
   * @return {string} [TMDBのAPIキー]
   */
  get_tmdb_apikey: function(){
    return 'dcf593b3416b09594c1f13fabd1b9802';
  },


  /**
   * htmlファイル、アニメーション、delay時間を指定するとアニメーションを行って画面遷移する
   * @param  {string} html_name      - 画面遷移したいhtmlファイル名
   * @param  {string} animation_name - アニメーション名
   * @param  {number} delaytime      - Timeoutの時間
   * @param  {Function} callback     - push_page実施後のコールバック
   */
  push_page: function(html_name, animation_name, delaytime, callback) {
    var showpage = function(){
      document.getElementById(ID.get_utility_ID().navigator).pushPage(html_name,
        { animation: animation_name,
          callback: callback
        }
      );
    };

    setTimeout(showpage, delaytime);
  },


  /**
   * onsen uiのpopPageを実行する関数
   */
  pop_page: function(){
    document.getElementById(ID.get_utility_ID().navigator).popPage();
  },


  /**
   * ブラウザで強制的にログインするための関数
   */
  browser_signup: function(){
    var callback = function(){
      document.getElementById(ID.get_signup_ID().username).value = 'ブラウザユーザ';
      document.getElementById(ID.get_signup_ID().password).value = 'password';
      document.getElementById(ID.get_signup_ID().birthday).value = '1994';

      Index.formcheck[0] = true;
      Index.formcheck[1] = true;

      var storage = window.localStorage;
      storage.setItem(ID.get_localStorage_ID().username, document.getElementById(ID.get_signup_ID().username).value);
      storage.setItem(ID.get_localStorage_ID().password, document.getElementById(ID.get_signup_ID().password).value);
      storage.setItem(ID.get_localStorage_ID().birthday, Number(document.getElementById(ID.get_signup_ID().birthday).value));
      storage.setItem(ID.get_localStorage_ID().sex, 'M');
      storage.setItem(ID.get_localStorage_ID().signup_flag, true);
      storage.setItem(ID.get_localStorage_ID().adult, false);
    };
    Utility.check_page_init(ID.get_signup_ID().page_id,callback);
  },


  spinner: {},        //spinnerオブジェクト格納用

	/**
	 * 指定した親要素にスピナーを表示する
	 * @param  {string} parent - 親要素のid
	 */
	show_spinner: function (parent) {
		var opts = {
		  lines: 17,            //線の数
			length: 0,            //線の長さ
			width: 7,             //線の幅
			radius: 40,           //スピナーの内側の広さ
			corners: 1,           //角の丸み
			rotate: 0,           //向き
			direction: 1,         //1：時計回り -1：反時計回り
			color: '#462401',        // 色
			speed: 2.0,           // 一秒間に回転する回数
			trail: 71,            //残像の長さ
			shadow: false,         // 影
			hwaccel: false,        // ？
			className: 'spinner', // クラス名
			zIndex: 2e9,          // Z-index
			top: '50%',           // relative TOP
			left: '50%',          // relative LEFT
			opacity: 0.25,        //透明度
			fps: 40               //fps
		};

    //重複表示を避けるため既にオブジェクトに格納されていない時のみ処理を行う
    if (Object.keys(Utility.spinner).length === 0) {
      //描画先の親要素
      var spin_target = document.getElementById(parent);
      //スピナーオブジェクト
      var spinner = new Spinner(opts);
      Utility.spinner = spinner;
      //スピナー描画
      spinner.spin(spin_target);
    }
  },


  /**
   * スピナーの表示を止める
   */
  stop_spinner: function(){
    Utility.spinner.spin();
    Utility.spinner = {};
  },


  /**
   * エラーのアラートを表示する
   * @param  {string} title       - タイトル
   * @param  {string} message     - メッセージ
   * @param  {string} buttonLabel - ボタンのラベル
   */
  show_error_alert: function(title,message,buttonLabel) {
    ons.notification.alert(
    {
        title: title,
        message: message,
        buttonLabel: buttonLabel
    });
  },


  /**
   * confirmアラートを表示する
   * @param  {string} title        - タイトル
   * @param  {string} message      - メッセージ
   * @param  {Array} buttonLabels  - ボタンのラベルを文字列で格納した配列
   * @param  {Function} func0      - ボタンのラベル配列の0番目をタップすると実行される関数
   * @param  {Function} func1      - ボタンのラベル配列の1番目をタップすると実行される関数
   */
  show_confirm_alert: function(title, message, buttonLabels, func0, func1) {
    ons.notification.confirm(
    {
        title: title,
        message: message,
        buttonLabel: buttonLabels
    })
    .then(function(index) {
      if (index === 0) {
        func0();
      }else {
        func1();
      }
    });
  },


  /**
   * TMDBに関するエラーアラートを表示する
   * @param  {number} err_status - エラーのHTTPstatus
   */
  show_tmdb_error: function(err_status) {
    switch(err_status) {
      case 0:
        Utility.show_error_alert('通信エラー','ネットワーク接続を確認して下さい','OK');
        break;
      case 401:
        Utility.show_error_alert('APIエラー','有効なAPIキーを設定して下さい','OK');
        break;
      case 404:
        Utility.show_error_alert('Not found','リソースが見つかりませんでした','OK');
        break;
      default:
        Utility.show_error_alert('不明なエラー','不明なエラーが発生しました','OK');
        break;
    }
  },


  /**
   * 画像をbase64エンコードする
   * @param  {Image} image_src  - img要素
   * @param  {string} mine_type - データ型
   * @return {Promise}          - 成功時：画像をbase64エンコードした文字列
   */
  image_to_base64: function(image_src, mine_type) {
    return new Promise(function(resolve) {
      var canvas = document.createElement('canvas');
      canvas.width  = image_src.width;
      canvas.height = image_src.height;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(image_src, 0, 0);

      resolve(canvas.toDataURL(mine_type));
    });
  },


  /**
   * ローカルのImage Fileをbase64へ変換する
   * @param  {string} image_path - 変換したい画像のパス
   * @return {Promise}           - base64文字列
   */
  local_image_to_base64: function(image_path) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", image_path, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        console.log(this.response);
        var reader = new FileReader();
        reader.onload = function(event) {
         var res = event.target.result;
         resolve(res);
        };
        var file = this.response;
        reader.readAsDataURL(file);
      };
      xhr.send();
    });
  },


  /**
   * base64をデコードする
   * @param  {string}   base64img - base64の文字列
   * @param  {Function} callback  - 変換後のコールバック
   */
  base64_to_image: function(base64img, callback) {
    var img = new Image();
    img.onload = function() {
      callback(img);
    };
    img.src = base64img;
  },


  /**
   * 引数で渡されたidと属性を一括でセットする
   * @param {Array} id_list           - 属性をセットしたいidを含んだ配列
   * @param {string} attribute_name_0 - 属性名
   * @param {string} attribute_name_1 - 属性値
   */
  setAttribute_list_object: function(id_list, attribute_name_0, attribute_name_1) {
    for(var i = 0; i < id_list.length; i++) {
      document.getElementById(id_list[i]).setAttribute(attribute_name_0, attribute_name_1);
    }
  },


  /**
   * 複数のオブジェクトから同じattributeを取り除く
   * @param  {Array} id_list          - 属性を取り除きたいidを格納した配列
   * @param  {string} attribute_name  - 取り除きたい属性名
   */
  removeAttribute_list_object: function(id_list, attribute_name) {
    for(var i = 0; i < id_list.length; i++) {
      document.getElementById(id_list[i]).removeAttribute(attribute_name);
    }
  },


  /**
   * キーボードのアクセサリーバーの表示・非表示を設定する
   * @param  {bool} bool - description
   */
  hideKeyboardAccessoryBar:function(bool) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(bool);
  },


  /**
   * FiNoteのAPIを実行してpromiseを受け取る
   * @param {string} api_name - 利用するAPIの名前
   * @param {string} data     - postする場合のデータ
   * @param {string} method   - postなどのメソッド名
   * @param {string} version  - apiのバージョン(v1, v2…)
   */
  FiNote_API: function(api_name, data, method, version) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      var request_url = 'http://kentaiwami.jp/FiNote/api/' + version + '/' + api_name + '/';
      request.open(method, request_url);
      request.setRequestHeader("Content-type", "application/json");

      request.onreadystatechange = function () {
        if (this.readyState === 4) {
          if(this.status === 200) {
            resolve(this.responseText);
          }else {
            reject(this.responseText);
          }
        }
      };

      request.send(JSON.stringify(data));
    });
  },


  /**
   * できるだけ日本語の映画タイトルを返す関数
   * @param  {string} movie_json - TMDBから取得した映画データ
   * @return {string}            - 映画のタイトル
   */
  get_movie_ja_title: function(movie_json) {
    if (movie_json.original_language === 'ja') {
      if (movie_json.original_title !== '') {
        return movie_json.original_title;
      }else {
        return movie_json.title;
      }
    }else {
      if (movie_json.title !== '' ) {
        return movie_json.title;
      }else {
        return movie_json.original_title;
      }
    }
  },


  /**
   * by kawanet(https://gist.github.com/kawanet/5553478)
   * ひらがなをカタカナに変換する
   * @param  {string} src - 変換したい文字列
   * @return {string}     - 文字列中のひらがなをカタカナに変換した文字列
   */
  hiraganaToKatagana: function(src) {
    return src.replace(/[\u3041-\u3096]/g, function(match) {
      var chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  },


  /**
   * by kawanet(https://gist.github.com/kawanet/5553478)
   * カタカナをひらがなに変換する
   * @param  {string} src - 変換したい文字列
   * @return {string}     - 文字列中のカタカナをひらがなに変換した文字列
   */
  katakanaToHiragana: function(src) {
    return src.replace(/[\u30a1-\u30f6]/g, function(match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  },


  /**
   * 標準的な1次元配列を昇順 or 降順でソートする
   * @param  {Array} array - ソート前の配列
   * @param  {number} flag  - 0なら昇順、1なら降順
   */
  sort_array: function(array, flag) {
    if (flag === 0) {
      array.sort(function(a,b){
        if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
      });
    }else {
      array.sort(function(a,b){
        if( a > b ) return -1;
        if( a < b ) return 1;
        return 0;
      });
    }
  },


  /**
   * メールアドレスのバリデーションを行う
   * @param  {string} val - チェックを行いたいメールアドレス
   * @return {boolean}       - 有効ならtrue、無効ならfalse
   */
  validateMail: function(val){
    return val.match(/.+@.+\..+/) !== null;
  },


	/**
   * ダブル・シングルコーテーションや¥rを置き換えた文字列を返す
	 * @param {string} str - エスケープ前の文字列
	 */
  escaped_string: function (str) {
    var escaped_str = str.replace(/"/g, "“");
    escaped_str = escaped_str.replace(/'/g, "`");
    escaped_str = escaped_str.replace(/\r/g, "");

		return escaped_str;
	},


	/**
   * 連想配列を指定したkeyでソートする関数
	 * @param {Array} ary     - ソートしたい連想配列
	 * @param {string} key    - ソートする際のkey
	 * @param {string} order  - desc or asc(no param)
	 */
  ObjArraySort: function (ary, key, order) {
    var reverse = 1;
    if(order && order.toLowerCase() === "desc")
        reverse = -1;
    ary.sort(function(a, b) {
        if(a[key] < b[key])
            return -1 * reverse;
        else if(a[key] === b[key])
            return 0;
        else
            return reverse;
    });
	}
};