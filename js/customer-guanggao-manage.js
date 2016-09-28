function cancelGuanggao(status,guanggao_bianhao){
    if (status=="cancel") {
        tips("您已取消该广告请求！","info")
        return false;
    };
    if (status=="going") {
        tips("不可以取消投放中的广告！","info")
        return false;
    };
    if (status=="check_fail") {
        tips("不可以取消审核失败的广告！","danger")
        return false;
    };
    if (status=="pause") {
        tips("不可以取消暂停的广告！","danger")
        return false;
    };
    if (status=="complete") {
        tips("不可以取消已完成的广告！","danger")
        return false;
    };
    var username = $.trim($("#curr-user").text());
    ozhuan_ajax_db("cancelGuanggao",[username,guanggao_bianhao],function(data){
        if (data["result"]) {
            window.location.href = "/guanggaoManage";
        };
    })
}

function getUserGuanggaoInfo(page,guanggao_type){
    // 设定当前status
    $("#now_click_status").val(guanggao_type)
    
    // 获取用户广告详情
    if (guanggao_type !="all") {
        $("#getAllGuanggaoInfo").removeClass("active")
    };
    var username = $.trim($("#curr-user").text())
    ozhuan_ajax_db("getUserGuanggaoInfo",[username,page,guanggao_type],function(data){
        
        guanggaoStatus = {"cancel":"已取消","going":"投放中","wait_check":"待审核","check_fail":"审核失败","pause":"暂停","complete":"完成","all":"所有"}
        
        
        if(data["total"] != 0){
            // console.log(data["ret_data"])
            $('#guanggaoInfoPage').bootpag({
                total:data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            var tbody = $("<tbody id='guanggaoInfoList'></tbody>");
            for (var i = 0; i < data["ret_data"].length; i++) {
                var tr = $('<tr align="center"></tr>');
                var currStatus = data["ret_data"][i][2];

                tr.append('<td>' + data["ret_data"][i][0] + '</td>');
                tr.append('<td>' + data["ret_data"][i][1] + '</td>');
                // tr.append('<td>' + data["ret_data"][i][2] + '</td>');
                tr.append('<td>' + guanggaoStatus[currStatus] + '</td>');
                tr.append('<td>' + data["ret_data"][i][3] + '</td>');
                tr.append('<td>' + data["ret_data"][i][4] + '</td>');
                tr.append('<td>' + data["ret_data"][i][5] + '</td>');
                tr.append('<td>' + data["ret_data"][i][6] + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][7].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][8].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][9].toFixed(2) + '</td>');

                var btnStr = "<a class=\"btn btn-danger btn-xs\" onclick=\"cancelGuanggao(\'"+data["ret_data"][i][2]+"\',"+ data["ret_data"][i][10]+ ")\" href=\"#\" "
                if (currStatus != "wait_check") {
                    btnStr += " title=\""+guanggaoStatus[currStatus]+"时不可取消广告\" style=\"cursor:not-allowed\" "
                };
                btnStr += ">取消广告</a></td>";
                tr.append(btnStr)
                tbody.append(tr);
            }
            $("#guanggaoInfoList").replaceWith(tbody);  
        }else{
            if (data["guanggao_status"] != "all") {
                var trStr = "<tr><td colspan='11' style='color:red;text-align:center;'>目前没有<b>"+guanggaoStatus[guanggao_type]+"</b>的广告记录!</td></tr>"; 
            }else{
                var trStr = "<tr><td colspan='11' style='color:red;text-align:center;'>目前没有任何添加广告记录!</td></tr>"; 
            };
            // tbody.append(tr);
            $("#guanggaoInfoList").empty();
            $("#guanggaoInfoList").append(trStr); 
        }
    })
}

$(document).ready(function() {

    // 获取用户广告概况
    $("#get_user_guanggao_breif").click(function(){
        var username = $.trim($("#curr-user").text())
        ozhuan_ajax_db("getUserGuanggaoBreif",username,function(data){
            // console.log(data["result"])
            if(!data["result"]){
                tips("消费信息获取失败！请重新刷新页面","warning")
            }else{
                var guanggaoBreif = data["ret_data"];
                $("#cancel").html(guanggaoBreif["cancel"])
                $("#going").html(guanggaoBreif["going"])
                $("#wait_check").html(guanggaoBreif["wait_check"])
                $("#check_fail").html(guanggaoBreif["check_fail"])
                $("#pause").html(guanggaoBreif["pause"])
                $("#complete").html(guanggaoBreif["complete"])
                $("#all").html(guanggaoBreif["all"])
            }
        })
    })
    $("#get_user_guanggao_breif").click()


    // 已添加广告详情
    $("#guanggaoInfoPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        var searchStatus = $("#now_click_status").val()
        getUserGuanggaoInfo(page,searchStatus);
    });

    //默认从服务器读取所有广告信息
    $("#getAllGuanggaoInfo").click()

});