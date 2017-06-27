/************************************************************
                         signup.html
 ************************************************************/
/**
* サインアップ画面で使用する関数をまとめたオブジェクト
* @type {Object}
*/
var Signup = {
  /**
   * フォームに入力された値をサーバへ送信してサインアップを行い、その後ローカルへ保存する
   */
  usersignup: function() {
    Utility.show_spinner(ID.get_signup_ID().list_id);

    var username = document.getElementById(ID.get_signup_ID().username).value;
    var password = document.getElementById(ID.get_signup_ID().password).value;
    var email = document.getElementById(ID.get_signup_ID().email).value;
    var birthday = Number(document.getElementById(ID.get_signup_ID().birthday).value);
    var sex = Signup.get_sex();

    var data ={
        "username": username,
        "password": password,
        "email": email,
        "birthday": birthday,
        "sex": sex
    };

    // 新規登録
    Utility.FiNote_API('signup', data, 'POST', 'v1').then(function(result) {
      /*登録後処理*/
      var json_data = JSON.parse(result);

      //ローカルに個人情報を保存
      var storage = window.localStorage;
      storage.setItem(ID.get_localStorage_ID().username, username);
      storage.setItem(ID.get_localStorage_ID().password, password);
      storage.setItem(ID.get_localStorage_ID().email, email);
      storage.setItem(ID.get_localStorage_ID().birthday, birthday);
      storage.setItem(ID.get_localStorage_ID().sex, sex);
      storage.setItem(ID.get_localStorage_ID().adult, false);
      storage.setItem(ID.get_localStorage_ID().signup_flag, true);
      storage.setItem(ID.get_localStorage_ID().token, json_data.token);
      storage.setItem(ID.get_localStorage_ID().profile_img, '');


      Utility.stop_spinner();
      document.getElementById(ID.get_signup_ID().success_alert).show();
    })
    .catch(function(err){
      // エラー処理
      Utility.stop_spinner();
      Utility.show_error_alert('登録エラー', err, 'OK');
    });
  },


  /**
   * 会員登録成功時に表示されるアラートのOKボタンを押した際に、
   * アラートを閉じて映画一覧へ遷移する関数
   */
  alert_hide: function() {
    // 会員登録の成功時にはindex.htmlへ遷移
      var pushpage_tabbar = function(){
        function autoLink(){
            location.href= ID.get_index_ID().tmp_id;
        }
       setTimeout(autoLink(),0);
      };

      document.getElementById(ID.get_signup_ID().success_alert).hide(pushpage_tabbar());
  },


  /**
   * 生年を選択させるフォームへpickerを設定する
   */
  birthday_pickerview: function(){
    cordova.plugins.Keyboard.close();
    //今年から100年前までの年テキストをオブジェクトとして生成する
    var birthday = document.getElementById(ID.get_signup_ID().birthday);
    var time = new Date();
    var year = time.getFullYear();
    var items_array = [];

    //フォーカスした際にpickerviewデフォルド選択の値を決める
    var fastvalue = '';
    if (birthday.value.length === 0) {
      fastvalue = String(year);
    }else{
      fastvalue = birthday.value;
    }

    for (var i = year; i >= year-100; i--) {
      var obj = {text: String(i), value: String(i)};
      items_array.push(obj);
    }

    var config = {
      title: '',
      items: items_array,

      selectedValue: fastvalue,
      doneButtonLabel: '完了',
      cancelButtonLabel: 'キャンセル'
    };

    window.plugins.listpicker.showPicker(config, function(item) {
      birthday.value = item;
      Index.formcheck[1] = true;
      Index.change_abled_signup_button();
    },
    function() {
      console.log("You have cancelled");
    });
  },


  /**
   * 性別を選択するチェックボックスの状態から性別の識別子を返す
   * @return {string} - M or F
   */
  get_sex: function(){
    var M = document.getElementById(ID.get_signup_ID().radio).checked;
    if (M === true) {
      return 'M';
    }else{
      return 'F';
    }
  }
};