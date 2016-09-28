// 验证原始密码
function checkOldPwd(){
    var username = $.trim($("#curr-user").text())
    var password = $("#password").val();
    ozhuan_ajax_db("checkOldPwd",[username,password],function(data){
        if (!data["result"]) {
            $("#password_tips").text("当前密码输入错误！");
            $("#password_tips").css("color","red");
        }else{
            $("input[name='password-check']").val("ok")
            $("#password_tips").text("当前密码正确！");
            $("#password_tips").css("color","#0fe");
        };
    })
}

// 新登录密码验证
function checkNewLoginPwd() { 
    checkRes = true 
    var oldPwdCheckRes = Boolean($("input[name='password-check']").val());
    var newPwd = $("#new_password").val()
    // console.log("新密码：",newPwd);
    if (oldPwdCheckRes) {
        if (!isNull(newPwd)){

            if (!isPasswordOK(newPwd)){
                $("#new_pwd_tips").text("SORRY! 密码长度应为6~20位");
                $("#new_pwd_tips").css("color","red");
                checkRes = false; 
            }else{
                $("#new_pwd_tips").text("新密码OK");
                $("#new_pwd_tips").css("color","#0fe");
            }
        }else{
            $("#new_pwd_tips").text("SORRY! 新密码不能为空！");
            $("#new_pwd_tips").css("color","red");
            checkRes = false;
        }
    }else{
        $("#new_pwd_tips").text("SORRY! 请先输入正确的当前密码！");
        $("#new_pwd_tips").css("color","red");
        checkRes = false;
    };
    return checkRes;
}


// 确认新密码验证
function checkNewConfirmPwd() {
    checkRes = true
    var newConfirmPwd = $("#new_password_confirm").val();
    // console.log("确认密码为：",newConfirmPwd);
    if (!checkNewLoginPwd()){
        $("#new_password_confirm_tips").text("SORRY! 请先设置正确的新登录密码！");
        $("#new_password_confirm_tips").css("color","red");
        checkRes = false; 
    }else{
        var newPwd = $("#new_password").val();
        if (newConfirmPwd !== newPwd) {
            $("#new_password_confirm_tips").text("确认密码和登录密码不同！");
            $("#new_password_confirm_tips").css("color","red");
            checkRes = false;
        }else{
            $("#new_password_confirm_tips").text("确认密码OK！");
            $("#new_password_confirm_tips").css("color","#0fe");
        }
    }
    return checkRes;
}

function goAccountInfoPage(){
    window.location.href = "/accountInfo";
}

function goLoginPage(){
    window.location.href = "/";
}

// 提交修改该前验证基本资料
function checkBaseData(){
    var checkRes = true;
    // 姓名/公司验证
    var display_name = $.trim($("#check_display_name").val())
    if (isNull(display_name)) {
        $("#check_display_name").val("公司/姓名不能为空！");
        $("#check_display_name").css("color","red");
        checkRes = false;
    };
    // 联系人验证
    var contact_name = $.trim($("#check_contact_name").val())
    if (isNull(contact_name)) {
        $("#check_contact_name").val("联系人不能为空！");
        $("#check_contact_name").css("color","red");
        checkRes = false;
    };
    // 联系电话验证
    var contact_phone = $.trim($("#check_contact_phone").val())
    console.log("联系电话===",contact_phone)
    if (isNull(contact_phone)) {
        $("#check_contact_phone").val("联系电话不能为空！");
        $("#check_contact_phone").css("color","red");
        checkRes = false;
    }else{
        if (isPhone(contact_phone) == false && isMobile(contact_phone) == false) {
            $("#check_contact_phone").val("请输入正确的联系电话！");
            $("#check_contact_phone").css("color","red");
            checkRes = false;
        };
    };
    // 联系QQ验证（可以为空/不为空需正确填写）
    var contact_qq = $.trim($("#check_contact_qq").val())
    if (!isNull(contact_qq)) {
        if (!isQQ(contact_qq)) {
            $("#check_contact_qq").val("请输入正确的QQ号！或者置空");
            $("#check_contact_qq").css("color","red");
            checkRes = false;    
        }; 
    };
    // console.log("基本资料验证结果：",checkRes);
    return checkRes;
}



$(document).ready(function() {

    
    // 获取用户信息
    $("#getUserInfo").click(function(){
        var username = $.trim($("#username").text())
        ozhuan_ajax_db("getUserInfo",username,function(data){
            if(!data["result"]){
                tips("获取用户信息失败！","warning")
            }else{
                var userInfo = data["ret_data"];
                $("#check_display_name").val(userInfo["display_name"]);
                $("#check_contact_phone").val(userInfo["contact_phone"]);
                $("#check_contact_name").val(userInfo["contact_name"]);
                $("#check_contact_qq").val(userInfo["contact_qq"]);
                $("#check_contact_address").val(userInfo["contact_address"]);
            }
        })
    })
    $("#getUserInfo").click()
    

    // 基本资料输入框获得奇焦点时样式初始化
    $("input[id*=check]").focus(function(){
        $(this).css("color","#555");
    })

    //当前密码/新密码/确认新密码获得焦点时的样式
    $("#password").focus(function(){
        $("#password_tips").text("请输入当前密码");
        $("#password_tips").css("color","#555");
    })

    $("#new_password").focus(function(){
        $("#new_pwd_tips").text("请输入新密码(6~20位字符)");
        $("#new_pwd_tips").css("color","#555");
    })

    $("#new_password_confirm").focus(function(){
        $("#new_password_confirm_tips").text("请再输一次新密码");
        $("#new_password_confirm_tips").css("color","#555");
    })

    //当前密码/新密码/确认新密码失去焦点--验证
    $("#password").blur(function(){
        checkOldPwd();
    });

    $("#new_password").blur(function(){
        checkNewLoginPwd();
    });

    $("#new_password_confirm").blur(function(){
        checkNewConfirmPwd();
    });

    // 提交修改基本资料
    $("#modify_base_info").click(function(){
        if(checkBaseData()){
            var newBaseInfo = {};
            newBaseInfo["username"] = $.trim($("#curr-user").text());
            newBaseInfo["display_name"] = $.trim($("#check_display_name").val());
            newBaseInfo["contact_name"] = $.trim($("#check_contact_name").val());
            newBaseInfo["contact_phone"] = $.trim($("#check_contact_phone").val());
            newBaseInfo["contact_qq"] = $.trim($("#check_contact_qq").val());
            newBaseInfo["contact_address"] = $.trim($("#check_contact_address").val());

            ozhuan_ajax_db("modifyUserBaseInfo",newBaseInfo,function(data){
                // console.log(data)
                // console.log(data["result"])

                if (data["result"]) {
                    tips("修改资料成功！","success",goAccountInfoPage) 
               }else{
                    tips("SORRY！操作失败,请稍后重试!","danger") 
               };    
            })
        }else{
            // console.log("基本资料有误，无法提交修改！");
            tips("请正确填写账号基本资料，谢谢！","danger");
            return false;
        }
    })


    // 提交修改密码
    $("#modify_user_pwd").click(function(){
        checkOldPwd()
        // var inpuOldUserPWD = $("#check_curr_pwd").val()
        if (checkNewLoginPwd() && checkNewConfirmPwd()) {
            var newPwdInfo = {};
            newPwdInfo["username"] = $.trim($("#curr-user").text());
            newPwdInfo["old_password"] = $("#password").val();
            newPwdInfo["new_password"] = $("#new_password").val();
            ozhuan_ajax_db("modifyUserPwd",newPwdInfo,function(data){
                if (data["result"]) {
                    tips("密码修改成功！立即重新登录","success",goLoginPage)
                }else{
                    tips("SORRY！操作失败,请稍后重试!","danger") 
                }
            })
        }else{
            // console.log("密码资料有误，无法提交修改！");
            tips("请正确填写要修改的密码，谢谢！","danger");
            return false;
        }
    })

});