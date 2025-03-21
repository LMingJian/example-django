$(document).ready(function(){

    $.extend({
        case_count: function(){
            $.ajax({
                type: 'get',
                url: '/api/get_version_count',
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
                            ele_span.className = "badge rounded-pill bg-info text-dark ms-2 pb-1";
                            ele_span.innerHTML = '版本: '+count;
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

})