window.fbAsyncInit = function() {
    FB.init({
        appId      : FACEBOOK_ID,
        xfbml      : true,
        version    : 'v2.8'
    });
};

// Load the SDK asynchronously
(function(d, s, id) {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) return;
js = d.createElement(s); js.id = id;
js.src = "https://connect.facebook.net/en_US/sdk.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


function fbLogin(completion) {

    FB.login(function(response) {

        if (response.authResponse) {
            fetchInformation(response.authResponse.signedRequest, completion);
        } else {

            completion();
        }

    }, { scope: 'public_profile,email' });
}

function fetchInformation(signedRequest, completion) {
    var l = $('#btn-login-facebook').ladda();

    FB.api('/me?fields=id,name,last_name,first_name,email,gender,link', function(response) {

        $.post(WEB_ROOT + 'user/fblogin', {
            facebook: response,
            signedRequest: signedRequest
        }, function(retorno) {

            if (retorno.success == false) {

                if(typeof retorno.redirect_register != 'undefined' && retorno.redirect_register == true) {
                    window.location = WEB_ROOT + 'user/cadastro';
                    return;
                }

                swal("Atenção", retorno.message);
                completion();
            } else {
                location.reload();
            }

            completion();
        });
    });

}

$(function() {
    $('#btn-login-facebook').on('click', function(e) {
        e.preventDefault();

        var l = $('#btn-login-facebook').ladda();
        l.ladda('start');

        fbLogin(function() {
            l.ladda('stop');
        });
    });

});