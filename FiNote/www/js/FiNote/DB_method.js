/************************************************************
                        DB Method
 ************************************************************/
/*
  データベース関連のメソッドをまとめたオブジェクト
*/
var DB_method = {

  /**
   * 指定したテーブルのレコード件数を返す
   * @param  {string} table_name - レコード件数を取得したいテーブル名
   * @return {Promise}           - 成功時：レコード件数、失敗時：エラーメッセージ
   */
  count_record: function(table_name) {
    return new Promise(function(resolve,reject) {
      var db = Utility.get_database();
      var query = 'SELECT COUNT(*) AS count FROM ' + table_name;
      db.executeSql(query, [], function (resultSet) {
        resolve(Number(JSON.stringify(resultSet.rows.item(0).count)));
      },
      function(error) {
        console.log('COUNT RECORD ERROR: ' + error.message);
        reject(error.message);
      });
    });
  },


  /**
   * データベースのレコードを全削除する
   */
  delete_all_record: function() {
    var db = Utility.get_database();

    db.transaction(function(tx) {
      tx.executeSql('DELETE FROM movie');
      tx.executeSql('DELETE FROM genre');
      tx.executeSql('DELETE FROM onomatopoeia');
      tx.executeSql('DELETE FROM profile_img');
      tx.executeSql('DELETE FROM sqlite_sequence');
    },
    function(err) {
      console.log('DELETE ALL RECORD ERROR: ' +JSON.stringify(err) +' ' + err.message);
    });
  },


  /**
   * シングルSQLを実行する関数
   * @param  {string} query     - クエリー文
   * @param  {Array} data_list  - クエリー内に埋め込む値を格納した配列
   * @return {Promise}          - 成功時：クエリーの実行結果，失敗時：エラーメッセージ
   */
  single_statement_execute: function(query,data_list) {
    return new Promise(function(resolve,reject) {
      var db = Utility.get_database();

      db.executeSql(query, data_list, function(resultSet) {
        resolve(resultSet);
      },
      function(error) {
        console.log(error.message);
        reject(error.message);
      });
    });
  }
};