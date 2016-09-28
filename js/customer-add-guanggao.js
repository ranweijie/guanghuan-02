// 获取当前临时余额
function getCurrTempMoney(){
    var curr_user = $.trim($("#curr-user").text());
        ozhuan_ajax_db("getCurrTempMoney",curr_user,function(data){
            $("#curr_temp_money").text(data["ret_data"])
    })
}

// 检查可用余额
function checkCurrMoney(){
    var isMoneyOK = true;
    console
    var curr_user_money = Number($.trim($("#curr_temp_money").text()));

    var plan_count_check = Number($.trim($("#plan_count").val()));
    var single_price_check = Number($("#app_single_price").text());
    var total_need_money = plan_count_check*single_price_check;
    console.log("余额：",curr_user_money,"份数：",plan_count_check,"单价：",single_price_check,"总价:",total_need_money)
    if (total_need_money > curr_user_money) {
        isMoneyOK = false;
    };
    console.log("可用余额验证结果：",isMoneyOK)
    return isMoneyOK
}

// 删除关键字
function delKwItem(kwItem){
    var delIndex = Number(kwItem);
    var old_kw_total = Number($("#curr_kw_total").val());
    var new_kw_total = old_kw_total-1;
    $("#curr_kw_total").val(new_kw_total);

    $("#kwItem"+delIndex).remove();
    if (delIndex < old_kw_total) {
        for (var k = delIndex+1; k <= old_kw_total; k++) {
            $("#kwItem" + k).find("p.item").text(String(k-1));
            $("#kw" + k).attr("id","kw"+String(k-1));
            $("#kwPercent" + k).attr("id","kwPercent"+String(k-1));
            $("#kwItem" + k).find("a").attr("onclick","delKwItem('"+(k-1)+"')");
            $("#kwItem" + k).attr("id","kwItem"+String(k-1));
        };
    };
}



// 提交前检查数据
function checkGuanggaoData(){
    var checkRes = true;
    // 应用标题验证
    var app_title = $.trim($("#app_title").val())
    if (isNull(app_title)) {
        $("#app_title").val("应用标题必须输入！");
        $("#app_title").css("color","red");
        checkRes = false;
    };
    // iTunes地址验证
    var iTunes_url = $.trim($("#iTunes_url").val())
    if (isNull(iTunes_url)) {
        $("#iTunes_url").val("iTunes地址必须输入！");
        $("#iTunes_url").css("color","red");
        checkRes = false;
    };
    // 开始时间验证
    var start_time = $.trim($("#start_time").val())
    if (isNull(start_time)) {
        $("#start_time").val("开始时间必须输入！");
        $("#start_time").css("color","red");
        checkRes = false;
    }else{
        var start_time_int = Date.parse(start_time);
        var now = new Date();
        if (start_time_int < now) {
            $("#start_time").val("开始时间不能早于当前时间！");
            $("#start_time").css("color","red");
            checkRes = false; 
        };
    };
    // 结束时间验证
    var end_time = $.trim($("#end_time").val())
    if (isNull(end_time)) {
        $("#end_time").val("结束时间必须输入！");
        $("#end_time").css("color","red");
        checkRes = false;
    }else{
        var start_time_int = Date.parse(start_time);
        var end_time_int = Date.parse(end_time);

        if (start_time_int > end_time_int) {
            $("#end_time").val("结束开始时间不能早于开始时间！");
            $("#end_time").css("color","red");
            checkRes = false; 
        };
    };
    
    // 计划份数验证
    var plan_count = $.trim($("#plan_count").val())
    if (isNull(plan_count)){
        $("#plan_count").val("计划份数必须输入！");
        $("#plan_count").css("color","red");
        checkRes = false;
    }else{
        if(!isInteger(plan_count)){
            $("#plan_count").val("请输入正确份数！");
            $("#plan_count").css("color","red");
            checkRes = false;
        }else{
            if (Number(plan_count) < 500) {
                $("#plan_count").val("计划份数必须大于500");
                $("#plan_count").css("color","red");
                checkRes = false; 
            };
        }
    }

    // 多关键词验证
    var needMultiKw = $('input[name="kw-need"]:checked').val();
    if (needMultiKw == "1"){
        var kw_total = Number($("#curr_kw_total").val());
        if (kw_total==0) {
            var tbodyStr = "<tr><td colspan='5' style='color:red;text-align:center'>请输入具体的搜索关键字，或者关闭多关键字搜索！</td></tr>";
            $("#multiKwSearchList").append(tbodyStr);
        }else{
            var curr_total_percent = 0
            for (var i = 1; i <= kw_total; i++) {
                var kwObj = {}
                var kwItem = $.trim($("#kw"+i).val());
                if (isNull(kwItem)) {
                    $("#kw"+i).val("关键字不能为空");
                    $("#kw"+i).css("color","red");
                    checkRes = false; 
                }else{
                    kwObj[kwItem] = kwItem;
                };

                var kwItemPercent = $.trim($("#kwPercent"+i).val());

                if (isNull(kwItemPercent)) {
                    $("#kwPercent"+i).val("百分比不能为空");
                    $("#kwPercent"+i).css("color","red");
                    checkRes = false; 
                }else{
                    if (isNumber(kwItemPercent) && Number(kwItemPercent) > 0 && Number(kwItemPercent) <100) {
                        kwObj[kwItemPercent] = kwItemPercent;
                    }else{
                        $("#kwPercent"+i).val("请输入正确的百分比");
                        $("#kwPercent"+i).css("color","red");
                        checkRes = false;
                    };
                };
            }    
        };
    };
    
    return checkRes;
}

$(document).ready(function() {
    // 隐藏IDFA 比对
    // $("#idfa-compare").hide();
    // 输入框初始化
    $("#app_title,#iTunes_url,#start_time,#end_time,#plan_count,input[id*=kw],input[id*=kwPercent]").focus(function(){
        $(this).val("");
        $(this).css("color","#555");
    })
    
    // 日期插件设置
    $('#start_time,#end_time').datetimepicker({
        language: 'zh-CN',
        autoclose: 1,
        todayBtn: true,
        pickerPosition: "bottom-left",
        pickTime: true,
        hourStep: 1,
        minuteStep: 5,
        secondStep: 30,
        format: 'yyyy-mm-dd hh:ii'
    });

    // 是否开启多关键字搜索
   $("#flag_open").click(function(){

        $("#addMultiKwBtns").removeClass('hidden').addClass('show');
        $("#multiKwSearchDiv").removeClass('hidden').addClass('show');
   })

   $("#flag_close").click(function(){
        $("#addMultiKwBtns").removeClass('show').addClass('hidden');
        $("#multiKwSearchDiv").removeClass('show').addClass('hidden');
   })

   // 添加多关键词搜索
   $("#curr_kw_total").val("1");
   $("#addKw").click(function(){
        var curr_kw_total = $("#curr_kw_total").val();
        if (curr_kw_total=="0") {
            $("#multiKwSearchList").empty();
        };
        curr_kw_total++;
        $("#curr_kw_total").val(curr_kw_total);

        var trStr = "<tr id=\"kwItem"+ curr_kw_total+"\">";
        trStr += "<td style=\"text-align:center\"><p class=\"form-control-static item\">"+curr_kw_total+"</p></td>";
        trStr += "<td><input type=\"text\" class=\"form-control\" placeholder=\"请输入关键词\" id=\"kw"+ curr_kw_total +"\"></td>";
        trStr += "<td><input type=\"text\" class=\"form-control\" placeholder=\"请输入关键词\" id=\"kwPercent"+ curr_kw_total +"\"></td>";
        trStr += "<td style=\"text-align:center\"><p class=\"form-control-static\">"+"--"+"</p></td>";
        trStr += "<td><a class=\"btn btn-danger btn-sm\" href=\"#\" onclick=\"delKwItem(\'"+curr_kw_total+"\')\">删除此项</a></td>";
        trStr += "</tr>";
        $("#multiKwSearchList").append(trStr);
   })

   // 应用价格 免费/付费
    $("#app_type_free").click(function(){
        $("#app_single_price").text("4.000");
   })

   $("#app_type_pay").click(function(){
        $("#app_single_price").text("8.000");
   })
    // 获取当前可用余额
    $("#getCurrTempMoney").click()

   // 提交添加广告
   $("#submit-btn").click(function(){
        // console.log("广告信息验证结果：",checkGuanggaoData());
        if (!checkGuanggaoData()){
            tips("请完善广告信息后再行提交，谢谢！","danger");
            return false;
        }else if(!checkCurrMoney()){
            tips("SORRY，账户临时余额不足，您可以先从财务管理中充值，或者删除不需要的广告，再添加新广告！","danger");
            return false;
        }else{
            var guanggaoInfo = {};
            guanggaoInfo["username"] = $.trim($("#curr-user").text());
            guanggaoInfo["app_title"] = $.trim($("#app_title").val());
            guanggaoInfo["iTunes_url"] = $.trim($("#iTunes_url").val());
            guanggaoInfo["start_time"] = getTimestamp($.trim($("#start_time").val()));
            guanggaoInfo["end_time"] = getTimestamp($.trim($("#end_time").val()));

            guanggaoInfo["plan_num"] = Number($.trim($("#plan_count").val()));
            guanggaoInfo["need_multi_kw"] = $('input[name="kw-need"]:checked').val()=="1" ? "need" :"no_need";

            var kwObj = {}
            var needMultiKw = $('input[name="kw-need"]:checked').val();
            if (needMultiKw=="1") {
                var kw_total = Number($("#curr_kw_total").val());
                // console.log("关键字总数=============：",kw_total)
                 for (var j = 1; j <= kw_total; j++) {
                    console.log("当前i====：",j)

                    var kwItem = $.trim($("#kw"+j).val());
                    kwObj["keywords" + j] = kwItem;

                    var kwItemPercent = $.trim($("#kwPercent"+j).val());
                    kwObj["key_percent" + j] = kwItemPercent;
                } 
            };
            guanggaoInfo["keywords_dict"] = kwObj;
            guanggaoInfo["pay_type"] = $('input[name="appstore_type"]:checked').val()=="0" ? "free" :"pay";
            guanggaoInfo["single_price"] = Number($("#app_single_price").text());

            var platformArr = ["iPhone","iPad","iPhone和iPad"]
            var platformIndex = Number($('input[name="platform"]:checked').val());
            guanggaoInfo["platform_type"] = platformArr[platformIndex];
            // guanggaoInfo["platform_type"] = $('input[name="platform"]:checked').val();//1:iphone 2:ipod 3:all

            ozhuan_ajax_db("userAddGuanggao",guanggaoInfo,function(data){
                // console.log(data,data["result"])
                if(data["result"]){
                    tips("添加广告成功","success",getCurrTempMoney);
                }else{
                    tips("SORRY 添加失败，请稍后再试！","danger");
                }
            })

        }

   })
});