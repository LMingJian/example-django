$(document).ready(function(){

    const csrftoken = getCookie('csrftoken');
    var toast = new bootstrap.Toast($(".toast"));
    let user_id = $('.row').attr('id');

    $('.add-user .btn').click(()=>{
        let name = $('.add-user .username').val();
        let password = $('.add-user .password').val();
        if(name == ''){
            $(".toast-body").text('创建失败');
            return toast.show();
        }
        $.ajax({
            type: 'post',
            url: '/api/create_user',
            data: {'sid': user_id, 'name': name, 'password': password},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res) {
                // 判断是否接收成功
                if (res.status !== 10000) {
                    $(".toast-body").text('创建失败');
                    return toast.show();
                }else{
                    return window.location.reload();
                }
            },
        })

    })

    $('.add-tag .btn').click(()=>{
        let name = $('.add-tag .tagname').val();
        if(name == ''){
            $(".toast-body").text('创建失败');
            return toast.show();
        }
        $.ajax({
            type: 'post',
            url: '/api/create_tag',
            data: {'sid': user_id, 'tag': name},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res) {
                // 判断是否接收成功
                if (res.status !== 10000) {
                    $(".toast-body").text('创建失败');
                    return toast.show();
                }else{
                    return window.location.reload();
                }
            },
        })
    })

    $('.delete-session').click(()=>{
        $.ajax({
            type: 'delete',
            url: '/api/delete_session',
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res) {
                // 判断是否接收成功
                if (res.status !== 10000) {
                    $(".toast-body").text('删除失败');
                    return toast.show();
                }else{
                    return window.location.reload();
                }
            },
        })
    })

    var project = 0;
    var bug_status = 0;
    var case_status = 0;

    $('body').on('change', '#project-select', function(){
        select_value = this.value;
        project = select_value;
        if(select_value != 0){
            $.ajax({
                type: 'get',
                url: '/api/get_project_status',
                data: {'pid': select_value},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    // 判断是否接收成功
                    if (res.status !== 10000) {
                        $(".toast-body").text('服务器异常');
                        return toast.show();
                    }else{
                        if(res.message.bug == 1){
                            $('#flexSwitchBug')[0].checked=true;
                            bug_status = 1;
                        }else{
                            $('#flexSwitchBug')[0].checked=false;
                            bug_status = 0;
                        }
                        if(res.message.case == 1){
                            $('#flexSwitchCase')[0].checked=true;
                            case_status = 1;
                        }else{
                            $('#flexSwitchCase')[0].checked=false;
                            case_status = 0;
                        }
                    }
                },
            })
        }
    })

    $('body').on('change', '#flexSwitchBug', function(){
        if(this.checked){
            bug_status = 1;
        }else{
            bug_status = 0;
        }
    })

    $('body').on('change', '#flexSwitchCase', function(){
        if(this.checked){
            case_status = 1;
        }else{
            case_status = 0;
        }
    })

    $('.change-project').click(()=>{
        if(project != 0){
            $.ajax({
                type: 'post',
                url: '/api/modify_project_status',
                data: {'pid': project, 'bug': bug_status, 'case': case_status},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    if (res.status !== 10000) {
                        $(".toast-body").text('服务器异常');
                        return toast.show();
                    }else{
                        $(".toast-body").text('修改成功');
                        return toast.show();
                    }
                },
            })
        }
    })
})