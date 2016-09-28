function getCustomerBrief(page){
    ozhuan_ajax_db("getCustomerBrief",page,function(data){
        $('#customerBriefPage').bootpag({
            total:data["total"]==0?1:data["total"],
            page: page,
            maxVisible: 10
        });

        var tbody = $("<tbody id='customerBriefList'></tbody>");
        if(data["total"] != 0){
            for (var i = 0; i < data["ret_data"].length; i++) {
                var tr = $('<tr align="center"></tr>');
                tr.append('<td>' + data["ret_data"][i][0] + '</td>');
                tr.append('<td>' + data["ret_data"][i][1] + '</td>');
                tr.append('<td>' + data["ret_data"][i][2] + '</td>');
                tr.append('<td>' + data["ret_data"][i][3] + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][4].toFixed(2) + '</td>');
                tr.append('<td style=\'color:red\'> &yen;' + data["ret_data"][i][5].toFixed(2) + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][6].toFixed(2) + '</td>');
                tr.append('<td>' + data["ret_data"][i][7] + '</td>');
                tr.append('<td>' + data["ret_data"][i][8] + '</td>');
                tr.append('<td>' + data["ret_data"][i][9] + '</td>');
                tr.append('<td>' + data["ret_data"][i][10] + '</td>');
                tr.append('<td>' + data["ret_data"][i][11] + '</td>');
                tr.append('<td> &yen;' + data["ret_data"][i][12].toFixed(2) + '</td>');
                tbody.append(tr);
            }
            $("#customerBriefList").replaceWith(tbody);  
        }else{
            var trStr = "<tr><td colspan=\"13\" style=\"color:red;text-align:center;\">目前没有任何客户信息!</td></tr>"; 
            // tbody.append(tr);
            $("#customerBriefList").empty(); 
            // $("#customerBriefList").replaceWith(tbody); 
            $("#customerBriefList").append(trStr); 
        }
    })
}


$(document).ready(function() {

    // 获取平台概况
    $("#getPlatformBrief").click(function(){
        ozhuan_ajax_db("getPlatformBrief",[],function(data){
            if(!data["result"]){
                tips("平台简要信息获取失败！您可刷新页面","warning")
            }else{
                var platformBriefInfo = data["ret_data"];
                $("#total_customer").html(platformBriefInfo[0])
                $("#success_charge").html(platformBriefInfo[1].toFixed(2))
                $("#wait_check_charge").html(platformBriefInfo[2].toFixed(2))
                $("#total_curr_money").html(platformBriefInfo[3].toFixed(2))
                $("#today_cost").html(platformBriefInfo[4].toFixed(2))
                $("#yesterday_cost").html(platformBriefInfo[5].toFixed(2))
                $("#last7_cost").html(platformBriefInfo[6].toFixed(2))
                $("#last30_cost").html(platformBriefInfo[7].toFixed(2))
                $("#all_cost").html(platformBriefInfo[8].toFixed(2))
            }
        })
    })
    $("#getPlatformBrief").click()


    $("#customerBriefPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        getCustomerBrief(page);
    });

    // 获取用户概况
    $("#getCustomerBrief").on("click", function() {
        var page = $('#customerBriefPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        getCustomerBrief(page);
        return false;
    })

    $("#getCustomerBrief").click()

});