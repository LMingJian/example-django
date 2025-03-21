$(document).ready(function() {

    sessionStorage.setItem('scrollTop-a', 0);
    sessionStorage.setItem('scrollTop-b', 0);
    sessionStorage.setItem('selected-n', 0);

    $('.page-nav').scroll(function() {
        sessionStorage.setItem('scrollTop-b', $('.page-nav').scrollTop());
    });

    $('.page-detail').scroll(function() {
        sessionStorage.setItem('scrollTop-a', $('.page-detail').scrollTop());
    });

    const csrftoken = getCookie('csrftoken');
    var toast = new bootstrap.Toast($(".toast"));
    var vid_temp = -1;
    var modal = new bootstrap.Modal(document.getElementById('modifyVersionModal'));

    // 返回按钮
    $('#back').click(function(){
        $(window).attr('location', '/version');
    })

    // 目录鼠标点击
    $('body').on('click', '.page-nav a', function(){
        sessionStorage.setItem('selected-n', `a[href='${$(this).attr('href')}']`);
        if(!$(this).hasClass("active")){
            $(".page-nav a").each(function(){
                if($(this).hasClass("active")){
                    $(this).removeClass("active");
                }
            });
            $(this).addClass("active");
        }
    })

    $('body').on('click', '.ver-title', function(){
        vid = $(this).attr('id').replace('title-', '');
        vid_temp = vid;
        $.get("api/get_version_data", { 'vid': vid }, function(data) {
            if(data.status == 10000){
                $('#modifyVersionModal input').val(data.title);
                $('#modifyVersionModal textarea').val(data.note);
            }
        })

    })

    $('body').on('click', '.ver-switch', function(){
        vid = $(this).attr('id').replace('switch-', '');
        $.get("api/modify_version_status", { 'vid': vid }, function(data){
            if (data.status != 10000) {
                $(".toast-body").text('出现异常');
            }else{
                $(".toast-body").text('修改成功');
                $('#version').load(' .page-content', function(){
                    $('.page-detail').scrollTop(sessionStorage.getItem('scrollTop-a'));
                    $('.page-nav').scrollTop(sessionStorage.getItem('scrollTop-b'));
                    $('.page-nav').scroll(function() {
                        sessionStorage.setItem('scrollTop-b', $('.page-nav').scrollTop());
                    });
                    $('.page-detail').scroll(function() {
                        sessionStorage.setItem('scrollTop-a', $('.page-detail').scrollTop());
                    });
                    if(sessionStorage.getItem('selected-n') != 0){
                        $(".page-nav a").each(function(){
                            if($(this).hasClass("active")){
                                $(this).removeClass("active");
                            }
                        });
                        $(sessionStorage.getItem('selected-n')).addClass("active");
                    }
                });
            }
            return toast.show();
        });
    })

    $('.modal').on('hidden.bs.modal', function(){
        $('.modal input').val('');
        $('.modal textarea').val('');
    })

    $('#modifyVersionModal .btn-primary').click(function(){
        title = $('#modifyVersionModal input').val();
        note = $('#modifyVersionModal textarea').val();
        $.ajax({
            url: 'api/modify_version_data',
            type: 'post',
            dataType: 'json',
            data: {'vid': vid_temp, 'title': title, 'note': note},
            cache: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                if (data.status != 10000) {
                    $(".toast-body").text('出现异常');
                }else{
                    $(".toast-body").text('修改成功');
                    $('#version').load(' .page-content', function(){
                        $('.page-detail').scrollTop(sessionStorage.getItem('scrollTop-a'));
                        $('.page-nav').scrollTop(sessionStorage.getItem('scrollTop-b'));
                        $('.page-nav').scroll(function() {
                            sessionStorage.setItem('scrollTop-b', $('.page-nav').scrollTop());
                        });
                        $('.page-detail').scroll(function() {
                            sessionStorage.setItem('scrollTop-a', $('.page-detail').scrollTop());
                        });
                        if(sessionStorage.getItem('selected-n') != 0){
                            $(".page-nav a").each(function(){
                                if($(this).hasClass("active")){
                                    $(this).removeClass("active");
                                }
                            });
                            $(sessionStorage.getItem('selected-n')).addClass("active");
                        }
                    });
                }
                return toast.show();
            }
        })
        return modal.hide();
    })


})