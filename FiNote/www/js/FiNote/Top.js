/************************************************************
                        top.html
 ************************************************************/
var Top = {
  /**
   * カルーセルの変更イベントをキャッチして、ツールバーのメッセージを変更する関数
   */
  check_post_change: function(){
    document.addEventListener('postchange', function(event) {
      if (event.target.id === 'top_carousel') {
        console.log('active carousel is ' + event.activeIndex);

        var toolbar_center = document.getElementById(ID.get_top_ID().toolbar_center);
        if (event.activeIndex === 0) {
          toolbar_center.innerHTML = 'ユーザ登録';
        }else {
          toolbar_center.innerHTML = 'ログイン';
        }
      }
    });
  },


  prev: function() {
    var carousel = document.getElementById(ID.get_top_ID().carousel);
    carousel.prev();
  },


  next: function() {
    var carousel = document.getElementById(ID.get_top_ID().carousel);
    carousel.next();
  }
};