$(document).ready(function(){
  // 基于准备好的dom，初始化echarts实例，且必须指定模板div的宽高
  var myChart = echarts.init(document.getElementById('echart1'));
  var toast = new bootstrap.Toast($(".toast"));

  $.extend({
    statistics: function(flag, pid=0){
        if(pid != 0){
          var data = {'flag': flag, 'pid': pid}
        }else{
          var data = {'flag': flag}
        }
        $.ajax({
            type: 'get',
            url: '/api/get_bug_statistics',
            data: data,
            success: function(res) {
                if (res.status !== 10000) {
                  $(".toast-body").text('数据获取失败');
                  toast.show();
                  myChart.hideLoading();
                  myChart.clear();
                }else{
                  myChart.hideLoading();
                  myChart.setOption(res.message, true);
                  if(pid != 0){
                    $('#echart-select-type').attr('disabled', false);
                  }
                }
            },
            error: function(){
              $(".toast-body").text('数据获取失败');
              toast.show();
              myChart.hideLoading();
              myChart.clear();
            }
        })
    },
  })

  // 硬件
  $('body').on('change', '#echart-select-hardware', function(){
    $('#echart-select-software').val(0);
    $('#echart-select-type').val(0);
    if(this.value == 0){
      myChart.clear();
      $('#echart-select-type').attr('disabled', true);
      return 0;
    }else if(this.value == 999){
      myChart.showLoading();
      $('#echart-select-type').attr('disabled', true);
      $.statistics(1);  // 1:硬件，2:软件，3:硬件类型，4:软件类型
    }else{
      myChart.showLoading();
      $.statistics(3, this.value.replace('h-', ''));
      // 硬件 BUG 类型统计
    }
  })

  // 软件
  $('body').on('change', '#echart-select-software', function(){
    $('#echart-select-hardware').val(0);
    $('#echart-select-type').val(0);
    if(this.value == 0){
      myChart.clear();
      $('#echart-select-type').attr('disabled', true);
      return 0;
    }else if(this.value == 999){
      myChart.showLoading();
      $('#echart-select-type').attr('disabled', true);
      $.statistics(2);  // 1:硬件，2:软件，3:硬件类型，4:软件类型
    }else if(this.value == 1){
      myChart.showLoading();
      $.statistics(4, 1)
    }else if(this.value == 2){
      myChart.showLoading();
      $.statistics(4, 2)
    }else if(this.value == 3){
      myChart.showLoading();
      $.statistics(4, 3)
    }else if(this.value == 4){
      myChart.showLoading();
      $.statistics(4, 4)
    }
  })

  // 时间
  $('body').on('change', '#echart-select-type', function(){
    var hard = $('#echart-select-hardware').val();
    var soft = $('#echart-select-software').val();
    if(this.value == 0){
      myChart.showLoading();
      if(hard != 0 && hard != 999){
        flag = 3;
        pid = hard.replace('h-', '');
      }
      if(soft != 0 && soft != 999){
        flag = 4;
        pid = soft;
      }
      $.statistics(flag, pid);
    }else if(this.value == 1){
      myChart.showLoading();
      if(hard != 0 && hard != 999){
        flag = 5;
        pid = hard.replace('h-', '');
      }
      if(soft != 0 && soft != 999){
        flag = 6;
        pid = soft;
      }
      $.statistics(flag, pid);
    }
  })

})
