$(document).ready(function() {

    // 侧边栏选择提示
    $("#sidebar-ul li a").hover(
      function(){
        $(this).removeClass("text-white");
        $(this).addClass("active");
      },
      function(){
        if(!$(this).hasClass("selected")){
          $(this).removeClass("active");
          $(this).addClass("text-white");
        }
      }
    )

    // 侧边栏选中提示
    $("#sidebar-ul li a").click(function(){
      if(!$(this).hasClass("selected")){
        $("#sidebar-ul li a").each(()=>{
          if($(this).hasClass("selected")){
            $(this).removeClass("selected");
            $(this).removeClass("active");
            $(this).addClass("text-white");
          }
        });
        $(this).addClass("selected");
      }
    })

    // 登出
    $("#logout").click(function(){
      $.ajax({
        url: '/api/logout',
        type: 'get',
        success: function (data) {
           if (data.status == 10000) {
             return window.location.reload();
           }
        }
      })
    })

})