/************************************************************
                        change_password.html
 ************************************************************/
var Change_Password = {

  /**
   * パスワード画面へ遷移を行い、keyupイベントを登録する
   */
  initialize: function() {
    Utility.hideKeyboardAccessoryBar(false);

    //イベント登録
    var addevent = function(){
      document.getElementById(ID.get_change_password_ID().now_password).addEventListener('keyup',Change_Password.check_form);
      document.getElementById(ID.get_change_password_ID().new_password).addEventListener('keyup',Change_Password.check_form);
      document.getElementById(ID.get_change_password_ID().re_new_password).addEventListener('keyup',Change_Password.check_form);
    };

    Utility.check_page_init(ID.get_change_password_ID().page_id, addevent);
    Utility.push_page(ID.get_change_password_ID().tmp_id, '', 0, '');
  },


  /**
   * パスワード入力フォームの文字数を監視し、変更ボタンの無効・有効を切り替える
   */
  check_form: function() {
    var now_pass = document.getElementById(ID.get_change_password_ID().now_password).value;
    var new_pass = document.getElementById(ID.get_change_password_ID().new_password).value;
    var re_new_pass = document.getElementById(ID.get_change_password_ID().re_new_password).value;

    var submit_button = document.getElementById(ID.get_change_password_ID().submit_password);
    if (now_pass.length >= 6 && new_pass.length >= 6 && re_new_pass.length >= 6) {
      submit_button.removeAttribute('disabled');
    }else {
      submit_button.setAttribute('disabled', 'disabled');
    }
  },


  /**
   * 変更ボタンを押した際に、パスワード入力フォームのチェックを行い、
   * APIへリクエストを送信する。
   */
  tap_submit_button: function() {
    Utility.show_spinner(ID.get_change_password_ID().page_id);

    var now_pass = document.getElementById(ID.get_change_password_ID().now_password).value;
    var new_pass = document.getElementById(ID.get_change_password_ID().new_password).value;
    var re_new_pass = document.getElementById(ID.get_change_password_ID().re_new_password).value;
    var storage = window.localStorage;

    if (now_pass !== storage.getItem(ID.get_localStorage_ID().password)) {
      Utility.show_error_alert('パスワード変更エラー', '現在のパスワードが間違っています', 'OK');
      Utility.stop_spinner();
    }else if(now_pass === new_pass) {
      Utility.show_error_alert('パスワード変更エラー', '現在のパスワードと新しいパスワードは同じにできません', 'OK');
      Utility.stop_spinner();
    }else if(new_pass !== re_new_pass) {
      Utility.show_error_alert('パスワード変更エラー', '新しいパスワードの入力を再度確認してください', 'OK');
      Utility.stop_spinner();
    }else if(now_pass === storage.getItem(ID.get_localStorage_ID().password)) {
      var data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "now_password": now_pass,
        "new_password": new_pass
      };

      Utility.FiNote_API('update_password', data, 'POST', 'v1').then(function(token_obj) {
        var json_data = JSON.parse(token_obj);
        storage.setItem(ID.get_localStorage_ID().password, new_pass);
        storage.setItem(ID.get_localStorage_ID().token, json_data.token);

        Utility.stop_spinner();
        var alert = document.getElementById(ID.get_change_password_ID().success_alert);
        alert.show();
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    }
  }
};