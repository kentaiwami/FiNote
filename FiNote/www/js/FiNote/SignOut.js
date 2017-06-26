/************************************************************
                          SignOut
 ************************************************************/
var SignOut = {

  /**
   * サインアウトを実行する関数。
   * ローカルデータの全削除、全ページのリセット、トップページへの遷移
   */
  run_signout: function() {
    var func0 = function(){};
    var func1 = function(){
      Utility.show_spinner(ID.get_setting_ID().page_id);

      // ローカルデータの削除
      DB_method.delete_all_record();
      Utility.delete_localstorage();

      Utility.stop_spinner();

      // 全てのページをリセット
      document.getElementById(ID.get_utility_ID().navigator).resetToPage().then(function () {
        Utility.show_confirm_alert('ログアウトの完了', 'ログアウトしました', ['OK'], Index.check_signup);
			});
    };
    Utility.show_confirm_alert('ログアウトの確認', 'ログアウトしますか？', ['キャンセル', 'ログアウト'], func0, func1);
  }
};