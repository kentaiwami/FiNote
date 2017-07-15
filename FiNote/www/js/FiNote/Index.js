/************************************************************
                        index.html
 ************************************************************/
/**
* indexで使用する関数をまとめたオブジェクト
* @type {Object}
*/
var Index = {
  formcheck: [false,false],   //[0]入力項目、[1]は生年月日に対応している


  /**
   * サインアップしているかを確認する
   */
  check_signup: function(){
    var storage = window.localStorage;
    var signup_flag = storage.getItem(ID.get_localStorage_ID().signup_flag);

    //ユーザ情報が登録されている場合は自動ログインを行う
    if (signup_flag === 'true') {
      Movies.run_draw_movie_content();

    //ユーザ情報が登録されていない場合はsignupへ遷移
    }else {
      Utility.push_page(ID.get_top_ID().tmp_id,'fade',1000, '');

      //イベント登録
      var addevent = function(){
        // sign upのフォームにイベントを登録
        document.getElementById(ID.get_signup_ID().username).addEventListener('keyup',Index.check_usernameAndpassword_form);
        document.getElementById(ID.get_signup_ID().password).addEventListener('keyup',Index.check_usernameAndpassword_form);
        document.getElementById(ID.get_signup_ID().email).addEventListener('keyup',Index.check_usernameAndpassword_form);

        // sign inのフォームにイベントを登録
        document.getElementById(ID.get_signin_ID().username).addEventListener('keyup',Signin.check_usernameAndpassword_form);
        document.getElementById(ID.get_signin_ID().password).addEventListener('keyup',Signin.check_usernameAndpassword_form);

      };

      // inputフォームの監視イベントを追加
      Utility.check_page_init(ID.get_top_ID().page_id,addevent);

      // カルーセルのページ変更を監視するイベントを追加
      Utility.check_page_init(ID.get_top_ID().page_id,Top.check_post_change);
    }
  },


  /**
   * ユーザ名とパスワード入力フォームのkeyupイベントが起きるたびに入力文字数を確認する
   */
  check_usernameAndpassword_form: function(){
    var username = document.getElementById(ID.get_signup_ID().username).value;
    var password = document.getElementById(ID.get_signup_ID().password).value;
    var email = document.getElementById(ID.get_signup_ID().email).value;

    Index.formcheck[0] = !(username.length === 0 || email.length === 0 || password.length < 6);

    Index.change_abled_signup_button();
  },


  /**
   * formcheck配列を確認して全てtrueならボタンをabledに、そうでなければdisabledにする
   */
  change_abled_signup_button: function(){
    if (Index.formcheck[0] === true && Index.formcheck[1] === true) {
      document.getElementById(ID.get_signup_ID().signup_button).removeAttribute('disabled');
    }else{
      document.getElementById(ID.get_signup_ID().signup_button).setAttribute('disabled', 'disabled');
    }
  }
};