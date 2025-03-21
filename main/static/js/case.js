$(document).ready(function() {

    var pid = GetQueryString('id');
    let user = $('#dropdownUser strong').text();
    let uid = $('#dropdownUser strong').prop('id').replace('user', '');
    const csrftoken = getCookie('csrftoken');
    var toast = new bootstrap.Toast($(".toast"));

    // 返回按钮
    $('body').on('click', '#back-button', function(){
        $(window).attr('location', '/case');
    })

    // 创建
    $('#case-make').click(function(){
        $.ajax({
            type: 'post',
            url: 'api/create_case',
            data: {'pid': pid, 'creater': user, 'uid': uid},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    $(window).attr('location', `/case_make?cid=${res.message}&pid=${pid}&user=${uid}`);
                }
            }
        })
    })

    // 删除
    $('.delete').click(function(){
        let cid = $(this).attr('data');
        $.ajax({
            type: 'delete',
            url: 'api/delete_case',
            data: {'cid': cid},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    window.location.reload();
                }
            }
        })
    })

    $('#export-case').click(function(){
        $.ajax({
            type: 'get',
            url: 'api/export_case',
            data: {'uid': uid, 'pid': pid},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    const elink = document.createElement('a') // 创建a标签
                    elink.style.display = 'none'
                    elink.href = res.message
                    document.body.appendChild(elink)
                    elink.click() // 触发链接
                    document.body.removeChild(elink)
                    $(".toast-body").text('下载成功: File 200');
                    return toast.show();
                }
            }
        })
    })

})