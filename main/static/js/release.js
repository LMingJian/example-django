$(document).ready(function() {

    var toast = new bootstrap.Toast($(".toast"));
    var modal = new bootstrap.Modal(document.getElementById('replaceModal'));
    const csrftoken = getCookie('csrftoken');

    // 清理输入
    $('.modal').on('hidden.bs.modal', function(){
        $("input").val('');
    })

    // 返回按钮
    $('#back-button').click(function(){
        $(window).attr('location', '/release');
    })

    // 文件上传
    $('#btn-upload').on('click', function() {
        $(this).addClass('disabled');
        var release_id = $("#container h3").attr('data');
        var file_name = $('#file-name').val();
        var file_notes = $("#file-notes").val();
        // 获取文件列表
        const selectedFile = document.getElementById('file-input').files[0];
        // 判断是否选择了文件
        // console.log(selectedFile)
        if (typeof(selectedFile) == "undefined" || selectedFile.length <= 0) {
            $(".toast-body").text('请先选择文件');
            $('input').val('');
            $(this).removeClass('disabled');
            return toast.show();
        }
        // 创建formdata
        var fileData = new FormData();
        // 向formdata中传入数据
        fileData.append('avatar', selectedFile);
        fileData.append('name', file_name);
        fileData.append('notes', file_notes);
        fileData.append('rid', release_id);
        // 用ajax传送数据
        /*
        fileData = new FormData()
        fileData.append('avatar', '')
        */
        $(".pro").removeClass("pro-disable");
        $.ajax({
            type: 'post',
            url: '/api/upload_release',
            timeout : 0,
            // 数据不需要编码
            cache: false,
            contentType: false,
            processData: false,
            data: fileData,
            headers: { 'X-CSRFToken': csrftoken },
            xhr: function(){
                myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                  myXhr.upload.addEventListener('progress',function(e) {
                    if (e.lengthComputable) {
                      var percent = Math.floor(e.loaded/e.total*100);
                      if(percent <= 100) {
                        $(".progress-bar").css('width', percent.toString()+'%');
                      }
                      if(percent >= 100) {
                        console.log('completely upload');
                      }
                    }
                  }, false);
                }
                return myXhr;
            },
            success: function(res) {
                // 判断是否接收成功
                if (res.status !== 10000) {
                    $(".toast-body").text('上传失败: ' + res.message);
                }else{
                    $(".toast-body").text('上传成功');
                }
                $('input').val('');
                $('.release-table').load(' .table');
                $('#btn-upload').removeClass('disabled');
                $(".pro").addClass("pro-disable");$(".progress-bar").css('width', '0%');
                return toast.show();
            },
            error: function(res) {
                $(".toast-body").text('Error: ' + res.message);
                $('input').val('');
                $('.release-table').load(' .table');
                $('#btn-upload').removeClass('disabled');
                $(".pro").addClass("pro-disable");$(".progress-bar").css('width', '0%');
                return toast.show();
            }
        })
    })

    // 下载
    $('body').on('click', '.download', function(){
        $(this).attr("disabled",true).css("pointer-events","none"); 
        var tag = $(this);
        var id = $(this).attr('data');
        var name = $(this).attr('name');
        $.ajax({
            type: 'get',
            url: 'api/download_release',
            data: {'id': id, 'name': name},
            success: function(res){
                if(res.status !== 10000){
                    tag.attr("disabled",false).css("pointer-events","auto"); 
                    $(".toast-body").text('下载失败: ' + res.message);
                    return toast.show();
                }else{
                    const elink = document.createElement('a') // 创建a标签
                    elink.style.display = 'none'
                    elink.href = res.message
                    document.body.appendChild(elink)
                    elink.click() // 触发链接
                    document.body.removeChild(elink)
                    tag.attr("disabled",false).css("pointer-events","auto"); 
                    $(".toast-body").text('下载成功: File 200');
                    return toast.show();
                }
            },
            error: function(res){
                tag.attr("disabled",false).css("pointer-events","auto"); 
                $(".toast-body").text('下载失败: ' + res.status);
                return toast.show();
            }
        })
    })

    // 删除
    $('.release-table').on('click', '.delete', function(){
        var id = $(this).attr('data');
        $.ajax({
            type: 'get',
            url: 'api/delete_release',
            data: {'id': id},
            success: function(res){
                if(res.status !== 10000){
                    $(".toast-body").text('删除失败: ' + res.message);
                    return toast.show();
                }else{
                    $(".toast-body").text('删除成功');
                    toast.show();
                    return $('.release-table').load(' .table');
                }
            }
        })
    })

    // 替换
    $('.release-table').on('click', '.replace', function(){
        var id = $(this).attr('data');
        $('#replaceModal').attr('data', id);
        modal.show();
    })

    $('#replaceModal').on('click', '.btn-primary', function(){
        modal.hide();
        var id = $("#replaceModal").attr('data');
        // 获取文件列表
        const selectedFile = document.getElementById('replace-file').files[0];
        // 判断是否选择了文件
        // console.log(selectedFile)
        if (typeof(selectedFile) == "undefined" || selectedFile.length <= 0) {
            $(".toast-body").text('请先选择文件');
            return toast.show();
        }
        // 创建formdata
        var fileData = new FormData();
        // 向formdata中传入数据
        fileData.append('avatar', selectedFile);
        fileData.append('id', id);
        // 用ajax传送数据
        /*
        fileData = new FormData()
        fileData.append('avatar', '')
        */
        $(".pro").removeClass("pro-disable");
        $.ajax({
            type: 'post',
            url: '/api/replace_release',
            timeout : 0,
            // 数据不需要编码
            cache: false,
            contentType: false,
            processData: false,
            data: fileData,
            headers: { 'X-CSRFToken': csrftoken },
            xhr: function(){
                myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                  myXhr.upload.addEventListener('progress',function(e) {
                    if (e.lengthComputable) {
                      var percent = Math.floor(e.loaded/e.total*100);
                      if(percent <= 100) {
                        $(".progress-bar").css('width', percent.toString()+'%');
                      }
                      if(percent >= 100) {
                        console.log('completely upload');
                      }
                    }
                  }, false);
                }
                return myXhr;
            },
            success: function(res) {
                // 判断是否接收成功
                if (res.status !== 10000) {
                    $(".toast-body").text('替换失败: ' + res.message);
                }else{
                    $(".toast-body").text('替换成功');
                }
                $(".pro").addClass("pro-disable");$(".progress-bar").css('width', '0%');
                return toast.show();
            },
            error: function(res) {
                $(".toast-body").text('Error: ' + res.message);
                $(".pro").addClass("pro-disable");$(".progress-bar").css('width', '0%');
                return toast.show();
            }
        })
    })

});