function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg); // 获取url中"?"符后的字符串并正则匹配
    var context = "";
    if (r != null) {
        context = r[2];
    }
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "Null" : context;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$(document).ready(function(){

    const csrftoken = getCookie('csrftoken');

    $("form").submit(function(event){
        var uesr_name = $("#floatingInput").val();
        var user_password = $("#floatingPassword").val();
        if (uesr_name == '' || user_password == '') {
            $('#tip').text('账号或密码为空');
        }else{
            $.ajax({
                url: '/api/login',
                type: 'post',
                dataType: 'json',
                data: { 'name': uesr_name, 'password': user_password },
                cache: false,
                headers: { 'X-CSRFToken': csrftoken },
                success: function (data) {
                    if (data.status == 10000) {
                        // console.log('success')
                        $(window).attr('location', '/');
                        /*
                        var next = GetQueryString('next');
                        if(next == "Null"){
                            $(window).attr('location', '/');
                        }else{
                            $(window).attr('location', next);
                        }*/
                    } else {
                        $('#tip').text('账号或密码错误');
                    };
                },
                error: function (e) {
                    $('#tip').text(e);
                }
            });
        }
        event.preventDefault();
    })

    $("input").focus(function () {
        $('#tip').text('');
    })
})