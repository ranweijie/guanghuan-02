// 验证用户名
function checkUsername(callback) {  
    var username = $.trim($("input[name='username']").val());
    var alertTipsUL = $("#login_tips_ul");
    var alertTipsDiv = $("#login_tips_div");
    var usernameResObj = $("input[name='username-check']");
    if (!isNull(username)){
        if(isEmail(username)){
            ozhuan_ajax_db("checkDbUsername",username,function(data){
                console.log("返回值",JSON.stringify(data))
                if (data["ret_data"]) {
                    $("#username_div").removeClass('has-error').addClass('has-success');
                    alertTipsUL.empty();
                    usernameResObj.val("true");
                    alertTipsDiv.hide();
                }else{
                    $("#username_div").removeClass('has-success').addClass('has-error');
                    alertTipsUL.empty();
                    alertTipsUL.append('<li>用户名不存在！</li>');
                    alertTipsDiv.show();
                }
                callback();
            })
        }else{
            $("#username_div").removeClass('has-success').addClass('has-error');
            alertTipsUL.empty();
            alertTipsUL.append('<li>用户名不是正确的邮箱地址！</li>');
            alertTipsDiv.show();
        }
    }
}

// 登录密码验证
function checkPassword(callback) { 
    var username = $.trim($("input[name='username']").val()); 
    var password = $("input[name='password']").val();
    var alertTipsUL = $("#login_tips_ul");
    var alertTipsDiv = $("#login_tips_div");
    var passwordResObj = $("input[name='password-check']");
    if (!isNull(password)){
        // console.log("格式正确否isPasswordOK(password):====",isPasswordOK(password))
        if(isPasswordOK(password)){
            ozhuan_ajax_db("isPasswordMatch",[username,password],function(data){
                if (data["ret_data"]) {
                    $("#password_div").removeClass('has-error').addClass('has-success');
                    alertTipsUL.empty();
                    passwordResObj.val("true");
                    alertTipsDiv.hide();
                }else{
                    $("#password_div").removeClass('has-success').addClass('has-error');
                    alertTipsUL.empty();
                    alertTipsUL.append('<li>账号密码不匹配！</li>');
                    alertTipsDiv.show();
                }
                callback()
            })
        }else{
            alertTipsUL.append('<li>密码格式错误！6~20位</li>');
            $("#password_div").removeClass('has-success').addClass('has-error');
            alertTipsDiv.show();
        }
    }
}

function login(){
    var username = $.trim($("input[name='username']").val());
    if (isNull(username)) {
        $("#login_tips_ul").empty()
        $("#login_tips_ul").append('<li>用户名为空！</li>');
        $("#login_tips_div").show();
        return false
    }

    checkUsername(function(){
        var usernameCheckRes = $("input[name='username-check']").val();
        if (usernameCheckRes) {
            var password = $.trim($("input[name='password']").val());
            // console.log("密码是否为空：",isNull(password))
            if (isNull(password)) {
                $("#login_tips_ul").append('<li>密码为空！</li>');
                $("#login_tips_div").show();
                return  false
            }

            checkPassword(function(){
                var passwordCheckRes = $("input[name='password-check']").val();
                // console.log("passwordCheckRes:",passwordCheckRes)
                if (passwordCheckRes) {
                    $("#login_form").submit() 
                }else{
                    return false
                };
            })
        }else{return false};
    })
}


$(document).ready(function() {   
   $("input[name='username']").focus();

   $("input[name='password']").on("keypress",function(e){
    // console.log("e.keyCode",e.keyCode)
    if(e.keyCode == 13){
        $("button").click()
    }
   });
});