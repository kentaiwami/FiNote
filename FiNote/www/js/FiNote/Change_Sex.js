/************************************************************
                      change_sex.html
 ************************************************************/
var Change_Sex = {

  /**
   * ローカルに保存されている性別の値に応じて、チェック状態を変える。
   * その後、画面遷移を行う。
   */
  initialize: function() {
    var callback = function() {
      var storage = window.localStorage;
      var now_sex = storage.getItem(ID.get_localStorage_ID().sex);

      var radio_id = '';
      if (now_sex === 'M') {
        radio_id = ID.get_change_sex_ID().radio_m;
      }else {
        radio_id = ID.get_change_sex_ID().radio_f;
      }

      document.getElementById(radio_id).setAttribute('checked', 'checked');
    };

    Utility.check_page_init(ID.get_change_sex_ID().page_id, callback);
    Utility.push_page(ID.get_change_sex_ID().tmp_id, '', 0, '');
  },


  /**
   * 引き渡された性別の識別子をサーバとローカルに保存する
   * @param  {string} sex - M or F
   */
  save_data: function(sex) {
    Utility.show_spinner(ID.get_change_sex_ID().page_id);

    var storage = window.localStorage;
    var data = {
      "token": storage.getItem(ID.get_localStorage_ID().token),
      "new_sex": sex
    };

    Utility.FiNote_API('update_sex', data, 'POST', 'v1').then(function(sex_obj) {
      // json形式にしてからローカルへ新しい性別を保存
      var json_data = JSON.parse(sex_obj);
      storage.setItem(ID.get_localStorage_ID().sex, json_data.new_sex);

      Utility.stop_spinner();
      console.log(storage.getItem(ID.get_localStorage_ID().sex) + ' is seted.');

      // アラートの表示
      var alert = document.getElementById(ID.get_change_sex_ID().success_alert);
      alert.show();
    })
    .catch(function(err) {
      console.log(err);
      Utility.stop_spinner();
      Utility.show_error_alert('エラー発生', err, 'OK');
    });
  }
};