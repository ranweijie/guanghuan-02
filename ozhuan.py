# -*- coding:utf-8 -*-
import sys
import os
import bottle

import db
import static
import json
import beaker


from beaker.middleware import SessionMiddleware

# 模版管理
bottle.TEMPLATE_PATH.append('./tpl')
def error(message):
    raise bottle.HTTPResponse(bottle.template('error.html', msg=message))
def template(html, *a, **ka):
    return bottle.template('main', content=html, *a, **ka)
def fail(message):
    return json.dumps({"success":False,"message":message})


loginTypeDict = {"customer":"customerLogin","provider":"providerLogin"}
indexPageDict = {"customer":"/accountReport","provider":"/customerInfo"}

navPageDict ={
    "customer":[
        ["customer-account-report.html", "/accountReport", "glyphicon-list-alt","账户报告"],
        ["customer-guanggao-manage.html", "/guanggaoManage","glyphicon-wrench", "广告管理"],
        ["customer-finance-manage.html", "/financeManage", "glyphicon-usd","财务管理"],
        ["customer-account-info.html", "/accountInfo","glyphicon-user", "帐号信息"]
    ],
    "provider":[
        ["serv-customer-info.html", "/customerInfo", "glyphicon-list-alt","客户概况"],
        ["serv-charge-manage.html", "/chargeManage","glyphicon-usd", "充值处理"],
        ["serv-customer-guanggao.html", "/customerGuanggao", "glyphicon-wrench","广告处理"],
        ["serv-task-manage.html", "/taskManage", "glyphicon-wrench","任务管理"]
    ],
}

bottle.ERROR_PAGE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>自助管理平台</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link type="text/css" href="/css/bootstrap.min.css" rel="stylesheet">
</head>
<body spellcheck="false">
    <div class="container">
        <div class="col-sm-offset-3 col-sm-6">
            <div class="panel panel-warning">
                <div class="panel-heading">SORRY！网页走丢了</div>
                <div class="panel-body">
                    <h2>奇怪，网页去哪儿了？</h2>
                    <a href="/">重新登录试试</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""


# 定义session参数
session_opts = {
   'session.type':'file',              #以文件的方式保存session
   'session.cookie_expires':3000,       #session过期时间为300秒
   'session.data_dir':'/tmp/sessions_dir', #session保存目录
   'session.auto':True               #自动保存session
}

# 校验session数据
def checkSessionData(userName,userType):
    s = bottle.request.environ.get('beaker.session')
    username = s.get(userName)
    if not username:
        # print("checkSessionData  session验证失败,回到登录页面")
        bottle.redirect('/')
    else:
        data = db.findOneMongodb({"username":username})
        if data and data !="Mongodb Collect Fail" and data["user_type"] != userType:
        # if data["user_type"] != userType:
            #print("checkSessionData  session验证失败,回到登录页面")
            bottle.redirect('/')
        else:
            #print("checkSessionData  session验证OK,进入相应页面")
            return True


# 定义路由
# 初始页面-登录
@bottle.get('/') 
def login():
    return bottle.template('login')

# 登录账号密码验证/并写入session
@bottle.post('/login')
def do_login():
    username = bottle.request.forms.getunicode('username')
    password = bottle.request.forms.getunicode('password')
    #print("===>用户登录请求 username:",username,"; password:",password)
    data = db.findOneMongodb({"username":username,"password":db.encryptMd5(password)})
    if data and data != "Mongodb Collect Fail":
        #print("=>账号密码验证OK,user信息如下:\n",data)
        user_type = data["user_type"]
        s = bottle.request.environ.get('beaker.session')
        ## print("设置session===前===，sesstion为：",s)
        #获取环境变量中的beaker.session对象，以字典的形式向session对象添加所需信息。
        if user_type == "customer":
            #print("=>用户为广告主[user_type = customer]")
            s["customer_user"] = username
            s["user_type"] = user_type
        if user_type == "provider":
            #print("=>用户为管理员[user_type = provider]")
            s["provider_user"] = username
            s["user_type"] = user_type
        ## print("设置session===后===，sesstion为：",s)
        s.save()
        # log中写入登录记录
        db.log(loginTypeDict[user_type],{"username":username,"password":password,"user_type":user_type})
        # data中写入登录详情
        db.insertUserLoginDetail(loginTypeDict[user_type],{"username":username,"password":password,"user_type":user_type})
        # 进入登录后首页
        bottle.redirect(indexPageDict[s["user_type"]])
    else:
        #print("账号密码验证失败，返回登录首页")
        bottle.redirect('/')


# 登出--清除session
@bottle.get('/logout')
def logout():
    user_type = bottle.request.GET.get('type')
    #print("地址栏数据type：",user_type)
    s = bottle.request.environ.get('beaker.session')
    #print("登出，清除==前==user/pass为：",s)
    # 清除session数据
    s[user_type+"_user"] = None
    s["user_type"] = None
    #print("登出，清除==后==user/pass为：",s)
    bottle.redirect("/")


# 注册页面
@bottle.get('/register') 
def register():
    return bottle.template('register')

################--客户--管理界面####################

# 客户-首页-账户报告
@bottle.get('/accountReport') 
def accountReport():
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "账户报告"
    return template('customer-account-report.html',navPageArr=navPageDict["customer"], title = title ,username = username,isCustomer = True)

# 客户-页面-广告管理
@bottle.get('/guanggaoManage')
def guanggaoManage():
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "广告管理"
    return template('customer-guanggao-manage.html', navPageArr=navPageDict["customer"], title = title, username = username,isCustomer = True)

# 客户-页面-广告管理-添加广告
@bottle.get('/guanggaoManage/<detailPage>')
def adManageDetail(detailPage):
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "添加新广告"
    html = detailPage +".html"
    return template(html, navPageArr=navPageDict["customer"], title = title, username = username,isCustomer = True)

# 客户-页面-财务管理
@bottle.get('/financeManage') 
def financeManage():
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "财务管理"
    return template('customer-finance-manage.html', navPageArr=navPageDict["customer"], title = title, username = username,isCustomer = True)

# 客户-页面-财务管理-充值
@bottle.get('/financeManage/<detailPage>') 
def financeManageDetail(detailPage):
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "充值"
    html = detailPage +".html"
    return template(html, navPageArr=navPageDict["customer"], title = title, username = username,isCustomer = True)

# 客户-页面-账号信息
@bottle.get('/accountInfo') 
def accountManage():
    checkSessionData("customer_user","customer")
    username = bottle.request.environ.get('beaker.session').get('customer_user')
    title = "账号信息"
    return template('customer-account-info.html', navPageArr=navPageDict["customer"], title = title, username = username,isCustomer = True)


#############--服务商--管理界面##############

# server-首页-客户概况
@bottle.get('/customerInfo') 
def customerInfo():
    checkSessionData("provider_user","provider")
    username = bottle.request.environ.get('beaker.session').get('provider_user')
    title = "客户概况"
    return template('serv-customer-info.html',navPageArr=navPageDict["provider"], title = title ,username = username,isCustomer = False)

# server-页面-充值处理
@bottle.get('/chargeManage') 
def chargeManage():
    checkSessionData("provider_user","provider")
    username = bottle.request.environ.get('beaker.session').get('provider_user')
    title = "充值处理"
    return template('serv-charge-manage.html',navPageArr=navPageDict["provider"], title = title ,username = username,isCustomer = False)

# server-页面-广告处理
@bottle.get('/customerGuanggao') 
def customerGuanggao():
    checkSessionData("provider_user","provider")
    username = bottle.request.environ.get('beaker.session').get('provider_user')
    title = "广告处理"
    return template('serv-customer-guanggao.html',navPageArr=navPageDict["provider"], title = title ,username = username,isCustomer = False)

# server-页面-任务管理
@bottle.get('/taskManage') 
def taskManage():
    checkSessionData("provider_user","provider")
    username = bottle.request.environ.get('beaker.session').get('provider_user')
    title = "任务管理"
    return template('serv-task-manage.html',navPageArr=navPageDict["provider"], title = title ,username = username,isCustomer = False)

# serv-页面-任务管理-子页面(任务详情/修改任务/新增任务)
@bottle.get('/taskManage/<detailPage>') 
def financeManageDetail(detailPage):
    checkSessionData("provider_user","provider")
    username = bottle.request.environ.get('beaker.session').get('provider_user')
    taskManageChildPageTitleDict = {"rwxq":"任务详情","rwxg":"修改任务","rwxz":"新增任务"}
    title = taskManageChildPageTitleDict[detailPage]
    html = detailPage +".html"
    return template(html, navPageArr=navPageDict["provider"], title = title, username = username,isCustomer = False)



# 数据库处理
@bottle.post('/db')
def dbmanager():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    cmd = data['cmd']
    params = data['params']

    # 获取数据库信息
    db_info = db.shooseDB(cmd)

    # print(db_info)

    # 数据库能否正常连接
    if not db.canConnect(db_info):
        return fail("服务器数据库连接失败，请联系您的服务商！<<</db")

    #写入日志
    # db.log(cmd,json.dumps(params, ensure_ascii=False))
    db.log(cmd,params)

    dbHandleResult = db.handle(db_info, cmd, params)
    if not isinstance(dbHandleResult, dict) or (not dbHandleResult["success"]):
        return fail(dbHandleResult["message"])
        # return fail("数据库访问超时,请联系您的服务商！")

    return json.dumps(dbHandleResult)

# 启动服务器
def main():
    session_app = SessionMiddleware(bottle.default_app(),session_opts)
    if len(sys.argv) < 2 or not sys.argv[1].isdigit():
        # print("用法：python3 ./webgm.py 端口号")
        # print("例如：python3 ./webgm.py 8080")
        # print()
        os.system("pause")
    else:
        bottle.run(app=session_app,server='tornado', host='0.0.0.0', port=sys.argv[1], reloader=True)

if __name__ == '__main__':
    main()