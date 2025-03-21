// cookie 获取
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

// 请求参数获取
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substring(1).match(reg); // 获取url中"?"符后的字符串并正则匹配
    var context = "";
    if (r != null) {
        context = r[2];
    }
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "Null" : context;
}

$(document).ready(function(){
    console.log('ready!');
})