function bugSum(){
    $('#work-navbar .navbar-brand span').remove();
    let count = 0
    $('#work-navbar .nav-list .bug-count').each(function(){
        let temp = $(this).text();
        count = count + parseInt(temp);
    })
    if(count == '0'){
        return;
    }
    var ele_span = document.createElement('span');
    ele_span.className = "badge rounded-pill bg-danger ms-2 pb-1";
    ele_span.innerHTML = count;
    $('#work-navbar .navbar-brand').append(ele_span);
}

// 目录
function catalogue(){

    let user = $('#dropdownUser strong').text();
    var ele_h1 = document.createElement('a');
    ele_h1.className = "navbar-brand";
    ele_h1.href = '#' + $('#bug-item h1').attr('id');
    ele_h1.text = $('#bug-item h1').text();
    var ele_nav = document.createElement('nav');
    ele_nav.className = "nav nav-pills flex-column nav-list";
    var ele_list = [];

    // 拼接目录
    $('#bug-item h2, #bug-item h3, #bug-item h4, #bug-item h5').each(function(){
        var ele_temp = document.createElement('a');
        ele_temp.href = '#' + $(this).attr('id');
        ele_temp.text = $(this).text();
        let node_name = $(this).prop('localName');
        if(node_name == 'h2'){
            ele_temp.className = "nav-link";   
        }else if(node_name == 'h3'){
            ele_temp.className = "nav-link margin-25";
        }else if(node_name == 'h4'){
            ele_temp.className = "nav-link margin-50";
        }else if(node_name == 'h5'){
            ele_temp.className = "nav-link margin-75";
        }else{
            return;
        }
        let node = $('#accordion' + $(this).attr('id'));
        if(node.length != 0){
            let count = node.children("li").length;
            if(count != 0){
                var ele_span = document.createElement('span');
                ele_span.className = "badge bg-danger ms-2 bug-count";
                ele_span.innerHTML = count/2;
                ele_temp.append(ele_span);
            }
        }
        if(user != '游客'){
            var ele_delete = document.createElement('span');
            ele_delete.className = "badge bg-secondary ms-1 float-right node-delete";
            ele_delete.innerHTML = '删除';
            ele_temp.append(ele_delete);
            var ele_modify = document.createElement('span');
            ele_modify.className = "badge bg-secondary ms-1 float-right node-modify";
            ele_modify.innerHTML = '修改';
            ele_temp.append(ele_modify);
        }
        ele_list.push(ele_temp);
    })
    
    // 添加进节点
    ele_list.forEach(function(value){
        ele_nav.append(value);
    })

    // 添加进网页
    $('#work-navbar').append(ele_h1);
    $('#work-navbar').append(ele_nav);
    $('#work-navbar nav a:nth-child(1)').addClass("text-white active selected");

    bugSum();

    $('.nav-list').scroll(function() {
        sessionStorage.setItem('scrollTop-b', $('.nav-list').scrollTop());
    });

    if(sessionStorage.getItem('scrollTop-b') != "undefined"){
        $('.nav-list').scrollTop(sessionStorage.getItem('scrollTop-b'));
    }

    if(sessionStorage.getItem('selected-n') != "undefined" && sessionStorage.getItem('selected-n') != 0){
        let select = sessionStorage.getItem('selected-n');
        if(!$(select).hasClass("selected")){
            $("#work-navbar nav a").each(function(){
                if($(this).hasClass("selected")){
                    $(this).removeClass("selected");
                    $(this).removeClass("active");
                    $(this).removeClass("text-white");
                }
            });
            $(select).addClass("selected");
            $(select).addClass("text-white");
            $(select).addClass("active"); 
        }
    }
}

function reload(){
    setTimeout(() => {
        $('#container').load(' .workspace-row', function(){
            catalogue();
        })
    }, 600);
}

$(document).ready(()=>{

    $('#bug-item').scroll(function() {
        sessionStorage.setItem('scrollTop-a', $('#bug-item').scrollTop());
    });

    if(sessionStorage.getItem('scrollTop-a') != "undefined"){
        $('#bug-item').scrollTop(sessionStorage.getItem('scrollTop-a'));
    }

    const csrftoken = getCookie('csrftoken');
    var toast = new bootstrap.Toast($(".toast"));
    var modal = new bootstrap.Modal(document.getElementById('addNodeModal'));
    var modal_bug = new bootstrap.Modal(document.getElementById('addBugModal'));
    var modal_notes = new bootstrap.Modal(document.getElementById('addBugNotesModal'));
    let modal_version = new bootstrap.Modal(document.getElementById('addVersionModal'));
    let modal_modify_node = new bootstrap.Modal(document.getElementById('modifyNodeModal'));
    let modal_delete_node = new bootstrap.Modal(document.getElementById('deleteNodeModal'));

    // 添加节点计数，以判断多个节点导入是否成功
    let add_node_flag = 0;
    // 项目ID
    let project_id = GetQueryString('id');
    // 当前展开的BUG
    const expand_bug = new Map();
    // 标志，是否更新
    let if_get = true;

    // 目录
    catalogue();

    // 异步函数
    $.extend({
        add_node: function(node, father, name, number, len){
            // node: 节点类型
            add_node_flag ++;
            $.ajax({
                url: 'api/create_node',
                type: 'post',
                dataType: 'json',
                data: { 'node': node, 'fid': father, 'name': name, 'rid': number},
                cache: false,
                headers: { 'X-CSRFToken': csrftoken },
                success: function (data) {
                    if (data.status != 10000) {
                        $(".toast-body").text('接口异常');
                        return toast.show();
                    }else{
                        // 判断多个节点是否导入完成
                        if(len == add_node_flag){
                            add_node_flag = 0;
                            $(".toast-body").text('导入完成');
                            toast.show();
                            window.location.reload();       
                            // 清空数据，更新BUG
                            expand_bug.clear();
                            if_get = true;
                            return;
                        }
                    }
                },
                error: function(){
                    $(".toast-body").text('接口异常');
                    return toast.show();
                }
            });
        },
        add_bug: function(project_id, node_flag, node_id, name, tester, status_id, tag_id, notes, version_id, type_id){
            $.ajax({
                url: 'api/create_bug',
                type: 'post',
                dataType: 'json',
                data: { 'project_id': project_id, 'node_flag': node_flag, 'node_id': node_id, 
                        'name': name, 'tester': tester, 'status_id': status_id,
                        'tag_id': tag_id, 'notes': notes, 'vid': version_id, 'type_id': type_id},
                cache: false,
                headers: { 'X-CSRFToken': csrftoken },
                success: function (data) {
                    if (data.status != 10000) {
                        $(".toast-body").text('接口异常');
                        return toast.show();
                    }else{
                        $(".toast-body").text('导入成功');
                        toast.show();
                        window.location.reload();
                        // 清空数据，更新BUG
                        expand_bug.clear();
                        if_get = true;
                        return;
                    }
                },
                error: function(){
                    $(".toast-body").text('接口异常');
                    return toast.show();
                }
            });
        }
    })

    // 导出缺陷
    $('body').on('click', '#export-bug', function(){
        $.ajax({
            type: 'get',
            url: 'api/export_bug',
            data: {'pid': project_id},
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
    
    // 返回按钮
    $('body').on('click', '#back-button', function(){
        $(window).attr('location', '/workspace');
    })

    // 目录鼠标进入
    $('body').on('mouseenter', '#work-navbar nav a', function(){
        $(this).addClass("text-white");
        $(this).addClass("active"); 
    })

    // 目录鼠标离开
    $('body').on('mouseleave', '#work-navbar nav a', function(){
        if(!$(this).hasClass("selected")){
            $(this).removeClass("active");
            $(this).removeClass("text-white");
        }   
    })

    // 目录鼠标点击
    $('body').on('click', '#work-navbar nav a', function(){
        sessionStorage.setItem('selected-n', `a[href='${$(this).attr('href')}']`);
        if(!$(this).hasClass("selected")){
            $("#work-navbar nav a").each(function(){
                if($(this).hasClass("selected")){
                    $(this).removeClass("selected");
                    $(this).removeClass("active");
                    $(this).removeClass("text-white");
                }
            });
            $(this).addClass("selected");
        }
    })

    // 回到目录最顶部
    $('body').on('click', '#work-navbar .navbar-brand', function(){
        $("#work-navbar nav a").each(function(){
            if($(this).hasClass("selected")){
                $(this).removeClass("selected");
                $(this).removeClass("active");
                $(this).removeClass("text-white");
            }
        });
        $('#work-navbar nav a:nth-child(1)').addClass("text-white active selected");
        $("#work-catalogue .nav-pills").scrollTop(0);
    })

    // 使用于下拉表单的 H1 节点获取
    $('body').on('click', '.btn-import', ()=>{
        $.ajax({
            type: 'get',
            url: 'api/get_node',
            data: {'fid': project_id, 'querynode': 'h1'},
            success: function(res){
                if(res.status === 10000){
                    $.each(res.message, (key, value) => {
                        let ele_option = document.createElement('option');
                        ele_option.className = 'value';
                        ele_option.value = "h1-" + key.replace('a', '');
                        ele_option.text = value;
                        $('.node_to_h1').append(ele_option);
                    })
                }
            }
        })
    })

    // 使用于下拉表单的 H2 节点获取
    $('.node_to_h1').on('change', function(){
        $('.node_to_h2 .value').remove();
        $('.node_to_h3 .value').remove();
        $('.node_to_h4 .value').remove();
        // 父节点 ID
        let fid = $(this).val().replace('h1-', '');
        if(fid === ''){
            return;
        }
        $.ajax({
            type: 'get',
            url: 'api/get_node',
            data: {'fid': fid, 'querynode': 'h2'},
            success: function(res){
                if(res.status === 10000){
                    $.each(res.message, (key, value) => {
                        let ele_option = document.createElement('option');
                        ele_option.className = 'value';
                        ele_option.value = "h2-" + key.replace('a', '');
                        ele_option.text = value;
                        $('.node_to_h2').append(ele_option);
                    })
                }
            }
        })
    })

    // 使用于下拉表单的 H3 节点获取
    $('.node_to_h2').on('change', function(){
        $('.node_to_h3 .value').remove();
        $('.node_to_h4 .value').remove();
        // 父节点 ID
        let fid = $(this).val().replace('h2-', '');
        if(fid === ''){
            return;
        }
        $.ajax({
            type: 'get',
            url: 'api/get_node',
            data: {'fid': fid, 'querynode': 'h3'},
            success: function(res){
                if(res.status === 10000){
                    $.each(res.message, (key, value) => {
                        let ele_option = document.createElement('option');
                        ele_option.className = 'value';
                        ele_option.value = "h3-" + key.replace('a', '');
                        ele_option.text = value;
                        $('.node_to_h3').append(ele_option);
                    })
                }
            }
        })
    })

    // 使用于下拉表单的 H4 节点获取
    $('.node_to_h3').on('change', function(){
        $('.node_to_h4 .value').remove();
        // 父节点 ID
        let fid = $(this).val().replace('h3-', '');
        if(fid === ''){
            return;
        }
        $.ajax({
            type: 'get',
            url: 'api/get_node',
            data: {'fid': fid, 'querynode': 'h4'},
            success: function(res){
                if(res.status === 10000){
                    $.each(res.message, (key, value) => {
                        let ele_option = document.createElement('option');
                        ele_option.className = 'value';
                        ele_option.value = "h4-" + key.replace('a', '');
                        ele_option.text = value;
                        $('.node_to_h4').append(ele_option);
                    })
                }
            }
        })
    })

    // Modal 关闭后清除输入
    $('.modal').on('hidden.bs.modal', function(){
        $('.modal select').val('');
        $('.modal select .value').remove();
        $('.modal input').val('');
        $('.modal textarea').val('');
    })

    // 添加节点
    $('#addNodeModal .btn-primary').on('click', ()=>{
        let h1 = $('#addNodeModal .node_to_h1').val();
        let h2 = $('#addNodeModal .node_to_h2').val();
        let h3 = $('#addNodeModal .node_to_h3').val();
        let a=[],b=[],c=[],d=[];
        // 名称
        $('#addNodeModal .a').each(function(){
            c.push($(this).val());
        })
        // 序号
        $('#addNodeModal .b').each(function(){
            d.push($(this).val());
        })
        // 排除空值
        c.forEach(function(element, index){
            if(element != '' && d[index] != ''){
                a.push(element);
                b.push(d[index]);
            }
        });
        if(a.length == 0){
            modal.hide();
            $(".toast-body").text('请输入数据');
            return toast.show();
        }
        if(h1 !== ''){
            if(h2 !== ''){
                if(h3 !== ''){
                    // console.log('node to h4')
                    let father = $('#addNodeModal .node_to_h3').val().replace('h3-', '');
                    a.forEach(function(element, index){
                        $.add_node('h4', father, element, b[index], a.length);
                    });
                }else{
                    // console.log('node to h3')
                    let father = $('#addNodeModal .node_to_h2').val().replace('h2-', '');
                    a.forEach(function(element, index){
                        $.add_node('h3', father, element, b[index], a.length);
                    });
                }
            }else{
                let father = $('#addNodeModal .node_to_h1').val().replace('h1-', '');
                a.forEach(function(element, index){
                    $.add_node('h2', father, element, b[index], a.length);
                });
            }
        }else{
            // console.log('node to h1')
            let father = $('#bug-item h1').attr('id').replace('project-', '');
            a.forEach(function(element, index){
                $.add_node('h1', father, element, b[index], a.length);
            });
        }
        return modal.hide();
    })

    // 添加 BUG
    $('#addBugModal .btn-primary').on('click', ()=>{
        let h1 = $('#addBugModal .node_to_h1').val();
        let h2 = $('#addBugModal .node_to_h2').val();
        let h3 = $('#addBugModal .node_to_h3').val();
        let h4 = $('#addBugModal .node_to_h4').val();

        let name = $('#bug_name').val();
        let notes = $('#bug_notes').val();
        let tag = $('#bug_tag').val();
        let user = $('#dropdownUser strong').text();
        let status_id = $('#bug_status').val().replace('status-', '');
        let type_id = $('#bug_type').val().replace('type-', '');
        let version_id = $('#bug_version').val().replace('version-', '');
        let tag_id = '';
        tag.forEach((element)=>{
            tag_id = tag_id + element.replace('tag-', '') + ',';
        })
        
        if(status_id == '' || type_id == ''){
            $(".toast-body").text('请选择状态或类型');
            toast.show();
            return modal_bug.hide();
        }
        if(h1 !== ''){
            if(h2 !== ''){
                if(h3 !== ''){
                    if(h4 !== ''){
                        // console.log('bug to h4')
                        node_id = h4.replace('h4-', '');
                        $.add_bug(project_id, 'h4', node_id, name, user, status_id, tag_id, notes, version_id, type_id);
                    }else{
                        // console.log('node to h3')
                        node_id = h3.replace('h3-', '');
                        $.add_bug(project_id, 'h3', node_id, name, user, status_id, tag_id, notes, version_id, type_id);
                    }
                }else{
                    // console.log('node to h2')
                    node_id = h2.replace('h2-', '');
                    $.add_bug(project_id, 'h2', node_id, name, user, status_id, tag_id, notes, version_id, type_id);
                }
            }else{
                // console.log('node to h1')
                node_id = h1.replace('h1-', '');
                $.add_bug(project_id, 'h1', node_id, name, user, status_id, tag_id, notes, version_id, type_id);
            }
        }else{
            // console.log('select h1')
            $(".toast-body").text('请选择节点');
            toast.show();
        }
        return modal_bug.hide();
    })

    // 改变 BUG 状态
    $('body').on('change', '.selectBugStatus', function(){
        let status_id = $(this).val().replace('status-', '');
        let bug_id = $(this).attr('id').replace('selectBugStatus-', '');
        let reload_target = '#' + $('#bug-' + bug_id).parents(".accordion").attr('id');
        let reload_content = ' ' + reload_target + ' li';
        $.ajax({
            type: 'get',
            url: 'api/modify_bug_status',
            data: {'bug_id': bug_id, 'status_id': status_id},
            success: function(res){
                if(res.status === 10000){
                    $(".toast-body").text('修改成功');
                    toast.show();
                    $(reload_target).load(reload_content);
                    // 变更数据统计
                    if(res.message.includes('关闭')){
                        $.get("api/get_bug_father", { 'bug_id': bug_id }, function(data) {
                            if(data.status == 10000){
                                let temp = '#' + data.node + '-' + data.id
                                let count = $('[href="' + temp + '"] span.bug-count').text()
                                if(count-1 != 0){
                                    $('[href="' + temp + '"] span.bug-count').text(count-1)
                                }else{
                                    $('[href="' + temp + '"] span.bug-count').remove()
                                }
                                bugSum();  
                            }
                        })
                    }
                    // 清空数据，更新BUG
                    expand_bug.clear();
                    if_get = true;
                    return;
                }
            }
        })
    })

    // 改变 BUG 标签
    $('body').on('change', '.selectBugTag', function(){
        let tag_id = $(this).val().replace('tag-', '');
        let bug_id = $(this).attr('id').replace('selectBugTag-', '');
        let reload_target = '#' + $('#bug-' + bug_id).parents(".accordion").attr('id');
        let reload_content = ' ' + reload_target + ' li';
        $.ajax({
            type: 'get',
            url: 'api/modify_bug_tag',
            data: {'bug_id': bug_id, 'tag_id': tag_id},
            success: function(res){
                if(res.status === 10000){
                    $(".toast-body").text('修改成功');
                    toast.show();
                    $(reload_target).load(reload_content);
                    expand_bug.clear();
                    if_get = true;
                    return;
                }
            }
        })
    })

    // 改变 BUG 版本
    $('body').on('change', '.cBugVersion', function(){
        let version_id = $(this).val().replace('version-', '');
        let bug_id = $(this).attr('id').replace('cBugVersion-', '');
        let reload_target = '#' + $('#bug-' + bug_id).parents(".accordion").attr('id');
        let reload_content = ' ' + reload_target + ' li';
        $.ajax({
            type: 'get',
            url: 'api/modify_bug_version',
            data: {'bug_id': bug_id, 'version_id': version_id},
            success: function(res){
                if(res.status === 10000){
                    $(".toast-body").text('修改成功');
                    toast.show();
                    $(reload_target).load(reload_content);
                    expand_bug.clear();
                    if_get = true;
                    return;
                }
            }
        })
    })

    // 改变 BUG 类型
    $('body').on('change', '.cBugType', function(){
        let type_id = $(this).val().replace('type-', '');
        let bug_id = $(this).attr('id').replace('cBugType-', '');
        let reload_target = '#' + $('#bug-' + bug_id).parents(".accordion").attr('id');
        let reload_content = ' ' + reload_target + ' li';
        $.ajax({
            type: 'get',
            url: 'api/modify_bug_type',
            data: {'bug_id': bug_id, 'type_id': type_id},
            success: function(res){
                if(res.status === 10000){
                    $(".toast-body").text('修改成功');
                    toast.show();
                    $(reload_target).load(reload_content);
                    expand_bug.clear();
                    if_get = true;
                    return;
                }
            }
        })
    })
    
    // 展开BUG，更新备注内容
    $('body').on('click', '.accordion-button', function(){
        let bug_target = $(this).attr('data-bs-target');
        // 展开 BUG 字典没有该数据，添加进入
        if(!expand_bug.has(bug_target)){
            expand_bug.set(bug_target, false);
            if_get = true;
        }
        // 该 BUG 为真，展开中被点击，置假，关闭
        if(expand_bug.get(bug_target)){
            return expand_bug.set(bug_target, false);
        }
        // if_get 为真则更新数据
        if(if_get){
            let bug_id = bug_target.replace('#bug-', '');
            $.ajax({
                type: 'get',
                url: 'api/get_bug_data',
                data: {'bug_id': bug_id},
                success: function(res){
                    if(res.status === 10000){
                        let ele_list = [];
                        let ele_text = res.content.split('\n');
                        ele_text.forEach((value)=>{
                            let ele = document.createElement('p');
                            ele.innerHTML = value;
                            ele_list.push(ele);
                        })
                        let element = document.getElementById('bugText-'+bug_id);
                        while (element.firstChild) {
                            element.removeChild(element.firstChild);
                        }
                        $('#bugText-'+bug_id).append(ele_list);
                    }
                }
            })
            let user = $('#dropdownUser strong').text()
            if(user != '游客'){
                $.get(
                    "api/get_version", 
                    { 'fid': project_id }, 
                    function(data) {
                        if(data.status == 10000){
                            let element = document.getElementById('cBugVersion-'+bug_id);
                            while (element.firstChild) {
                                element.removeChild(element.firstChild);
                            }
                            let ele_one = document.createElement('option');
                            ele_one.value = "";
                            ele_one.text = '绑定版本';
                            $('#cBugVersion-'+bug_id).append(ele_one);
                            $.each(data.message, (key, value) => {
                                let ele_option = document.createElement('option');
                                ele_option.value = "version-" + key.replace('a', '');
                                ele_option.text = value;
                                $('#cBugVersion-'+bug_id).append(ele_option);
                            })
                        }
                    }
                )
            }  
            // 已更新
            if_get = false;
        }
        // 展开 BUG
        expand_bug.set(bug_target, true)
    })

    // 修改 BUG 备注按钮点击，预埋初始数据，BUG-ID,备注
    $('body').on('click', '.cBugText', function(){
        curr_bug = $(this).attr('id').replace('cBugText-', '');
        $.ajax({
            type: 'get',
            url: 'api/get_bug_data',
            data: {'bug_id': curr_bug},
            success: function(res){
                if(res.status === 10000){
                    $('#addBugNotesModal input').val(res.name);
                    $('#addBugNotesModal textarea').val(res.content); 
                    modal_notes.show();
                }
            }
        })
        $('#addBugNotesModal').attr('value', curr_bug);
    })

    // 修改 BUG 备注
    $('#addBugNotesModal .btn-primary').on('click', ()=>{
        let note = $('#addBugNotesModal textarea').val();
        let name = $('#addBugNotesModal input').val();
        let user = $('#dropdownUser strong').text();
        let curr_bug = $('#addBugNotesModal').attr('value');
        $.ajax({
            url: 'api/modify_bug_data',
            type: 'post',
            dataType: 'json',
            data: { 'bug_id': curr_bug, 'note': note, 'user': user, 'name': name},
            cache: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                if (data.status != 10000) {
                    $(".toast-body").text('出现异常');
                    return toast.show();
                }else{
                    modal_notes.hide()
                    $(".toast-body").text('修改成功');
                    toast.show();
                    window.location.reload();
                    // 清空数据，更新BUG
                    expand_bug.clear();
                    if_get = true;
                    return;
                };
            },
            error: function(){
                $(".toast-body").text('服务器异常');
                return toast.show();
            }
        });
    })

    // 添加版本
    $('#addVersionModal .btn-primary').click(()=>{
        let name = $('#addVersionModal input').val();
        let note = $('#addVersionModal textarea').val();
        if(name==''){
            $(".toast-body").text('输入为空');
            modal_version.hide();
            return toast.show();
        }
        $.ajax({
            url: 'api/create_version',
            type: 'post',
            dataType: 'json',
            data: { 'fid': project_id, 'name': name, 'note': note},
            cache: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                if (data.status != 10000) {
                    $(".toast-body").text('出现异常');
                }else{
                    $(".toast-body").text('修改成功');
                }
            }
        })
        expand_bug.clear();
        if_get = true;
        modal_version.hide();
        return toast.show();
    })

    // 预埋版本数据
    $('#addBugModal').on('show.bs.modal', ()=>{
        $.get("api/get_version", { 'fid': project_id }, function(data) {
            if(data.status == 10000){
                $.each(data.message, (key, value) => {
                    let ele_option = document.createElement('option');
                    ele_option.className = 'value';
                    ele_option.value = "version-" + key.replace('a', '');
                    ele_option.text = value;
                    $('#bug_version').append(ele_option);
                })
            }
        })
    })

    $('body').on('click', '.node-modify', (event)=>{
        let node_target = $(event.target.parentNode).attr('href');
        let node_name = $(node_target).text().split(' | ');
        $('#modifyNodeModal input:nth-child(2)').val(node_name[0]);
        $('#modifyNodeModal input:nth-child(4)').val(node_name[1]);
        $('#modifyNodeModal').attr('data', node_target)
        modal_modify_node.show();
    })

    $('body').on('click', '.node-delete', (event)=>{
        let node_target = $(event.target.parentNode).attr('href');
        $('#deleteNodeModal').attr('data', node_target)
        modal_delete_node.show();
    })

    // 修改节点
    $('#modifyNodeModal .btn-primary').click(()=>{
        let number = $('#modifyNodeModal input:nth-child(2)').val();
        let name = $('#modifyNodeModal input:nth-child(4)').val();
        let data = $('#modifyNodeModal').attr('data').split('-')
        if(name==''){
            $(".toast-body").text('输入为空');
            modal_modify_node.hide();
            return toast.show();
        }
        $.ajax({
            url: 'api/modify_node',
            type: 'post',
            dataType: 'json',
            data: { 'name': name, 'number': number, 'node_id': data[1], 'node_type': data[0]},
            cache: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                if (data.status != 10000) {
                    $(".toast-body").text('出现异常');
                }else{
                    $(".toast-body").text('修改成功');
                    window.location.reload();
                }
            }
        })
        modal_modify_node.hide();
        return toast.show();
    })

    // 删除节点
    $('#deleteNodeModal .btn-primary').click(()=>{
        let data = $('#deleteNodeModal').attr('data').split('-')
        $.ajax({
            url: 'api/delete_node',
            type: 'post',
            dataType: 'json',
            data: { 'node_type': data[0], 'node_id': data[1]},
            cache: false,
            headers: { 'X-CSRFToken': csrftoken },
            success: function (data) {
                if (data.status != 10000) {
                    $(".toast-body").text('出现异常');
                }else{
                    $(".toast-body").text('修改成功');
                    window.location.reload();
                }
            }
        })
        modal_delete_node.hide();
        return toast.show();
    })

})