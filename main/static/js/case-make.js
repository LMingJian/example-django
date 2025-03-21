$(document).ready(function() {

    var pid = GetQueryString('pid');
    var cid = GetQueryString('cid');
    var uid = GetQueryString('user');
    var jm = null;
    const csrftoken = getCookie('csrftoken');
    var toast = new bootstrap.Toast($(".toast"));

    function open_mind(data){
        var options = {
            container:'jsmind_container',
            theme:'primary',
            editable:true,
            mode: 'side',
        }
        if(data == ''){
            jm = jsMind.show(options);
        }else{
            jm = jsMind.show(options, data);
        }
        $('.jsmind-inner').scrollLeft(70);
        let container = document.querySelector(".jsmind-inner");
        container.addEventListener("wheel", (event) => {
            event.preventDefault();
            container.scrollLeft += event.deltaY;
        });
    }

    // 返回按钮
    $('body').on('click', '#back-button', function(){
        if(uid != 'Null'){
            $(window).attr('location', `/case?id=${pid}&user=${uid}`);
        }else{
            $(window).attr('location', `/case?id=${pid}`);
        }
    })

    $.ajax({
        type: 'get',
        url: 'api/get_case_data',
        data: {'cid': cid},
        success: function(res){
            if(res.status !== 10000){
                $(".toast-body").text('服务器异常');
                return toast.show();
            }else{
                open_mind(res.message);
            }
        }
    })

    $(window).keydown(function(event){
        if(event.ctrlKey  &&  window.event.keyCode==83 ){
            let data = jm.get_data('node_tree')
            let name = $('.edit').text()
            $.ajax({
                type: 'post',
                url: 'api/modify_case_data',
                data: {'cid': cid, 'case_name': name, 'case_data': JSON.stringify(data)},
                headers: { 'X-CSRFToken': csrftoken },
                success: function(res){
                    if(res.status !== 10000){
                        $(".toast-body").text('服务器异常');
                        toast.show();
                    }else{
                        $(".toast-body").text('保存成功');
                        toast.show();
                    }
                }
            })
            return false
        }
    })

    $('.edit').on('dblclick', function(event){
        let e = event.target
        if(e.innerHTML.indexOf('type="text"') > 0 ){  //判断是否进入编辑状态
            return
        }
        let newdiv = document.createElement( 'input' )//创建一个input标签
        newdiv.type = 'text'                          //设置标签类型
        newdiv.className = 'edit-input'      
        newdiv.value = e.innerHTML                    //将原来文本内容赋值给input标签
        e.innerHTML = ''             //清除原来的内容
        e.appendChild(newdiv)        //将input标签添加到元素中
        newdiv.setSelectionRange(0, e.innerHTML.length)  //设置光标选中位置
        newdiv.focus()               //设置元素获得焦点，失去焦点触发onblur
        newdiv.onblur = blur         //设置失去焦点事件
        function blur(){
            e.innerHTML = this.value   //将文本内容重新赋值给元素
        }
        newdiv.onkeyup = function(key){ //设置回车时执行失去焦点事件
            if(key.key == 'Enter'){ newdiv.blur() }
        }
    })

    $('#save').click(function(){
        let data = jm.get_data('node_tree')
        let name = $('.edit').text()
        $.ajax({
            type: 'post',
            url: 'api/modify_case_data',
            data: {'cid': cid, 'case_name': name, 'case_data': JSON.stringify(data)},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    $(".toast-body").text('保存成功');
                    return toast.show();
                }
            }
        })
    })

    $('#next-only').click(function(){
        if(uid != 'Null'){
            parm = {'cid': cid, 'pid': pid, 'uid': uid};
        }else{
            parm = {'cid': cid, 'pid': pid};
        }
        $.ajax({
            type: 'get',
            url: 'api/get_next_case',
            data: parm,
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    let message = res.message
                    if(message != 'None'){
                        if(uid != 'Null'){
                            $(window).attr('location', `/case_make?cid=${message}&pid=${pid}&user=${uid}`);
                        }else{
                            $(window).attr('location', `/case_make?cid=${message}&pid=${pid}`);
                        }
                    }else{
                        $(".toast-body").text('已经是最后一个了');
                        return toast.show();
                    } 
                }
            }
        })
    })

    $('#back-only').click(function(){
        if(uid != 'Null'){
            parm = {'cid': cid, 'pid': pid, 'uid': uid};
        }else{
            parm = {'cid': cid, 'pid': pid};
        }
        $.ajax({
            type: 'get',
            url: 'api/get_back_case',
            data: parm,
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    let message = res.message
                    if(message != 'None'){
                        if(uid != 'Null'){
                            $(window).attr('location', `/case_make?cid=${message}&pid=${pid}&user=${uid}`);
                        }else{
                            $(window).attr('location', `/case_make?cid=${message}&pid=${pid}`);
                        }
                    }else{
                        $(".toast-body").text('已经是第一个了');
                        return toast.show();
                    } 
                }
            }
        })
    })

    $('#next-save').click(function(){
        let data = jm.get_data('node_tree');
        let name = $('.edit').text();
        let user = $('#dropdownUser strong').text();
        $.ajax({
            type: 'post',
            url: 'api/get_next_newCase',
            data: {'cid': cid, 'case_name': name, 'case_data': JSON.stringify(data), 'creater': user},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    let message = res.message
                    $(window).attr('location', `/case_make?cid=${message}&pid=${pid}`);
                }
            }
        })
    })

    $('.case-status').click(function(){
        var status_id = $(this).attr('value')
        $.ajax({
            type: 'post',
            url: 'api/modify_case_status',
            data: {'case_id': cid, 'status_id': status_id},
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('服务器异常');
                    return toast.show();
                }else{
                    let message = res.message
                    if(message != 'None'){
                        $(window).attr('location', `/case_make?cid=${message}&pid=${pid}`);
                    }else{
                        $(".toast-body").text('最后一个了');
                        return toast.show();
                    }  
                }
            }
        })

    })

})