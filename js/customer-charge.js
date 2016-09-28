
function checkChargeData(){
    var tipsUL = $("#charge_tips_ul")
    var needInvoice = $("input:radio:checked").val()

    console.log("发票",needInvoice)

    var amountRes = true
    var invoiceRes = true

    var charge_amount = Number($.trim($("#charge_amount").val()));
 
    if (!isNumber(charge_amount)){
        tipsUL.append('<li>请输入正确的充值金额</li>');
        amountRes = false
    }
    var check_amount = Number($.trim($("#check_amount").val()));
    if (!(charge_amount===check_amount)){
        tipsUL.append('<li>确认金额需和充值金额相同</li>');
        amountRes = false
    }
    var pay_name = $.trim($("#pay_name").val());
    if (isNull(pay_name)){
        tipsUL.append('<li>您没有输入付款人</li>');
        amountRes = false
    }
    if (needInvoice == "1"){
        var invoice_title = $.trim($("#invoice_title").val());
        if (isNull(invoice_title)){
            tipsUL.append('<li>开票必须要有抬头</li>');
            invoiceRes = false
        }
        var invoice_receiver = $.trim($("#invoice_receiver").val());
        if (isNull(invoice_receiver)){
            tipsUL.append('<li>开票必须要有收件人</li>');
            invoiceRes = false
        }        
        var invoice_phone = $.trim($("#invoice_phone").val());
        if (isNull(invoice_phone)){
            tipsUL.append('<li>开票必须要有联系电话</li>');
            invoiceRes = false
        }        
        var invoice_address = $.trim($("#invoice_address").val());    
        if (isNull(invoice_address)){
            tipsUL.append('<li>开票必须要有快递地址</li>');
            invoiceRes = false
        }
    }
    return amountRes && invoiceRes
}


// 提交充值后，跳转到财务管理业
function goFinanceManagePage(){
    window.location.href = "/financeManage";
}


$(document).ready(function() {
   // 初始化
   $("#charge_tips_ul").empty();

   // 是否需要发票
   $("#invoice_not_needed_btn").click(function(){
    $(".invoice-detail").removeClass('show').addClass('hidden');
    $("#charge_tips_div").removeClass('show').addClass('hidden');
   })

   $("#invoice_needed_btn").click(function(){
    $(".invoice-detail").removeClass('hidden').addClass('show');
    $("#charge_tips_div").removeClass('show').addClass('hidden');
   })

   // 提交充值
   $("#submit-btn").click(function(){
        $("#charge_tips_ul").empty();
        if(!checkChargeData()){
            $("#charge_tips_div").removeClass('hidden').addClass('show');
            return false;
        }else{
            var chargeInfo = {};
            chargeInfo["username"] = $.trim($("#curr-user").text());
            chargeInfo["charge_amount"] = Number($.trim($("#charge_amount").val()));
            chargeInfo["pay_name"] = $.trim($("#pay_name").val());
            chargeInfo["need_invoice"] = $("input:radio:checked").val() =="0" ? "不需要" :"需要";
            chargeInfo["invoice_title"] = $.trim($("#invoice_title").val());
            chargeInfo["invoice_receiver"] = $.trim($("#invoice_receiver").val());
            chargeInfo["invoice_phone"] = $.trim($("#invoice_phone").val());
            chargeInfo["invoice_address"] = $.trim($("#invoice_address").val());            
            ozhuan_ajax_db("userCharge",chargeInfo,function(data){

                if (data["result"]) {
                    tips("恭喜！已成功提交","success",goFinanceManagePage) 
               }else{
                    tips("SORRY！提交失败,请稍后重试!","danger") 
               };
            }) 
        }
   }) 
})