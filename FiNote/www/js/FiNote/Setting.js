/************************************************************
                        setting.html
 ************************************************************/
var Setting = {

  /**
   * 設定画面の描画に必要な情報を取得して表示を行う
   */
  show_contents: function() {
    var storage = window.localStorage;
    var username = storage.getItem(ID.get_localStorage_ID().username);
    var email = storage.getItem(ID.get_localStorage_ID().email);
    var adult = storage.getItem(ID.get_localStorage_ID().adult);

    var callback = function() {
      DB_method.count_record('profile_img').then(function(count_result) {
        // ユーザ名とメールアドレスの表示
        document.getElementById(ID.get_setting_ID().username).innerHTML = username;
        document.getElementById(ID.get_setting_ID().email).innerHTML = email;

        // アダルト作品のフラグからチェック状態を変更
        var adult_check = document.getElementById(ID.get_setting_ID().adult_check);
        if (adult === 'true') {
          adult_check.setAttribute('checked', 'checked');
        }else {
          adult_check.removeAttribute('checked');
        }

        // チェック状態が変更されるたびに保存を行うイベントを登録
        Setting.add_event_adult_check();

        var query = '';
        if (count_result === 0) {
          var img_html = document.getElementById(ID.get_setting_ID().profile_img);

          Utility.local_image_to_base64(img_html.src).then(function(base64) {
            return base64;
          })
          .then(function(base64) {
            query = 'INSERT INTO profile_img(img) VALUES(?)';
            return DB_method.single_statement_execute(query, [base64]);
          })
          .then(function(result) {
            console.log(result);
          })
          .catch(function(err) {
            console.log(err);
          });
        }else {
          var profile_img = document.getElementById(ID.get_setting_ID().profile_img);

          // 初期設定している画像がローカルから取得した画像を反映するまで表示されないようにする
          profile_img.src = '';

          query = 'SELECT img FROM profile_img WHERE id = 1';

          DB_method.single_statement_execute(query, []).then(function(result) {
            Utility.base64_to_image(result.rows.item(0).img, function(img) {
              profile_img.src = img.src;
            });
          })
          .catch(function(err) {
            console.log(err);
          });
        }
      })
      .catch(function(err) {
        console.log(err);
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    };

    Utility.check_page_init(ID.get_setting_ID().page_id,callback);
    Utility.push_page(ID.get_setting_ID().tmp_id, 'lift', 0, '');
  },


  /**
   * アダルトのチェックボタンが変更されるたびに、
   * ローカルへ保存するイベントを登録する
   */
  add_event_adult_check: function() {
    document.addEventListener('change', function(event) {
      if (event.target.id === ID.get_setting_ID().adult_check) {
        console.log(event.target.id + ' is changed ' + event.value);

        // チェック状態が変更されたらローカルDBへ保存
        var storage = window.localStorage;
        storage.setItem(ID.get_localStorage_ID().adult, event.value);
      }
    });
  },


  /**
   * パスワード、メールアドレス、性別の変更が完了した際に表示されるアラートを非表示にしてpop_pageを行う
   * @param  {[String]} id [アラートのid]
   */
  alert_hide: function(id) {
    var alert = document.getElementById(id);
    alert.hide();
    Utility.pop_page();
  },


  /**
   * プロフ画像の選択、ローカルとサーバへの保存を行う
   */
  tap_profile_img: function() {
    var cameraSuccess = function(image) {
      Utility.show_spinner(ID.get_setting_ID().page_id);

      var storage = window.localStorage;
      var query = 'UPDATE profile_img SET img = ? WHERE id = 1';
      var data = 'data:image/jpeg;base64,'+image;
      var api_request_data = {
        "token": storage.getItem(ID.get_localStorage_ID().token),
        "img": data
      };
      var promises =
      [
        DB_method.single_statement_execute(query, [data]),
        Utility.FiNote_API('update_profile_img', api_request_data, 'POST', 'v1')
      ];

      Promise.all(promises).then(function() {
        Utility.stop_spinner();

        // プロフィール画像を描画
        var img = document.getElementById(ID.get_setting_ID().profile_img);
        img.src = data;
      })
      .catch(function(err) {
        console.log(err);
        Utility.stop_spinner();
        Utility.show_error_alert('エラー発生', err, 'OK');
      });
    };

    var cameraError = function(message) {
      console.log('Camera Error: ' + message);
    };

    var options = {
      quality: 25,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.PICTURE,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: window.innerWidth * 0.2
    };

    // 写真の選択を行う
    navigator.camera.getPicture(cameraSuccess, cameraError, options);
  }
};