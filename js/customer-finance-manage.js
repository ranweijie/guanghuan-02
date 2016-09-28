function goFinanceManagerPage(){
    window.location.href = "/financeManager";
}


function cancelCharge(bianhao,status){
    if (status=="cancel") {
        tips("SORRY，您已经取消过该充值记录了！","info")
        return false;
    };
    if (status=="success") {
        tips("SORRY，无法取消已经成功的充值请求！","info")
        return false;
    };
    if (status=="fail") {
        tips("SORRY，该项充值已失败，您可以直接删除记录！","info")
        return false;
    };
    var username = $.trim($("#curr-user").text());
    ozhuan_ajax_db("cancelCharge",[username,bianhao],function(data){
        if (data["result"]) {
            tips("已经成功取消充值","success")
            window.location.href = "/financeManage";
        };
    })
}

function delCharge(bianhao,status){
    if (status=="wait_pay") {
        tips("此项充值正在付款确认中，您正在直接删除充值需求！","info")
    };
    var username = $.trim($("#curr-user").text());
    ozhuan_ajax_db("delCharge",[username,bianhao],function(data){
        if (data["result"]) {
            tips("已经成功删除充值","success")
            window.location.href = "/financeManage";
        };
    })
}

function getUserChargeInfo(page){
    var username = $.trim($("#curr-user").text())
    ozhuan_ajax_db("getUserChargeInfo",[username,page],function(data){
        // console.log(JSON.stringify(data))
        $('#userChargeInfoPage').bootpag({
            total:data["total"]==0?1:data["total"],
            page: page,
            maxVisible: 10
        });

        var tbody = $("<tbody id='chargeInfoList'></tbody>");
        if(data["total"] !=0){
            var chargeStatus = {"wait_pay":"付款确认中","success":"充值成功","fail":"充值失败","cancel":"已取消","customer_del":"已删除"}
            var data = data["ret_data"];
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr align="center"></tr>');
                var currStatus = data[i][5];
                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td>' + data[i][3] + '</td>');
                tr.append('<td>' + data[i][4] + '</td>');
                tr.append('<td>' + chargeStatus[currStatus] + '</td>');
                tr.append('<td> &yen;' + data[i][6].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data[i][7].toFixed(2) + '</td>');
                tr.append('<td>' + data[i][8] + '</td>');
                var btnStr = "<td> <a class=\"btn btn-danger btn-xs\" onclick=\"cancelCharge("+ data[i][4]+ ",\'" +currStatus+ "\')\" href=\"javascript:;\" "
                if (currStatus != "wait_pay") {
                    btnStr += " title=\""+chargeStatus[currStatus]+"时不可取消记录\" style=\"cursor:not-allowed\" "
                };
                btnStr += ">取消充值</a></td>";
                tr.append(btnStr)
                tbody.append(tr)
            }
            $("#chargeInfoList").replaceWith(tbody);  
        }else{
            var trStr = "<tr><td colspan=\"10\" style=\"color:red;text-align:center;\">您目前没有任何充值记录!</td></tr>"; 
            // tbody.append(tr);
            $("#chargeInfoList").empty(); 
            $("#chargeInfoList").append(trStr); 
        }
    })
}

$(document).ready(function() {

    // 获取用户账户报告
    $("#getAccountReport").click(function(){
        var username = $.trim($("#curr-user").text())
        ozhuan_ajax_db("getAccountReport",username,function(data){
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


    $("#userChargeInfoPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        getPlublishTaskBreif(page);
    });

    // 获取用户充值列表
    $("#getUserChargeInfo").on("click", function() {
        var page = $('#userChargeInfoPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        getUserChargeInfo(page);
        return false;
    })
    $("#getUserChargeInfo").click()
  

});