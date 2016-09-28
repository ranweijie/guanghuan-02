function handleAjaxResult(data){
    var inputObj = $("#username");
    var inputTipsObj = $("#username-tips");
    if (data["result"]) {
        inputObj.removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
        inputTipsObj.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
        inputTipsObj.text("恭喜!该邮箱可用！");
        returnAjaxRes(data["result"]); 
        return true; 
    }else{
        inputObj.removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        inputTipsObj.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        inputTipsObj.text("SORRY!该邮箱已被注册！");
        return false;  
        // returnAjaxRes(data["result"]); 
    }
}
// 验证账户名称
function checkUsername() {  
    var username = $.trim($("#username").val());
    // var username = $.trim($(this).val());
    var usernameTips = $("#username-tips");
    // var usernameTips = $(this).next();
    var is
    if (!isNull(username)){
        if(isEmail(username)){
            console.log("邮箱地址格式OK");
            var timer = false
            var send = 0
            var receive = 0
            var data = {}
            data["cmd"] = "checkDbUsername";
            data["params"] = [username];
            if (!timer) {
                setTimeout(delayWaitDialog, 500)
                timer = true;
            }
            send++;
            $.ajax({
                url: "/db",
                type: "post",
                async: false,
                data: {
                    "data": JSON.stringify(data)
                },
                dataType: "json",
                complete: function(data) {
                    receive++;
                    closeDelayWaitDialog();
                    return data["data"]["result"];
                },
                error: function() {
                    tips("服务器连接错误，请联系服务商！","danger");
                },
                success: function(data) {
                    console.log(11111,data["data"]["result"]);
                    if (data["data"]["result"]) {
                        $("#username").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
                        usernameTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
                        usernameTips.text("恭喜!该邮箱可用！");
                        // return data["data"]["result"];
                        // returnAjaxRes(data["result"]);  
                    }else{
                        $("#username").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
                        usernameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
                        usernameTips.text("SORRY!该邮箱已被注册！");
                        // return data["data"]["result"];  
                        // returnAjaxRes(data["result"]); 
                    }
                }
            });
            // ozhuan_ajax_db("checkDbUsername",[username],handleAjaxResult(data));
        }else{
            console.log("邮箱地址格式不OK");

            $("#username").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            usernameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            usernameTips.text("请输入正确的邮箱地址！");
            return false;
        }
    }else{
        console.log("邮箱地址为空");
        $("#username").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        usernameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        usernameTips.text("邮箱地址不能为空！");
        return false;
    }
    // return isUsernameOK;
}
// 验证姓名/公司
function checkDisplayName() {  
    var displayname = $.trim($("#display-name").val());
    var displaynameTips = $("#display-name-tips");
 
    if (!isNull(displayname)){
  
        ozhuan_ajax_db("checkDbDisplayName",[displayname],function(data){
            if(data["result"]){
                $("#display-name").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
                displaynameTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
                displaynameTips.text("恭喜!该名称可用！");
                // return true; 
                return data["result"];                
            }else{
                $("#display-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
                displaynameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
                displaynameTips.text("SORRY!该名称已被注册！"); 
                // return false; 
                return data["result"]; 
            }
        })

    }else{
        console.log("姓名/公司为空");
        $("#display-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        displaynameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        displaynameTips.text("姓名/公司名不能为空！");
        return false;
    }
}
// 联系人
function checkContactName() {  
    var contactname = $.trim($("#contact-name").val());
    var contactnameTips = $("#contact-name-tips");
 
    if (!isNull(contactname)){
  
        if(isPersonName(contactname)){
            $("#contact-name").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            contactnameTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            contactnameTips.text("OK！");
            return true;                
        }else{
            $("#contact-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            contactnameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            contactnameTips.text("SORRY! 请输入正确的联系人！"); 
            return false; 
        }


    }else{
        console.log("联系人姓名为空");
        $("#contact-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        contactnameTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        contactnameTips.text("联系人姓名不能为空！");
        return false;
    }
}
// 联系电话
function checkContactPhone() {  
    var contactphone = $.trim($("#contact-phone").val());
    var contactphoneTips = $("#contact-phone-tips");
 
    if (!isNull(contactphone)){
  
        if(isPhone(contactphone) || isMobile(contactphone)){
            $("#contact-phone").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            contactphoneTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            contactphoneTips.text("OK！");
            return true;                
        }else{
            $("#contact-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            contactphoneTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            contactphoneTips.text("SORRY! 请输入正确的联系电话！"); 
            return false; 
        }


    }else{
        console.log("联系电话为空");
        $("#contact-name").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        contactphoneTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        contactphoneTips.text("联系电话不能为空！");
        return false;
    }
}
// 联系qq
function checkContactQQ() {  
    var contactQQ = $.trim($("#contact-qq").val());
    var contactQQTips = $("#contact-qq-tips");
 
    if (!isNull(contactQQ)){
  
        if(isQQ(contactQQ)){
            $("#contact-qq").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            contactQQTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            contactQQTips.text("OK！");
            return true;                
        }else{
            $("#contact-qq").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            contactQQTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            contactQQTips.text("SORRY! 请输入正确的QQ号！"); 
            return false; 
        }


    }else{
        console.log("联系qq为空");
        $("#contact-qq").removeClass('init-input-border').removeClass('danger-input-border').addClass('init-input-border');
        contactQQTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
        contactQQTips.text("您没有输入联系QQ！");
        return true;
    }
}
// 联系地址验证
function checkContactAddress() {  
    var contactAddress = $.trim($("#contact-address").val());
    var contactAddressTips = $("#contact-address-tips");
 
    if (!isNull(contactAddress)){
  
        if(isAddress(contactAddress)){
            $("#contact-address").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            contactAddressTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            contactAddressTips.text("OK！");
            return true;                
        }else{
            $("#contact-address").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            contactAddressTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            contactAddressTips.text("SORRY! 请输入正确的联系地址！"); 
            return false; 
        }
    }else{
        console.log("联系地址为空");
        $("#contact-address").removeClass('init-input-border').removeClass('danger-input-border').addClass('init-input-border');
        contactAddressTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
        contactAddressTips.text("您没有输入联系地址！");
        return true;
    }
}

// 登录密码验证
function checkLoginPwd() {  
    var loginPwd = $("#login-pwd").val();
    var loginPwdTips = $("#login-pwd-tips");
    console.log("输入登录密码：",loginPwd);
    if (!isNull(loginPwd)){
        if (!(/^[a-zA-Z]{1}/.test(loginPwd))) {
            $("#login-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            loginPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            loginPwdTips.text("SORRY! 密码只能以字母开始！"); 
            return false; 
        };
        if (loginPwd.length < 6 || loginPwd.length >12) {
            $("#login-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            loginPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            loginPwdTips.text("SORRY! 密码长度应为6~12！"); 
            return false; 
        };
        if (!(/^[a-zA-Z]{1}([a-zA-Z0-9]|[\s\\s,<\.>\?;:'"\[\]\{\}\\\|`~!@#%\$\^&\*\(\)\-\+]){5,11}$/.test(loginPwd))){
            $("#login-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            loginPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            loginPwdTips.text("密码只能字母开始6~12位英文字符及特殊符号"); 
            return false; 
        }else{
            $("#login-pwd").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            loginPwdTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            loginPwdTips.text("OK！密码可用");
            return true;
        };
    }else{
        console.log("登录密码为空");
        $("#login-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        loginPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        loginPwdTips.text("登录密码不能为空！");
        return false;
    }
}
// 确认密码验证
function checkConfirmPwd() {
    var confirmPwd = $("#confirm-pwd").val();
    var confirmPwdTips = $("#confirm-pwd-tips");
    console.log("确认密码为：",confirmPwd);
    if (!checkLoginPwd()){
        $("#confirm-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
        confirmPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
        confirmPwdTips.text("SORRY! 请先设置正确的登录密码！"); 
        return false; 
    }else{
        var currLoginPwd = $("#login-pwd").val();
        if (confirmPwd === currLoginPwd) {
            $("#confirm-pwd").removeClass('init-input-border').removeClass('danger-input-border').addClass('success-input-border');
            confirmPwdTips.removeClass('init-tips').removeClass('danger-tips').addClass('success-tips');
            confirmPwdTips.text("OK！确认密码正确!");
            return true;
        }else{
            console.log("确认密码和登录密码不同！");
            $("#confirm-pwd").removeClass('init-input-border').removeClass('success-input-border').addClass('danger-input-border');
            confirmPwdTips.removeClass('init-tips').removeClass('success-tips').addClass('danger-tips');
            confirmPwdTips.text("确认密码和登录密码不同！");
            return false;
        }
    }
}
// 验证所有注册信息
function checkAllRegisterInfo(){
    var isRegisterInfoOK = true;
    console.log("帐号名称验证结果：",checkUsername());
    console.log("姓名/公司验证结果：",checkDisplayName());
    console.log("联系人验证结果：",checkContactName());
    console.log("联系电话验证结果：",checkContactPhone());
    console.log("联系QQ验证结果：",checkContactQQ());
    console.log("联系地址验证结果：",checkContactAddress());
    console.log("登录密码验证结果：",checkLoginPwd());
    console.log("确认密码验证结果：",checkConfirmPwd());

    if( checkUsername() || checkDisplayName() || checkContactName() || checkContactPhone() || checkContactQQ() || checkContactAddress() || checkLoginPwd() || checkConfirmPwd()){
        isRegisterInfoOK = false;
    }
    return isRegisterInfoOK;
}

$(document).ready(function() {
    // 账号名称验证
   $("#username").focus();
   $("#username").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("*请用您的电子邮箱注册！");
   });
   $("#username").blur(function(){
        checkUsername();
        console.log(checkUsername());
   });

   // 姓名/公司验证
   $("#display-name").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请输入姓名/公司名称");
   });
   $("#display-name").blur(function(){
        checkDisplayName();
   });   

   // 联系人验证
   $("#contact-name").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请输入联系人姓名(中文或英文)");
   });
   $("#contact-name").blur(function(){
        checkContactName();
   });
   // 联系电话验证
   $("#contact-phone").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请输入座机号或手机号");
   });
   $("#contact-phone").blur(function(){
        checkContactPhone();
   });
  // 联系QQ验证
   $("#contact-qq").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请输入联系QQ");
   });
   $("#contact-qq").blur(function(){
        checkContactQQ();
   });
  // 联系地址验证
   $("#contact-address").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请输入联系地址");
   });
   $("#contact-address").blur(function(){
        checkContactAddress();
   });  
   // 登录密码验证
   $("#login-pwd").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("登录密码(8~15位英文字符或特殊符号)");
   });
   $("#login-pwd").blur(function(){
        checkLoginPwd();
   });  
   // 确认密码验证
   $("#confirm-pwd").focus(function(){
        _this = $(this);
        _this.removeClass('danger-input-border').removeClass('success-input-border').addClass('init-input-border');
        _this.next().removeClass('danger-tips').removeClass('success-tips').addClass('init-tips');
        _this.next().text("请再次输入登录密码");
   });
   $("#confirm-pwd").blur(function(){
        checkConfirmPwd();
   });

   // 提交注册
   $("#submit-btn").click(function(){
        console.log("注册信息验证结果：",checkAllRegisterInfo());
        if(checkAllRegisterInfo()){
            var registerInfo = {};
            registerInfo["username"] = $.trim($("#username").val());
            registerInfo["display_name"] = $.trim($("#display-name").val());
            registerInfo["contact_name"] = $.trim($("#contact-name").val());
            registerInfo["contact_phone"] = $.trim($("#contact-phone").val());
            registerInfo["contact_qq"] = $.trim($("#contact-qq").val());
            registerInfo["contact_address"] = $.trim($("#contact-address").val());
            registerInfo["login_pwd"] = $("#login-pwd").val();
            // registerInfo["confirm-pwd"] = $("#confirm-pwd").val();

            ozhuan_ajax_db("userRegister",registerInfo,function(data){
                if (data["result"]) {
                    tips("恭喜！注册成功！","success") 
               }else{
                    tips("SORRY！注册失败,请稍后重试!","danger") 
               };
                
            })
        }else{
            console.log("注册信息有误，无法提交注册！");
            tips("请完善注册信息，再行提交，谢谢！","danger");
            return false;
        }

   })
    

});