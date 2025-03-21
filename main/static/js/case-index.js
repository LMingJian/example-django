$(document).ready(function(){

    var toast = new bootstrap.Toast($(".toast"));
    var modal = new bootstrap.Modal(document.getElementById('caseModal'));
    const csrftoken = getCookie('csrftoken');

    $.extend({
        case_count: function(){
            $.ajax({
                type: 'get',
                url: '/api/get_case_count',
                data: {'flag': 1},
                success: function(res){
                    if(res.status == 10000){
                        $('.p-title').each(function(){
                            let pid = $(this).attr('id').replace('p-', '');
                            let count = res.message[pid]
                            if(count == '0'){
                                return;
                            }
                            var ele_span = document.createElement('span');
                            ele_span.className = "badge rounded-pill bg-primary ms-2 pb-1";
                            ele_span.innerHTML = '总共: '+count;
                            $(this).append(ele_span);
                        })
                    }
                    return;
                }
            })
        },
    })

    // 项目用例数量标志
    $.case_count();

    // 创建项目
    $(".modal-footer .btn-primary").on('click', function(){
        var case_name = $('#case-name').val();
        if(case_name === ''){
            $(".toast-body").text('请输入名称');
            modal.hide();
            return toast.show();
        }else{
            $.ajax({
                type: 'post',
                url: '/api/create_workspace_project',
                data: {'workspace_name': case_name, 'flag': 1},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res) {
                    // 判断是否接收成功
                    if (res.status !== 10000) {
                        $(".toast-body").text('创建失败: ' + res.message);
                    }else{
                        $(".toast-body").text('创建成功');
                        $('#list-content').load(' .row');
                    }
                    modal.hide();
                    return toast.show();
                },
            })
        }
    })

    // 清理输入
    $('.modal').on('hidden.bs.modal', function(){
        $("input").val('');
    })

})