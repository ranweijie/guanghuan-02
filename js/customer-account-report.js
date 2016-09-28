
$(document).ready(function() {

    // 获取用户消费信息
    $("#getAccountReport").click(function(){
        var username = $.trim($("#curr-user").text())
        ozhuan_ajax_db("getAccountReport",username,function(data){
            // console.log(data["result"])
            if(!data["result"]){
                tips("消费信息获取失败！请重新刷新页面","warning")
            }else{
                var consumeInfo = data["ret_data"];
                $("#today_cost").html(consumeInfo["today_cost"].toFixed(2))
                $("#yesterday_cost").html(consumeInfo["yesterday_cost"].toFixed(2))
                $("#last7_cost").html(consumeInfo["last7_cost"].toFixed(2))
                $("#last30_cost").html(consumeInfo["last30_cost"].toFixed(2))
                $("#curr_money").html(consumeInfo["curr_money"].toFixed(2))
            }
        })
    })
    $("#getAccountReport").click()

});