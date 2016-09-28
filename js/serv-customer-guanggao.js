
// 查看广告详情
function checkDetail(username,bianhao,status){
    tips("暂不支持此功能,完善中！","warning");
    return false;
}

// 审核通过
function successGuanggao(username,bianhao,status){
    if (status=="cancel") {
        tips("客户已取消该广告请求！","info")
        return false;
    };
    if (status=="check_fail") {
        tips("该项广告已经审核失败，无法修改状态！","info")
        return false;
    };
    if (status=="投放中") {
        tips("该广告正在投放中，无需再次审核！","info")
        return false;
    };
    if (status=="going") {
        tips("该项广告暂停中，无法修改状态！","info")
        return false;
    };
    if (status=="complete") {
        tips("该项广告已完成，无法修改状态！","info")
        return false;
    };
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '广告审核通过提示',
        message: '请务必在确认广告内容后，再确认审核通过！审核通过后将从广告主月中扣除本次所需费用<br>是否通过用户<strong>' + username + '</strong>的编号为'+bianhao+'的广告请求？',
        buttons: [{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            },
        }, {
            label: '确定',
            cssClass: 'btn-primary',
            action: function(dialog) {
                ozhuan_ajax_db("confirmCustomerGuanggao",[username,bianhao],function(data){
                    if (data["result"]) {
                        tips("操作成功")
                        // 获取平台广告概况
                        $("#getPlatformGuanggaoBrief").click()
                        // 获取平台广告详情
                        $("#getWaitCheckGuanggao").click()
                        // window.location.href = "/customerGuanggao";
                    };
                })
            }
        }]
    });
}

// 审核失败
function failGuanggao(username,bianhao,status){
    if (status=="cancel") {
        tips("客户已取消该广告请求！","info")
        return false;
    };
    if (status=="check_fail") {
        tips("该广告已经审核失败，无需再次审核！","info")
        return false;
    };
    if (status=="going") {
        tips("该广告正在投放中，无法修改状态！","info")
        return false;
    };
    if (status=="pause") {
        tips("该广告暂停中，无法修改状态！","info")
        return false;
    };
    if (status=="complete") {
        tips("该广告已完成，无法修改状态！","info")
        return false;
    };
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '广告审核失败提示',
        message: '您正在将该项广告请求的状态设置为失败！<br>是否要确认要将用户<strong>' + username + '</strong>的编号为'+bianhao+'的广告请求设为失败？',
        buttons: [{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            },
        }, {
            label: '确定',
            cssClass: 'btn-primary',
            action: function(dialog) {
                ozhuan_ajax_db("failCustomerrGuanggao",[username,bianhao],function(data){
                    if (data["result"]) {
                        // tips("操作成功")
                        // 获取平台广告概况
                        $("#getPlatformGuanggaoBrief").click()
                        // 获取平台广告详情
                        $("#getWaitCheckGuanggao").click()
                        // window.location.href = "/customerGuanggao";
                    };
                })
            }
        }]
    });
}
// 暂停广告
function pauseGuanggao(bianhao,status){
    tips("暂不支持此功能,完善中！","warning");
    return false;
}


function getCustomerGuanggaoInfo(page,guanggao_type){
    // 设定当前status
    $("#now_click_status").val(guanggao_type)

    // $("#customerGuanggaoList").empty();
    if (guanggao_type !="wait_check") {
        $("#getWaitCheckGuanggao").removeClass("active")
    };
    ozhuan_ajax_db("getCustomerGuanggaoInfo",[page,guanggao_type],function(data){
        // console.log("服务器数据==>",JSON.stringify(data))
        guanggaoStatus = {"cancel":"客户取消","wait_check":"待审核","check_fail":"审核失败","going":"投放中","pause":"暂停","complete":"完成","all":"所有"}
        
        if(data["total"] != 0){

            $('#customerGuanggaoPage').bootpag({
                total:data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            var tbody = $("<tbody id='customerGuanggaoList'></tbody>");
            for (var i = 0; i < data["ret_data"].length; i++) {
                var tr = $('<tr align="center"></tr>');
                var currStatus = data["ret_data"][i][3];

                tr.append('<td>' + data["ret_data"][i][0] + '</td>');
                tr.append('<td>' + data["ret_data"][i][1] + '</td>');
                tr.append('<td>' + data["ret_data"][i][2] + '</td>');
                // tr.append('<td>' + data["ret_data"][i][3] + '</td>');
                tr.append('<td>' + guanggaoStatus[currStatus] + '</td>');
                tr.append('<td>' + data["ret_data"][i][4] + '</td>');
                tr.append('<td>' + data["ret_data"][i][5] + '</td>');
                tr.append('<td>' + data["ret_data"][i][6] + '</td>');
                tr.append('<td>' + data["ret_data"][i][7] + '</td>');
                tr.append('<td>' + data["ret_data"][i][8] + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][9].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][10].toFixed(2) + '</td>');
                tr.append('<td>' + 
                    "<a id=\"check_detail\" class=\"btn btn-info btn-xs disabled\" onclick=\"checkDetail(\'"+data["ret_data"][i][1]+"\',"+ data["ret_data"][i][2]+ ",\'" +currStatus+ "\')\" href=\"javascript:;\" >查看详情</a>" +
                    "<a id=\"success_guanggao\" class=\"btn btn-success btn-xs\" onclick=\"successGuanggao(\'"+data["ret_data"][i][1]+"\',"+data["ret_data"][i][2]+ ",\'" +currStatus+"\')\" href=\"javascript:;\" >审核通过</a><br>" +
                    "<a id=\"fail_guanggao\" class=\"btn btn-danger btn-xs\" onclick=\"failGuanggao(\'"+data["ret_data"][i][1]+"\',"+data["ret_data"][i][2]+ ",\'" +currStatus+"\')\" href=\"javascript:;\" >审核失败</a>" +
                    "<a id=\"pause_guanggao\" class=\"btn btn-danger btn-xs disabled\" onclick=\"pauseGuanggao(\'"+data["ret_data"][i][1]+"\',"+data["ret_data"][i][2]+ ",\'" +currStatus+"\')\" href=\"javascript:;\" >暂停广告</a>"
                + "</td>");
                tbody.append(tr);
            }
            $("#customerGuanggaoList").replaceWith(tbody);  
        }else{
            if (data["guanggao_status"] != "all") {
                var trStr = "<tr><td colspan='12' style='color:red;text-align:center;'>目前没有<b>"+guanggaoStatus[data["guanggao_status"]]+"</b>的广告记录!</td></tr>"; 
                // console.log("==>trStr:",trStr)
            }else{
                var trStr = "<tr><td colspan='12' style='color:red;text-align:center;'>目前没有任何客户添加广告记录</td></tr>"; 
                // console.log("==>trStr:",trStr)
            };
            $("#customerGuanggaoList").empty();
            $("#customerGuanggaoList").append(trStr); 
        }
    })
}

$(document).ready(function() {

    // 获取平台广告概况
    $("#getPlatformGuanggaoBrief").click(function(){
        ozhuan_ajax_db("getPlatformGuanggaoBrief",[],function(data){
            if(!data["result"]){
                tips("平台广告概况获取失败！请重新刷新页面","warning")
            }else{
                var guanggaoInfo = data["ret_data"];
                $("#wait_check").html(guanggaoInfo[0])
                $("#check_fail").html(guanggaoInfo[1])
                $("#gonging").html(guanggaoInfo[2])
                $("#pause").html(guanggaoInfo[3])
                $("#complete").html(guanggaoInfo[4])
                $("#cancel").html(guanggaoInfo[5])
                $("#all").html(guanggaoInfo[6])
                $("#wait_check_money").html(guanggaoInfo[7].toFixed(2))
                $("#real_total_money").html(guanggaoInfo[8].toFixed(2))
                $("#complete_total_money").html(guanggaoInfo[9].toFixed(2))
            }
        })
    })
    $("#getPlatformGuanggaoBrief").click()

    // 获取平台广告详情
    // $("#getWaitCheckGuanggao").click()

    $("#customerGuanggaoPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        var searchStatus = $("#now_click_status").val()
        getCustomerGuanggaoInfo(page,searchStatus);
    });

    //默认从服务器读取待审核广告信息
    $("#getWaitCheckGuanggao").click()
  

});