$(document).ready(function() {
    var toast = new bootstrap.Toast($(".toast"));
    var modal_release_create = new bootstrap.Modal(document.getElementById('release-create'));
    var modal_series_add = new bootstrap.Modal(document.getElementById('series-add'));
    // var modal_series_delete = new bootstrap.Modal(document.getElementById('series-delete'));
    const csrftoken = getCookie('csrftoken');

    $('.modal').on('hidden.bs.modal', function(){
        $("input").val('');
        $('select').val('');
    })

    // 创建发行项目
    $("body").on('click', "#release-create .modal-footer .btn-primary", ()=>{
        var release_name = $('#release-name').val();
        var series_id = $('#release-create select').val().replace('series-', '');
        if(release_name === ''){
            $(".toast-body").text('请输入发行名称');
            modal_release_create.hide();
            return toast.show();
        }else{
            $.ajax({
                type: 'post',
                url: '/api/create_release2',
                data: {'release_name': release_name, 'series_id': series_id},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    if (res.status !== 10000) {
                        $(".toast-body").text('创建失败: ' + res.message);
                    }else{
                        $(".toast-body").text('创建成功');
                        $('#release-content').load(' .row');
                    }
                    modal_release_create.hide();
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
                url: '/api/create_release2_series',
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

    // 删除分类
    $("body").on('click', '#series-delete .modal-footer .btn-primary', ()=>{
        var id = $('#series-delete select').val();
        modal_series_delete.hide();
        $.ajax({
            type: 'get',
            url: '/api/delete_release2_series',
            data: {'id': id.replace('series-', '')},
            success: function(res) {
                if (res.status !== 10000) {
                    $(".toast-body").text('删除失败');
                }else{
                    $(".toast-body").text('删除成功');
                    $('#release-content').load(' .row');
                    $("option[value='"+id+"']").remove();
                }
                return toast.show();
            },
            error: function(){
                $(".toast-body").text('删除失败');
                return toast.show();
            }
        })
    })

})