$(document).ready(function() {

    var toast = new bootstrap.Toast($(".toast"));
    var modal = new bootstrap.Modal(document.getElementById('release-create'));
    var modal_series_add = new bootstrap.Modal(document.getElementById('series-add'));
    const csrftoken = getCookie('csrftoken');

    // Modal 隐藏后清理输入
    $('.modal').on('hidden.bs.modal', function(){
        $("input").val('');
        $('select').val('');
    })

    // 创建发行项目
    $("body").on('click', '#release-create .modal-footer .btn-primary', ()=>{
        var release_name = $('#release-name').val();
        var series_id = $('#release-create select').val().replace('series-', '');
        if(release_name === ''){
            $(".toast-body").text('请输入发行名称');
            modal.hide();
            return toast.show();
        }else{
            $.ajax({
                type: 'post',
                url: '/api/create_release',
                data: {'release_name': release_name, 'series_id': series_id},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    if (res.status !== 10000) {
                        $(".toast-body").text('创建失败: ' + res.message);
                    }else{
                        $(".toast-body").text('创建成功');
                        $('#release-content').load(' .row');
                    }
                    modal.hide();
                    return toast.show();
                },
            })
        }
    })

    // 新建种类
    $("#series-add .modal-footer .btn-primary").on('click', ()=>{
        var series_name = $('#series-name').val();
        if(series_name === ''){
            $(".toast-body").text('请输入种类名称');
            modal_series_add.hide();
            return toast.show();
        }else{
            $.ajax({
                type: 'post',
                url: '/api/create_release_series',
                data: {'series': series_name},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    if (res.status !== 10000) {
                        $(".toast-body").text('创建失败: ' + res.message);
                    }else{
                        $(".toast-body").text('创建成功');
                        $('#release-content').load(' .row');
                        $('#release-create').load(' #release-create .modal-dialog');
                    }
                    modal_series_add.hide();
                    return toast.show();
                },
            })
        }
    })

})