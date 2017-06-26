/************************************************************
                       change_email.html
 ************************************************************/
var Change_Email = {

  /**
   * メールアドレス変更画面へ遷移を行い、イベントを登録する
   */
  initialize: function() {
    Utility.hideKeyboardAccessoryBar(true);

    //イベント登録
    var addevent = function(){
      document.getElementById(ID.get_change_email_ID().input_new_email).addEventListener('keyup',Change_Email.check_form);
    };

    Utility.check_page_init(ID.get_change_email_ID().page_id, addevent);
    Utility.push_page(ID.get_change_email_ID().tmp_id, '', 0, '');
  },


  /**
   * 新しいメールアドレス入力フォームのスペースを除く文字数に応じて、
   * 変更ボタンの有効・無効を切り替える
   */
  check_form: function() {
    var new_email = document.getElementById(ID.get_change_email_ID().input_new_email).value;
    new_email = new_email.replace(/\s+/g, '');

    var submit_button = document.getElementById(ID.get_change_email_ID().submit_email);
    if (new_email.length !== 0) {
      submit_button.removeAttribute('disabled');
    }else {
      submit_button.setAttribute('disabled', 'disabled');
    }
  },


  /**
   * メールアドレスのバリデーションをローカルでチェックし、
   * 問題がなければAPIへリクエストを送信し、
   * 返ってきた新しいメールアドレスをローカルに保存する
   */
  tap_submit_button: function() {
    Utility.show_spinner(ID.get_change_email_ID().page_id);

    var new_email = document.getElementById(ID.get_change_email_ID().input_new_email).value;

    if(Utility.validateMail(new_email)) {
      var storage = window.localStorage;
      var data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "new_email": new_email
      };

      Utility.FiNote_API('update_email', data, 'POST', 'v1').then(function(new_email_obj) {
        Utility.stop_spinner();

        // json形式にしてからローカルへ新しいメールアドレスを保存
        var json_data = JSON.parse(new_email_obj);
        storage.setItem(ID.get_localStorage_ID().email, json_data.new_email);

        // 新しいメールアドレスで設定画面の文字を上書き
        document.getElementById(ID.get_setting_ID().email).innerHTML = new_email;

        // メールアドレスの変更に成功した旨を伝えるアラートを表示
        var alert = document.getElementById(ID.get_change_email_ID().success_alert);
        alert.show();
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    }else {
      Utility.stop_spinner();
      Utility.show_error_alert('エラー', '有効なメールアドレスを入力してください', 'OK');
    }
  }
};