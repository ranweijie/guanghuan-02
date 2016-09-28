function goFinanceManagerPage(){
    window.location.href = "/financeManager";
}

// 查看充值详情
function checkDetail(username,bianhao,status){
    tips("暂不支持此功能,完善中！","warning");
    return false;
}

// 确认充值到账
function successCharge(username,bianhao,status){
    if (status=="cancel") {
        tips("客户已取消该充值请求！","info")
        return false;
    };
    // if (status=="客户删除") {
    //     tips("客户已删除该充值请求！","info")
    //     return false;
    // };
    if (status=="success") {
        tips("该项充值已经到账，您不能重复确认到账！","danger")
        return false;
    };
    if (status=="fail") {
        tips("该项充值已经失败，无法确认到账！","danger")
        return false;
    };
    var dialogStr = '请务必在确认收到客户汇款后，再确认到账！<br>确认已收到用户<strong>' + username + '</strong>的编号为'+bianhao+'的充值，请输入汇款单号！<br>'
    dialogStr += '<label for="pay_number">汇款单号：</label><input id="pay_number" name="pay_number" class="form-control" type="text"  value="" placeholder="请输入汇款单号">'
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '确认到账提示',
        message: dialogStr,
        buttons: [{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            },
        }, {
            label: '确定',
            cssClass: 'btn-primary',
            action: function(dialog) {
                var payNumber = dialog.getModalBody().find('#pay_number').val();
                ozhuan_ajax_db("confirmCustomerCharge",[username,bianhao,payNumber],function(data){
                    if (data["result"]) {
                        tips("操作成功")
                        // 获取平台充值概况
                        $("#getPlatformChargeBrief").click()
                        // 获取平台充值详情
                        $("#getWaitPayCharge").click()
                        // window.location.href = "/chargeManage";
                        dialog.close();
                    };
                })
            }
        }]
    });
}

// 确认充值失败
function failCharge(username,bianhao,status){
    if (status=="cancel") {
        tips("客户已取消该充值请求！","info")
        return false;
    };
    // if (status=="客户删除") {
    //     tips("客户已删除该充值请求！","info")
    //     return false;
    // };
    if (status=="success") {
        tips("该项充值已经到账，无法将状态设为失败！","danger")
        return false;
    };
    if (status=="fail") {
        tips("您已确认该充值失败，无需重复确认！","danger")
        return false;
    };
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '设置充值失败提示',
        message: '您正在把该项充值请求的状态设置为失败！<br>是否要确认要将用户<strong>' + username + '</strong>的编号为'+bianhao+'的充值请求设为失败？',
        buttons: [{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            },
        }, {
            label: '确定',
            cssClass: 'btn-primary',
            action: function(dialog) {
                ozhuan_ajax_db("failCustomerCharge",[username,bianhao],function(data){
                    if (data["result"]) {
                        tips("操作成功")
                        // 获取平台充值概况
                        $("#getPlatformChargeBrief").click()
                        // 获取平台充值详情
                        $("#getWaitPayCharge").click()
                        // window.location.href = "/chargeManage";
                        dialog.close();
                    };
                })
            }
        }]
    });
}

function delCharge(bianhao,status){
    if (status=="wait_pay") {
        tips("此项充值正在付款确认中，您正在直接删除充值需求！","info")
    };
    var username = $.trim($("#curr-user").text());
    ozhuan_ajax_db("delCharge",[username,bianhao],function(data){
        if (data["result"]) {
            tips("已经成功删除充值","success")
            // 获取平台充值概况
            $("#getPlatformChargeBrief").click()
            // 获取平台充值详情
            $("#getWaitPayCharge").click()
            // window.location.href = "/chargeManage";
        };
    })
}


function getCustomerChargeInfo(page,charge_type){
    // 设定当前status
    $("#now_click_status").val(charge_type)

    // 获取用户充值详情
    // $("#customerChargeList").empty();
    if (charge_type !="wait_pay") {
        $("#getWaitPayCharge").removeClass("active")
    };
    ozhuan_ajax_db("getCustomerChargeInfo",[page,charge_type],function(data){
        // console.log("serv Data:",JSON.stringify(data))
        $('#customerChargePage').bootpag({
                total:data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });
        var chargeStatus = {"wait_pay":"待审核","cancel":"客户取消","fail":"充值失败","success":"充值成功","all":"所有","no_show":"客户删除"}
        
        var tbody = $("<tbody id='customerChargeList'></tbody>");
        if(data["total"] != 0){
            var data = data["ret_data"];
            // console.log("HHH====>",data)
            // var isClientShow = {"show":"正常显示","no_show":"不显示"}
            for (var i = 0; i < data.length; i++) {
                // console.log("i:",i,"data[i]:",data[i])
                var tr = $('<tr align="center"></tr>');
                var currStatus = data[i][5];

                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td>' + data[i][3] + '</td>');
                tr.append('<td>' + data[i][4] + '</td>');
                // tr.append('<td>' + data[i][5] + '</td>');
                tr.append('<td>' + chargeStatus[currStatus] + '</td>');
                // tr.append('<td>' + isClientShow[data[i][6]] + '</td>');
                tr.append('<td> &yen;' + data[i][6].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data[i][7].toFixed(2) + '</td>');
                tr.append('<td>' + data[i][8] + '</td>');
                tr.append('<td>' + 
                    "<a id=\"check_detail\" class=\"btn btn-info btn-xs\" onclick=\"checkDetail(\'"+data[i][1]+"\',"+ data[i][4]+ ",\'" +currStatus+ "\')\" href=\"#\" >查看详情</a>" +
                    "<a id=\"success_charge\" class=\"btn btn-success btn-xs\" onclick=\"successCharge(\'"+data[i][1]+"\',"+data[i][4]+ ",\'" +currStatus+"\')\" href=\"#\" >确认到账</a>" +
                    "<a id=\"fail_charge\" class=\"btn btn-danger btn-xs\" onclick=\"failCharge(\'"+data[i][1]+"\',"+data[i][4]+ ",\'" +currStatus+"\')\" href=\"#\" >确认失败</a>"
                + "</td>");
                tbody.append(tr);
            }
            $("#customerChargeList").replaceWith(tbody);  
        }else{
            if (data["charge_status"] != "all") {
                var trStr = "<tr><td colspan='11' style='color:red;text-align:center;'>目前没有<b>"+chargeStatus[data["charge_status"]]+"</b>的充值记录!</td></tr>"; 
            }else{
                var trStr = "<tr><td colspan='11' style='color:red;text-align:center;'>目前没有任何客户充值记录</td></tr>"; 
            };
            $("#customerChargeList").empty();
            $("#customerChargeList").append(trStr);
        }
    })

}

$(document).ready(function() {

    // 获取平台充值概况
    $("#getPlatformChargeBrief").click(function(){
        ozhuan_ajax_db("getPlatformChargeBrief",[],function(data){
            if(!data["result"]){
                tips("平台充值信息获取失败！请重新刷新页面","warning")
            }else{
                var chargeInfo = data["ret_data"];
                $("#wait_pay").html(chargeInfo[0])
                $("#success").html(chargeInfo[1])
                $("#fail").html(chargeInfo[2])
                $("#cancel").html(chargeInfo[3])
                // $("#del").html(chargeInfo[4])
                $("#all").html(chargeInfo[4])
                $("#wait_pay_money").html(chargeInfo[5].toFixed(2))
                $("#cancel_charge_money").html(chargeInfo[6].toFixed(2))
                $("#charge_success_money").html(chargeInfo[7].toFixed(2))
                $("#curr_total_money").html(chargeInfo[8].toFixed(2))
            }
        })
    })
    $("#getPlatformChargeBrief").click()


    $("#customerChargePage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        var searchStatus = $("#now_click_status").val()
        getCustomerChargeInfo(page,searchStatus);
    });

    // 获取平台充值详情
    $("#getWaitPayCharge").click()
  

});