
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        setTimeout(function() {
            navigator.splashscreen.hide();}, 500);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
};

//会員登録で使用  
function singup(){
     //mobile backendアプリとの連携
      var ncmb = new NCMB("f5f6c2e3aa823eea2c500446a62c5645c04fc2fbfd9833cb173e1d876f464f6c","605298c95c0ba9c654315f11c6817e790f21f83a0e9ff60dc2fdf626b1485899");
      var user = new ncmb.User();

    //ユーザー名・パスワードを設定
    user.set("userName", document.getElementById("username").value)
        .set("password", document.getElementById("password").value)

    // 新規登録
    user.signUpByAccount()
        .then(function(){
            // 登録後処理
            ons.notification.alert('登録が完了しました')
        })
        .catch(function(err){
            // エラー処理
            ons.notification.alert(err)
        });
}
     

app.initialize();