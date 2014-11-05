
// Cordova Polyfill
var CordovaUtil = function() {
    var oldAlert = window.alert;
    window.alert = function(message, titleLabel, buttonLabel){
        titleLabel = titleLabel ? titleLabel : 'Alert';
        buttonLabel = buttonLabel ? buttonLabel : 'OK';

        if(navigator.notification){
            navigator.notification.alert(message, null, titleLabel, buttonLabel);
        } else {
            oldAlert(message);
        }
    };

    function handleExternalURLs() {
        // Handle click events for all external URLs
        if (device.platform.toUpperCase() === 'ANDROID') {
            $(document).on('click', 'a[href^="http"]', function (e) {
                var url = $(this).attr('href');
                navigator.app.loadUrl(url, {openExternal: true});
                e.preventDefault();
            });
        }
        else if (device.platform.toUpperCase() === 'IOS') {
            $(document).on('click', 'a[href^="http"]', function (e) {
                var url = $(this).attr('href');
                window.open(url, '_system');
                e.preventDefault();
            });
        }
        else {
            // Leave standard behaviour
        }
    }

    var init = function(){
        // Mock device.platform property if not available
        if (!window.device) {
            window.device = {platform: 'Browser'};
        }

        handleExternalURLs();
        alert('1', 'title');
    };

    init();
};

document.addEventListener('deviceready', function(){
    CordovaUtil.apply(this, arguments);
}, false);