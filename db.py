# -*- coding:utf-8 -*-
import base64
import zlib
import json
import bottle
import math
import traceback    
import bottle
import re
import pymongo

import datetime
import time

# 定义命令key值
dataKey = {
"userRegister":100101,"modifyUserBaseInfo":100102,"modifyUserPwd":100103,
"customerLogin":100201,"userCharge":100301,"delCharge":100302,"cancelCharge":100303,
"userAddGuanggao":100401,"cancelGuanggao":100402,

"providerLogin":200201,"confirmCustomerCharge":200301,"failCustomerCharge":200302,
"confirmCustomerGuanggao":200401,"failCustomerrGuanggao":200402,
"addTask":200501,"modifyTaskDetail":200502,"delTask":200503,
}


# 数据加密
def encryptMd5(passwordstr):
    if not isinstance(passwordstr, str):
        # print("ERROR，待加密内容非字符串")
        return "Wrong 待加密内容非字符串!"
    import hashlib
    encryptedPwd = hashlib.md5(passwordstr.encode('utf-8')).hexdigest()
    return encryptedPwd


# 获取服务器数据库信息
def getDbInfo():
        with open('json/dbconfig.json', 'rb') as json_data:
            return json.loads(json_data.read().decode('utf-8'))

# 选择数据库
def shooseDB(command):
    try:
        with open('json/authority.json', 'rb') as json_data:
            cmdData = json.loads(json_data.read().decode('utf-8'))
            if command in cmdData["oz task"]:
                db_info = getDbInfo()["oz_task"]
            else:
                db_info = getDbInfo()["oz_manage"]
            return db_info
    except Exception:
        traceback.print_exc()
    return False

# 数据库能否连接
def canConnect(db):
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        if not conn:
            # print("Warning Message:mongodb连接失败!", db["db_name"])
            conn.close()
            return False

        conn_db = conn[db["db_name"]]
        if not conn_db:
            # print("Warning Message:未找到数据库==>>>", db["db_name"])
            conn.close()
            return False
        return True
    except Exception as e:
        traceback.print_exc()
    return False

     

def oprateMongodb(mongo_cmd,sql,col_name,db,modification={}):
    conn = pymongo.MongoClient(db["mongo_uri"])
    if not conn:
        # print("Warning Message:mongodb连接失败!", db["db_name"])
        conn.close()
        return "Mongodb Collect Fail"

    conn_db = conn[db["db_name"]]
    if not conn_db:
        # print("Warning Message:未找到数据库==>>>", db["db_name"])
        conn.close()
        return "Mongodb Collect Fail"
    # conn_db.authority("oz_server001_customer","135asdf13a13e13f3")
    conn_col = conn_db[col_name]
    if not conn_col:
        # print("Warning Message:未找到聚集(数据表)==>>>",col_name,)
        conn.close()
        return "Mongodb Collect Fail"

    if mongo_cmd == "find":
        data = conn_col.find(sql)
        conn.close()
        return data
    if mongo_cmd == "find_one":
        # print(sql)
        data = conn_col.find_one(sql)
        conn.close()
        return data
    if mongo_cmd == "insert_one":
        conn_col.insert_one(sql)
        conn.close()
        return True
    if mongo_cmd == "remove":
        conn_col.remove(sql)
        conn.close()
        return True
    if mongo_cmd == "update":
        conn_col.update(sql,modification)
        conn.close()


# 查询 [find_one]
def findOneMongodb(sql={}, col_name = "user", db = None):
    # 选择数据库
    if not db:
        # db = {"mongo_uri":"mongodb://aaa:bbb@localhost:27017/oz_manage","db_name":"oz_manage"}
        db = getDbInfo()["oz_manage"]
    try:
        data = oprateMongodb("find_one",sql,col_name,db)
        return data
    except Exception as e:
        traceback.print_exc()
    return False


# 查询[find]
def findMongodb(sql={}, col_name = "user", db = None):
    # 选择数据库
    if not db:
        # db = {"mongo_uri":"mongodb://aaa:bbb@localhost:27017/oz_manage","db_name":"oz_manage"}
        db = getDbInfo()["oz_manage"]
    try:
        data = oprateMongodb("find",sql,col_name,db)
        return data
    except Exception as e:
        traceback.print_exc()
    return False


# 执行修改
def updateMongodb(sql={}, modification={}, col_name = "user", db = None ):
    # 选择数据库
    if not db:
        # db = {"mongo_uri":"mongodb://aaa:bbb@localhost:27017/oz_manage","db_name":"oz_manage"}
        db = getDbInfo()["oz_manage"]
    try:
        oprateMongodb("update",sql,col_name,db,modification)
        return True
    except Exception as e:
        traceback.print_exc()
    return False


# 执行插入
def insertOneMongodb(sql, col_name = "user", db = None):
    if not isinstance(sql, dict):
        # print("ERROR，插入的内容不是字典格式！")
        print("=>Warning: insertOneMongodb Wrong! [sql is not dict]")
        return {"success": False,"message":"数据insert错误!(非dict数据)"}
    # 选择数据库
    if not db:
        # db = {"mongo_uri":"mongodb://aaa:bbb@localhost:27017/oz_manage","db_name":"oz_manage"}
        db = getDbInfo()["oz_manage"]
    try:
        insert_id = oprateMongodb("insert_one",sql,col_name,db)
        return insert_id
    except Exception as e:
        traceback.print_exc()
    return False


# 删除记录
def removeMongodb(sql,col_name = "user",db = None ):
    # if type(sql) is not dict:
    if not isinstance(sql, dict):
        # print("ERROR,提供的删除条件不是字典格式！")
        print("=>Warning: removeMongodb Wrong! [sql is not dict]")
        return {"success": False,"message":"数据remove错误!(非dict数据)"}
    # 选择数据库
    if not db:
        # db = {"mongo_uri":"mongodb://aaa:bbb@localhost:27017/oz_manage","db_name":"oz_manage"}
        # db = {"host":"127.0.0.1", "port":27017,"db_name":"oz_manage"}
        db = getDbInfo()["oz_manage"]
    try:
        oprateMongodb("remove",sql,col_name,db)
    except Exception as e:
        traceback.print_exc()
    return False


# 格式化时间戳
def toFormatTime(timestamp, timeformat = "%Y-%m-%d %H:%M:%S"):
    try:
        res_time = datetime.datetime.fromtimestamp(timestamp).strftime(timeformat)
        return res_time
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "格式化时间戳错误!!"}
  

# 日志记录
def needLog(command):
    try:
        with open('json/authority.json', 'r') as json_data:
            authority = json.load(json_data)
            return command not in authority["not log"]
    except Exception as e:
        traceback.print_exc()
    return True


# 写入日志 new
def log(command,params):
    if needLog(command):
        import copy
        logParams = isinstance(params, dict) and copy.deepcopy(params) or params
        if isinstance(params, list):
            logParams = params[:]

        logInfo = {}
        logInfo["key"] = dataKey[command]
        if isinstance(logParams, dict):
            logInfo["username"] = logParams["username"]
        if isinstance(logParams, list):
            logInfo["username"] = logParams[0]
        if isinstance(logParams, dict) and "password" in logParams:
            logParams["password"] = encryptMd5(logParams["password"])
        logInfo["operate_cmd"] = command
        logInfo["operate_param"] = json.dumps(logParams)
        logInfo["operate_time"] = int(time.time())
        logInfo["operate_ip"] = bottle.request.remote_addr
        insertOneMongodb(logInfo, "log")


# username检测
def checkDbUsername(db, username):
    # print("==>用户名检测开始:",username)
    if not isEmail(username):
        # print("=>check result:",username,"不是正确的邮箱地址!! <==checkDbUsername()")
        return {"success": False,"message":"用户名"+username+"不是正确的邮箱地址!!"}
    data = findOneMongodb({"username":username},"user",db)
    if data and data !="Mongodb Collect Fail":
        # print("=>用户名检测Result:",username,"存在!! <==checkDbUsername()")
        return {"success": True,"data":{"result":True,"ret_data":True}}
    elif not data:
        # print("=>用户名检测Result:",username,"不存在!! <==checkDbUsername()")
        return {"success": True,"data":{"result":True,"ret_data":False}}
    return {"success": False,"message":"username检测时异常!!<<<checkDbUsername()"}

# 登录username & password匹配检测
def isPasswordMatch(db, params):
    username, password = params[0],params[1]
    # print("==>密码匹配检测 用户名:",username,";密码:",password)
    data = findOneMongodb({"username":username,"password":encryptMd5(password)},"user",db)
    # print("2222222222",data)
    if data and data !="Mongodb Collect Fail":
        # print("=>匹配检测Result: 密码匹配 <==isPasswordMatch()")
        return {"success": True,"data":{"result":True,"ret_data":True}}
    elif not data:
        # print("=>匹配检测Result: 密码不匹配 <==isPasswordMatch()")
        return {"success": True,"data":{"result":True,"ret_data":False}}
    return {"success": False,"message":"isPasswordMatch检测时异常!!<<<isPasswordMatch()"}

# 查询当前姓名/公司是否可用
def checkDbDisplayName(db, displayname):
    # print(displayname,"服务器目前没有检测公司名称")
    return {"success": True,"data":{"result":True}}


# 用户名(邮箱)验证
def isEmail(email):
    patter = re.compile(r'[^\._-][\w\.-]+@(?:[A-Za-z0-9]+\.)+[A-Za-z]+')
    if isinstance(email, str): 
        return bool(patter.match(email))
    # print("warning:email类型错误!!,应该为字符串!!")
    return False

# 固定电话验证 格式:010/020-025/027-029 /03**-09** ******* ******** */
def isFixedTel(fixedTel):
    patter = re.compile(r'^0((10)|(2[0-5|7-9])|[3-9]\d{2})(\-|\s)?\d{7,8}$')
    return bool(patter.match(fixedTel))

# 手机号验证 格式:130-139 145/147 150-159 176-178 180-189 */
def isFixedTel(phoneNumber): 
    patter = re.compile(r'^((\+?86)|(\(\+?86\)))?0?((13[0-9])|145|147|(15[0-9])|(17[6-8])|(18[0-9]))\d{8}$')
    return bool(patter.match(phoneNumber))

# QQ验证
def isQQ(QQNumber): 
    patter = re.compile(r'^[1-9]\d{4,10}$')
    return bool(patter.match(QQNumber))

# 密码验证 格式：
def isPwdOK(password): 
    # patter = re.compile(r'^[a-zA-Z]{1}([a-zA-Z0-9]|[\s\\s,<\.>\?;:\'"\[\]\{\}\\\|`~!@#%\$\^&\*\(\)\-\+]){5,11}$')
    patter = re.compile(r'^.{6,20}$')
    if isinstance(password, str): 
        return bool(patter.match(password))
    # print("warning:password类型错误!!,应该为字符串!!")
    return False

# 用户注册
def userRegister(db,registerInfo):
    # print("==>用户注册开始")
    data = findOneMongodb({"username":registerInfo["username"]},"user",db)
    if data and data !="Mongodb Collect Fail":
        return {"success": True,"data":{"result":False}}
    userRegisterInfo = {}
    userRegisterInfo["key"] = 100101
    userRegisterInfo["username"] = registerInfo["username"]

    # print("==>注册:用户名检测(serv端)")
    isUsernameOK = checkDbUsername(db, registerInfo["username"])
    if not isUsernameOK["success"]:
        return {"success": False,"message":isUsernameOK["message"]}
    else:
        if isUsernameOK["data"]["ret_data"]:
            return {"success": False,"message":"用户名"+username+"已被注册!!"}
    
    userRegisterInfo["password"] = registerInfo["password"]
    # print("==>注册:密码检测(serv端)")
    if not isPwdOK(userRegisterInfo["password"]):
        return {"success": False,"message":"注册密码应为6~20位字符!!"}
    userRegisterInfo["password"] = encryptMd5(registerInfo["password"])

    userRegisterInfo["user_type"] = "customer"
    userRegisterInfo["display_name"] = registerInfo["display_name"]
    userRegisterInfo["contact_name"] = registerInfo["contact_name"]
    userRegisterInfo["contact_phone"] = registerInfo["contact_phone"]
    userRegisterInfo["contact_qq"] = registerInfo["contact_qq"]
    userRegisterInfo["contact_address"] = registerInfo["contact_address"]
    userRegisterInfo["register_time"] = int(time.time())
    userRegisterInfo["register_ip"] = bottle.request.remote_addr
    try:
        # 写入用户注册信息
        insertOneMongodb(userRegisterInfo,"user",db)
        # 修改平台数据(用户人数)
        updatePlatformUserNum = {"$inc":{
        "base.total_customer_count":1,
        }}
        platform_data = findOneMongodb({"key":300101},"oz_data",db)
        if platform_data and platform_data !="Mongodb Collect Fail":
            updateMongodb({}, updatePlatformUserNum,"oz_data")
        else:
            insertOneMongodb({"key":300101,"base":{"total_customer_count":1}},"oz_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 获取用户信息
def getUserInfo(db,username):
    # print("====>账号信息页,开始获取用户数据:",username)
    userinfo = {}
    sql = {}
    sql["key"] = 100101
    sql["username"] = username
    # print(sql)
    data = findOneMongodb(sql,"user",db)
    # print(data)
    if data and data !="Mongodb Collect Fail":
        userinfo["display_name"] = data["display_name"]
        userinfo["contact_name"] = data["contact_name"]
        userinfo["contact_phone"] = data["contact_phone"]
        userinfo["contact_name"] = data["contact_name"]
        userinfo["contact_qq"] = data["contact_qq"]
        userinfo["contact_address"] = data["contact_address"]
        # print(userinfo)
        return {"success": True,"data":{"result":True,"ret_data":userinfo}}
    return {"success": False,"message":"SORRY,不存在用户"+username}

# 修改用户基本资料
def modifyUserBaseInfo(db,baseInfo):
    username = baseInfo.get("username",None)
    # print("==>开始修改用户基本资料:",username)
    # print("==>修改资料:用户名检测(serv端)")
    isUsernameOK = checkDbUsername(db,username)
    if not isUsernameOK["success"]:
        return {"success": False,"message":isUsernameOK["message"]}
    else:
        if not isUsernameOK["data"]["ret_data"]:
            return {"success": False,"message":"用户"+username+"不存在!!"}
    modifyInfo = {}
    modifyInfo["key"] = dataKey["modifyUserBaseInfo"]
    modifyInfo["username"] = username
    modifyInfo["modify_time"] = int(time.time())
    modifyInfo["modify_ip"] = bottle.request.remote_addr
    modifyInfo["modify_params"] = json.dumps(baseInfo)
    try:
        # 修改用户信息
        updateUserInfo = {"$set":{
            "display_name":baseInfo["display_name"],
            "contact_name":baseInfo["contact_name"],
            "contact_phone":baseInfo["contact_phone"],
            "contact_qq":baseInfo["contact_qq"],
            "contact_address":baseInfo["contact_address"],

            "last_modify_base_time":modifyInfo["modify_time"],
            "last_modify_base_ip":modifyInfo["modify_ip"]
        }}
        updateMongodb({"username": username}, updateUserInfo,"user",db)

        # 向数据库写入本次操作详细
        insertOneMongodb(modifyInfo, "customer_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "修改资料失败！"}


# 修改用户密码
def modifyUserPwd(db,newPwdInfo):
    username = newPwdInfo.get("username",None)
    oldPassword = newPwdInfo.get("old_password",None)
    if not oldPassword:
        return {"success": False,"message":"服务器未能获取到旧密码!!"}
    # print("==>开始修改用户密码")

    isOldPasswordOK = checkOldPwd(db,[username,oldPassword])

    if not isOldPasswordOK["success"]:
        return {"success": False,"message":isOldPasswordOK["message"]}
    else:
        if not isOldPasswordOK["data"]["result"]:
            return {"success": False,"message":"旧密码输入错误"}

    newPassword = newPwdInfo.get("new_password",None)
    # print("==>新密码检测(serv端)")
    if not newPassword:
        return {"success": False,"message":"服务器未能获取到新密码!!"}
    if not isPwdOK(newPassword):
        return {"success": False,"message":"新密码格式不正确!!"}
    # 加密密码
    password = encryptMd5(newPassword)
    modifyInfo = {}
    modifyInfo["key"] = dataKey["modifyUserPwd"]
    modifyInfo["username"] = username
    modifyInfo["modify_pwd_time"] = int(time.time())
    modifyInfo["modify_pwd_ip"] = bottle.request.remote_addr
    modifyInfo["modify_pwd_params"] = json.dumps(newPwdInfo)
    try:
        # 修改用户信息
        updateUserPwd = {"$set":{
            "password":password,

            "last_modify_pwd_time":modifyInfo["modify_pwd_time"],
            "last_modify_pwd_ip":modifyInfo["modify_pwd_ip"]
        }}
        updateMongodb({"username": username}, updateUserPwd,"user",db)

        # 向数据库写入本次操作详细
        insertOneMongodb(modifyInfo, "customer_data")
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "修改密码失败！"}


# 验证用户旧密码
def checkOldPwd(db,params):
    # print("==>验证用户旧密码,用户名:"+params[0],",旧密码：",params[1])
    userInfo = findOneMongodb({"username":params[0]})
    if not userInfo:
        return {"success": False,"message":"非法操作，不存在用户"+params[0]}
    if userInfo["password"] != encryptMd5(params[1]):
        # print("==>用户旧密码验证未通过")
        return {"success": True,"data":{"result":False}}
    else:
        # print("==>用户旧密码验证OK")
        return {"success": True,"data":{"result":True}}


# 写入用户登录详情
def insertUserLoginDetail(cmd,params):
    loginInfo = {}
    loginInfo["key"] = dataKey[cmd]
    loginInfo["username"] = params["username"]
    loginInfo["password"] = encryptMd5(params["password"])
    loginInfo["user_type"] = params["user_type"]
    # loginInfo["login_time"] = datetime.datetime.now()
    loginInfo["login_time"] = int(time.time())
    loginInfo["login_ip"] = bottle.request.remote_addr
    # 写入登录信息
    insertOneMongodb(loginInfo, loginInfo["user_type"]+"_data")
    # 更新用户信息-最后登录时间/IP
    modification = {"$set":{
        "last_login_time":loginInfo["login_time"],
        "last_login_ip":loginInfo["login_ip"]
    }}  
    updateMongodb({"username": loginInfo["username"]}, modification)


# 用户充值
def userCharge(db,chargeInfo):

    print("==>client charge info:",chargeInfo)
    userInfo = findOneMongodb({"username":chargeInfo["username"],"charge":{"$exists": True}},"user",db)
    if not userInfo or userInfo=="Mongodb Collect Fail":
        old_charge_count = 0
    else:
        old_charge_count = userInfo["charge"].get("total_submit_charge_count",0)
    userchargeInfo = {}
    userchargeInfo["key"] = 100301
    userchargeInfo["username"] = chargeInfo["username"]
    userchargeInfo["charge_bianhao"] = 300100 + old_charge_count
    # 充值金额
    userchargeInfo["charge_amount"] = chargeInfo["charge_amount"]
    # 付款金额
    userchargeInfo["pay_amount"] = 0 #提交充值时尚未付款
    # 付款单号
    userchargeInfo["pay_number"] = "服务商未收到付款" #提交充值时尚未付款

    userchargeInfo["pay_name"] = chargeInfo["pay_name"]
    # 是否显示（用户展示删除充值记录）no_show时用户端不显示
    userchargeInfo["is_client_show"] = "show"

    userchargeInfo["need_invoice"] = chargeInfo["need_invoice"]
    userchargeInfo["invoice_title"] = chargeInfo["invoice_title"]
    userchargeInfo["invoice_receiver"] = chargeInfo["invoice_receiver"]
    userchargeInfo["invoice_phone"] = chargeInfo["invoice_phone"]
    userchargeInfo["invoice_address"] = chargeInfo["invoice_address"]

    userchargeInfo["charge_status"] = "wait_pay"
    userchargeInfo["charge_time"] = int(time.time())
    userchargeInfo["charge_ip"] = bottle.request.remote_addr
    try:
        # 向数据库写入本次操作详细
        insertOneMongodb(userchargeInfo, "customer_data",db)
        # 修改用户充值信息
        update_charge_count_money = {"$inc":{
        "charge.wait_pay_count":1,
        "charge.wait_pay_money":userchargeInfo["charge_amount"],
        "charge.total_submit_charge_count":1,
        }}
        update_charge_time_ip = {"$set":{
        "charge.last_submit_charge_time":userchargeInfo["charge_time"],
        "charge.last_submit_charge_ip":userchargeInfo["charge_ip"]
        }}
        updateMongodb({"username": userchargeInfo["username"]}, update_charge_count_money,"user",db)
        updateMongodb({"username": userchargeInfo["username"]}, update_charge_time_ip,"user",db)

        # 修改平台充值信息
        updateMongodb({}, update_charge_count_money,"oz_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 获取用户充值详情
def getUserChargeInfo(db,params):
    # print("====>财务管理页,获取用户充值列表,params:",params)
    pagination = 10
    page = int(params[1])

    # chargeStatus = {"wait_pay":"付款确认中","success":"充值成功","fail":"充值失败","cancel":"已取消"}
    total = 0
    ret_data = []
    # charge_cursor = findMongodb({"key":100301,"username":username,"show":"show"},"customer_data").sort("charge_time",-1)
    charge_cursor = findMongodb({"key":100301,"username":params[0],"is_client_show":"show"},"customer_data",db)
    # print("用户充值情况情况：111",charge_cursor)
    if charge_cursor != "Mongodb Collect Fail":
        charge_cursor = charge_cursor.sort("charge_time",-1)
        total = charge_cursor.count()
        # print("充值总条数:",total)
    if total != 0:
        total = math.ceil(float(total)/pagination)
        charge_cursor.skip((page-1)*pagination).limit(pagination)
        for item in charge_cursor:
            # print("用户充值情况情况：222",item)
            ret_data.append([
                toFormatTime(item["charge_time"]),
                "充值",
                item["pay_name"],
                item["need_invoice"],
                item["charge_bianhao"],
                item["charge_status"],
                item["charge_amount"],
                item["pay_amount"],
                item["pay_number"]
            ])
        return {"success": True,"data":{"total":total,"ret_data":ret_data}}
    return {"success": True,"data":{"total":total,"ret_data":ret_data}}

# 取消充值
def cancelCharge(db,params):
    sql = {"username":params[0],"charge_bianhao":params[1]}
 
    cancelInfo = {}
    charge_data = findOneMongodb(sql,"customer_data",db)
    if not charge_data or charge_data == "Mongodb Collect Fail":
        return {"success": False, "message": "没有编号为"+params[1]+"的充值记录！"}
    if charge_data["charge_status"] == "success":
        return {"success": False, "message": "该笔充值已经确认成功！请刷新页面！"}
    if charge_data["charge_status"] == "fail":
        return {"success": False, "message": "该笔充值已经失败！请刷新页面"}
    if charge_data["charge_status"] == "cancel":
        return {"success": False, "message": "客户已经取消该笔充值！请刷新页面"}

    cancelInfo["username"] = params[0]
    cancelInfo["cancel_charge_bianhao"] = params[1]
    cancelInfo["key"] = 100303
    cancelInfo["cancel_amount"] = charge_data["charge_amount"]
    cancelInfo["cancel_time"] = int(time.time())
    cancelInfo["cancel_ip"] = bottle.request.remote_addr
    try:
        # 修改充值记录
        update_charge_record = {"$set":{
            "charge_status":"cancel",
            "cancel_time":cancelInfo["cancel_time"],
            "cancel_ip":cancelInfo["cancel_ip"] ,
        }}
        updateMongodb(sql, update_charge_record,"customer_data",db)
        # 修改用户充值信息
        update_cancel_charge_count_money = {"$inc":{
        "charge.wait_pay_count":-1,
        "charge.wait_pay_money":-cancelInfo["cancel_amount"],
        "charge.cancel_charge_count":1,
        "charge.cancel_charge_money":cancelInfo["cancel_amount"],
        }}
        update_cancel_charge_time_ip = {"$set":{
        "charge.last_cancel_charge_time":cancelInfo["cancel_time"],
        "charge.last_cancel_charge_ip":cancelInfo["cancel_ip"]
        }}
        updateMongodb({"username": cancelInfo["username"]}, update_cancel_charge_count_money,"user",db)
        updateMongodb({"username": cancelInfo["username"]}, update_cancel_charge_time_ip,"user",db)
        # 修改平台充值信息(已取消&待付款)
        updateMongodb({}, update_cancel_charge_count_money,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(cancelInfo, "customer_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 删除充值(实际仅客户端不显示)
def delCharge(db,params):
    sql = {"username":params[0],"charge_bianhao":params[1]}
 
    delInfo = {}
    charge_data = findOneMongodb(sql,"customer_data",db)
    if data["is_client_show"] == "no_show":
        return {"success": False, "message": "您已删除该笔充值！请刷新页面"}
    oldStatus = charge_data["charge_status"]

    delInfo["username"] = params[0]
    delInfo["del_charge_bianhao"] = params[1]
    delInfo["key"] = 100303
    delInfo["del_amount"] = charge_data["charge_amount"]
    delInfo["del_time"] = int(time.time())
    delInfo["del_ip"] = bottle.request.remote_addr
    subWaitPay = oldStatus =="wait_pay" and delInfo["del_amount"] or 0
    addCancelCount = oldStatus =="wait_pay" and 1 or 0
    try:
        # 修改充值记录
        modification0 = {"$set":{
            # "charge_status":"customer_del",
            "is_client_show":"no_show",
            "del_time":delInfo["del_time"],
            "del_ip":delInfo["del_ip"] ,
        }}
        updateMongodb(sql, modification0,"customer_data",db)
        # 修改用户充值信息
        update_del_charge_count_money = {"$inc":{
        "charge.wait_pay_count":-addCancelCount,
        "charge.wait_pay_money":-subWaitPay,

        "charge.cancel_charge_count":addCancelCount,
        "charge.cancel_charge_money":subWaitPay,

        "charge.del_charge_count":1,
        "charge.del_charge_money":delInfo["del_amount"],
        }}
        update_del_charge_time_ip = {"$set":{
        "charge.last_del_charge_time":delInfo["del_time"],
        "charge.last_del_charge_ip":delInfo["del_ip"]
        }}
        updateMongodb({"username": delInfo["username"]}, update_del_charge_count_money,"user",db)
        updateMongodb({"username": delInfo["username"]}, update_del_charge_time_ip,"user",db)
        # 修改平台充值信息(已取消&待付款)
        updateMongodb({}, update_del_charge_count_money,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(delInfo, "customer_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 删除充值(会真正从数据库删除数据)
def delCharge1(db,params):
    sql = {"username":params[0],"charge_bianhao":params[1]}

    delInfo = {}
    charge_data = findOneMongodb(sql,"customer_data",db)

    delInfo["username"] = params[0]
    delInfo["bianhao"] = params[1]
    delInfo["key"] = 100302
    delInfo["del_amount"] = charge_data["charge_amount"]
    delInfo["del_time"] = int(time.time())
    delInfo["del_ip"] = bottle.request.remote_addr

    try:
        # 删除充值记录
        removeMongodb(sql,"customer_data")
        
        # 修改用户充值信息
        modification1 = {"$inc":{
        "del_charge_count":1,
        "money_brief.curr_money":-delInfo["del_amount"],
        "charge.del_charge_count":1,
        "charge.curr_money":-delInfo["del_amount"],
        }}
        modification2 = {"$set":{
        "charge.last_del_charge_time":delInfo["del_time"],
        "charge.last_del_charge_ip":delInfo["del_ip"]
        }}
        updateMongodb({"username": delInfo["username"]}, modification1,"user",db)
        updateMongodb({"username": delInfo["username"]}, modification2,"user",db)

        # 向数据库写入本次操作详细
        insertOneMongodb(delInfo, "customer_data",db)
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


def getCurrTempMoney(db,username):
    # 查询当前临时余额
    userMoneyInfo = findOneMongodb({"username":username,"money_brief":{"$exists": True}},"user",db)
    if not userMoneyInfo or userMoneyInfo =="Mongodb Collect Fail":
        return {"success": True,"data":{"result":True,"ret_data":0}}
    else:
        # curr_money = "temp_total_money" in userMoneyInfo["money_brief"] and str(userMoneyInfo["money_brief"]["temp_total_money"])+".00" or 0
        curr_money = userMoneyInfo["money_brief"].get("temp_total_money",0)
        return {"success": True,"data":{"result":True,"ret_data":curr_money}}

# 用户添加广告
def userAddGuanggao(db,guanggaoInfo):
    # 查询当前临时余额
    userMoneyInfo = findOneMongodb({"username":guanggaoInfo["username"],"money_brief":{"$exists": True}},"user",db)
    if not userMoneyInfo or userMoneyInfo =="Mongodb Collect Fail":
        return {"success": False, "message": "可用余额不足！请充值或者修改广告份数！"}
    else:
        curr_money = userMoneyInfo["money_brief"].get("temp_total_money",0)
        if curr_money <=0 or curr_money < (guanggaoInfo["single_price"]*guanggaoInfo["plan_num"]) :
            return {"success": False, "message": "可用余额不足！请充值或者修改广告份数！"}

    total_guanggao_count = userMoneyInfo.get("guanggao",0)
    if total_guanggao_count != 0:
        # pass
        total_guanggao_count = userMoneyInfo["guanggao"].get("total_add_guanggao_count",0)

    userGuanggaoInfo = {}
    userGuanggaoInfo["key"] = 100401
    userGuanggaoInfo["username"] = guanggaoInfo["username"]

    userGuanggaoInfo["app_title"] = guanggaoInfo["app_title"]
    userGuanggaoInfo["iTunes_url"] = guanggaoInfo["iTunes_url"]
    userGuanggaoInfo["start_time"] = guanggaoInfo["start_time"]
    userGuanggaoInfo["end_time"] = guanggaoInfo["end_time"]

    userGuanggaoInfo["need_multi_kw"] = guanggaoInfo["need_multi_kw"]
    userGuanggaoInfo["keywords_dict"] = guanggaoInfo["keywords_dict"]

    userGuanggaoInfo["plan_num"] = guanggaoInfo["plan_num"]
    userGuanggaoInfo["single_price"] = guanggaoInfo["single_price"]
    userGuanggaoInfo["plan_total_price"] = guanggaoInfo["single_price"]*guanggaoInfo["plan_num"]
    userGuanggaoInfo["real_total_price"] = 0
    # 完成份数，添加时完成份数为0
    userGuanggaoInfo["complete_num"] = 0

    userGuanggaoInfo["platform_type"] = guanggaoInfo["platform_type"]
    userGuanggaoInfo["guanggao_status"] = "wait_check"
    userGuanggaoInfo["guanggao_bianhao"] = 400100 + total_guanggao_count
    userGuanggaoInfo["guanggao_time"] = int(time.time())
    userGuanggaoInfo["guanggao_ip"] = bottle.request.remote_addr

    try:
        # 向数据库写入本次操作详细
        insertOneMongodb(userGuanggaoInfo, "customer_data",db)
        # 修改用户广告信息(--笔数--)
        # 投放广告总份数/总笔数
        update_add_guanggao_count_num = {"$inc":{
        "guanggao.total_add_guanggao_count":1,
        "guanggao.all_count":1,
        "guanggao.wait_check_count":1,
        "guanggao.wait_check_num":userGuanggaoInfo["plan_num"],
        "guanggao.wait_check_money":userGuanggaoInfo["plan_total_price"],
        "money_brief.temp_total_money":-userGuanggaoInfo["plan_total_price"],
        }}
        # 最后添加广告的时间及IP
        update_add_guanggao_time_ip = {"$set":{
        "guanggao.last_add_guanggao_time":userGuanggaoInfo["guanggao_time"],
        "guanggao.last_add_guanggao_ip":userGuanggaoInfo["guanggao_ip"]
        }}
        updateMongodb({"username": userGuanggaoInfo["username"]}, update_add_guanggao_count_num,"user",db)
        updateMongodb({"username": userGuanggaoInfo["username"]}, update_add_guanggao_time_ip,"user",db)

        # 修改平台广告数据
        updateMongodb({}, update_add_guanggao_count_num,"oz_data",db)
        updateMongodb({}, update_add_guanggao_time_ip,"oz_data",db)
        # 更新用户消费信息(概要)
        # updateUserAccountReport(guanggaoInfo["username"])
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 获取用户投放广告概况
def getUserGuanggaoBreif(db,username):
    # print("====>广告管理页,开始获取用户投放广告概况:",username)
    userGuanggaoBreif = {}
    data = findOneMongodb({"username":username,"guanggao":{"$exists": True}},"user",db)
    try:
        if data and data != "Mongodb Collect Fail":
            userGuanggaoBreif["cancel"]     = data["guanggao"].get("cancel_count",0)
            userGuanggaoBreif["going"]      = data["guanggao"].get("going_count",0)
            userGuanggaoBreif["wait_check"] = data["guanggao"].get("wait_check_count",0)
            userGuanggaoBreif["check_fail"] = data["guanggao"].get("check_fail_count",0)
            userGuanggaoBreif["pause"]      = data["guanggao"].get("pause_count",0)
            userGuanggaoBreif["complete"]   = data["guanggao"].get("complete_count",0)
            userGuanggaoBreif["all"]        = data["guanggao"].get("all_count",0)
            return {"success": True,"data":{"result":True,"ret_data":userGuanggaoBreif}}
        else:
            userGuanggaoBreif = {"going":0,"wait_check":0,"check_fail":0,"pause":0,"complete":0,"all":0}
            return {"success": True,"data":{"result":True,"ret_data":userGuanggaoBreif}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False,"message":"未能获取投放广告概况失败，请刷新页面重试！"}


# 获取用户添加广告详情
def getUserGuanggaoInfo(db,params):
    # print("==>获取用户添加广告列表,params:",params)
    pagination = 10
    page = int(params[1])

    total = 0
    # guanggao_status = {"cancel":"已取消","going":"投放中","wait_check":"待审核","check_fail":"审核失败","pause":"暂停","complete":"完成","all":"所有"}
    ret_data = []
    sql={"key":100401,"username":params[0]}
    if params[2] != "all":
        sql["guanggao_status"] = str(params[2])
    # guanggao_cursor = findMongodb(sql,"customer_data").sort("guanggao_time",-1)
    guanggao_cursor = findMongodb(sql,"customer_data",db)
    if guanggao_cursor != "Mongodb Collect Fail":
        guanggao_cursor = guanggao_cursor.sort("guanggao_time",-1)
        total = guanggao_cursor.count()
    # print("=>广告总条数:",total)
    if total != 0:
        total = math.ceil(float(total)/pagination)
        guanggao_cursor.skip((page-1)*pagination).limit(pagination)
        for item in guanggao_cursor:
            ret_data.append([
                item["app_title"],
                item["platform_type"],
                item["guanggao_status"],
                toFormatTime(item["start_time"]),
                toFormatTime(item["end_time"]),
                item["plan_num"],
                item["complete_num"],
                item["single_price"],
                item["plan_total_price"],
                item["real_total_price"],
                item["guanggao_bianhao"]
            ])
        return {"success": True,"data":{"total":total,"ret_data":ret_data}}
    return {"success": True,"data":{"total":total,"guanggao_status":params[2]}}


# 取消添加广告()
def cancelGuanggao(db,params):
    # print("开始取消广告==",params[0],"==",params[1])
    sql = {}
    sql["username"] = params[0]
    sql["key"] = 100401
    sql["guanggao_bianhao"] = params[1]

    cancelInfo = {}
    guanggao_data = findOneMongodb(sql,"customer_data",db)
    if not guanggao_data or guanggao_data == "Mongodb Collect Fail":
        return {"success": False, "message": "没有编号为"+params[1]+"的广告记录！"}
    if guanggao_data["guanggao_status"] == "cancel":
        return {"success": False, "message": "该笔广告已经取消！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "going":
        return {"success": False, "message": "该笔广告正投放中！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "check_fail":
        return {"success": False, "message": "该笔广告服务商审核失败！请刷新页面"}
    if guanggao_data["guanggao_status"] == "pause":
        return {"success": False, "message": "该笔广告暂停中！请刷新页面"}
    if guanggao_data["guanggao_status"] == "complete":
        return {"success": False, "message": "该笔广告已完成！请刷新页面"}

    cancelInfo["username"] = params[0]
    cancelInfo["key"] = 100402

    cancelInfo["cancel_plan_num"] = guanggao_data["plan_num"]
    cancelInfo["guanggao_single_price"] = guanggao_data["single_price"]
    cancelInfo["cancel_plan_total_price"] = guanggao_data["plan_total_price"]
    cancelInfo["guanggao_title"] = guanggao_data["app_title"]
    cancelInfo["guanggao_status"] = guanggao_data["guanggao_status"]
    cancelInfo["cancel_time"] = int(time.time())
    cancelInfo["cancel_ip"] = bottle.request.remote_addr

    cancelItemStatusName = "guanggao." + str(cancelInfo["guanggao_status"])+"_count"
    try:
        # 删除添加广告记录
        update_guanggao_record = {"$set":{
            "guanggao_status":"cancel",
            "cancel_guanggao_time":cancelInfo["cancel_time"],
            "cancel_guanggao_ip":cancelInfo["cancel_ip"] ,
        }}
        updateMongodb(sql, update_guanggao_record,"customer_data",db)
        # 修改用户广告信息(笔数、份数、金额)
        update_guanggao_count_num_money = {"$inc":{
        "guanggao.wait_check_count":-1,
        "guanggao.wait_check_num":-cancelInfo["cancel_plan_num"],
        "guanggao.wait_check_money":-cancelInfo["cancel_plan_total_price"],

        "guanggao.cancel_count":1,
        "guanggao.cancel_num":cancelInfo["cancel_plan_num"],
        "guanggao.cancel_money":cancelInfo["cancel_plan_total_price"],

        "money_brief.temp_total_money":cancelInfo["cancel_plan_total_price"],
        }}
        update_guanggao_time_ip = {"$set":{
        "guanggao.last_cancel_guanggao_time":cancelInfo["cancel_time"],
        "guanggao.last_cancel_guangao_ip":cancelInfo["cancel_ip"]
        }}
        updateMongodb({"username": cancelInfo["username"]}, update_guanggao_count_num_money,"user",db)
        updateMongodb({"username": cancelInfo["username"]}, update_guanggao_time_ip,"user",db)
        # 修改平台广告数据
        updateMongodb({}, update_guanggao_count_num_money,"oz_data",db)
        updateMongodb({}, update_guanggao_time_ip,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(cancelInfo, "customer_data",db)
        # 更新用户消费信息(概要)
        # updateUserAccountReport(params[0])
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}


# 更新指定用户消费信息(概要)
def updateUserAccountReport(username):
    consumeInfo = {}

    now = datetime.datetime.now()
    today_0 = datetime.datetime(now.year, now.month, now.day)

    today_0_timestamp = time.mktime(today_0.timetuple())
    yesterday_0_timestamp = time.mktime(today_0.timetuple()) - 86400
    last7_0_timestamp = time.mktime(today_0.timetuple()) - 86400*6
    last30_0_timestamp = time.mktime(today_0.timetuple()) - 86400*29
    
    # 查询所有消费信息(添加广告记录)
    sql={"key":100401,"username":username,"real_total_price":{"$exists":True},"real_total_price":{"$gt":0}}
    guanggao_cursor = findMongodb(sql,"customer_data")
    guanggao_total = 0
    if guanggao_cursor != "Mongodb Collect Fail":
        guanggao_total = guanggao_cursor.count()
    today_cost,yesterday_cost,last7_cost,last30_cost,all_cost = 0,0,0,0,0
    if guanggao_total !=0:
        for item in guanggao_cursor:
            if item["confirm_guanggao_success_time"] < last30_0_timestamp:
                all_cost += item["real_total_price"]
            if last30_0_timestamp <= item["confirm_guanggao_success_time"] < last7_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
            if last7_0_timestamp <= item["confirm_guanggao_success_time"] < yesterday_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
            if yesterday_0_timestamp <= item["confirm_guanggao_success_time"] < today_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
                yesterday_cost += item["real_total_price"]
            if item["confirm_guanggao_success_time"] >= today_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
                today_cost += item["real_total_price"]
    # 写入用户消费信息
    update_customer_cost = {"$set":{
        "money_brief.today_cost":today_cost,
        "money_brief.yesterday_cost":yesterday_cost,
        "money_brief.last7_cost":last7_cost,
        "money_brief.last30_cost":last30_cost,
        "money_brief.all_cost":all_cost,
    }}
    try:
        updateMongodb({"username": username}, update_customer_cost)   
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "更新账户余额及消费信息时出错！"}

# 获取用户账户报告(余额及消费信息)
def getAccountReport(db,username):
    # print("====>账户报告页，开始获取用户账户报告:",username)
    updateUserAccountReport(username)
    accountReport = {}
    data = findOneMongodb({"username":username,"money_brief":{"$exists": True}},"user",db)
    if data and data !="Mongodb Collect Fail":
        accountReport["today_cost"]    = data["money_brief"].get("today_cost",0)
        accountReport["yesterday_cost"]= data["money_brief"].get("yesterday_cost",0)
        accountReport["last7_cost"]    = data["money_brief"].get("last7_cost",0)
        accountReport["last30_cost"]   = data["money_brief"].get("last30_cost",0)
        accountReport["curr_money"]    = data["money_brief"].get("curr_total_money",0)
        return {"success": True,"data":{"result":True,"ret_data":accountReport}}
    else:
        accountReport = {"today_cost":0,"yesterday_cost":0,"last7_cost":0,"last30_cost":0,"curr_money":0}
        return {"success": True,"data":{"result":True,"ret_data":accountReport}}

############以下为管理员命令######################################

# 更新平台消费数据
def updatePlatformConsumeInfo():
    consumeInfo = {}

    now = datetime.datetime.now()
    today_0 = datetime.datetime(now.year, now.month, now.day)

    today_0_timestamp = time.mktime(today_0.timetuple())
    yesterday_0_timestamp = time.mktime(today_0.timetuple()) - 86400
    last7_0_timestamp = time.mktime(today_0.timetuple()) - 86400*6
    last30_0_timestamp = time.mktime(today_0.timetuple()) - 86400*29
    
    # 查询平台所有消费信息(添加广告记录)
    sql={"key":100401,"real_total_price":{"$exists":True},"real_total_price":{"$gt":0}}
    cursor = findMongodb(sql,"customer_data")
    total = 0
    if cursor and cursor != "Mongodb Collect Fail":
        total = cursor.count()
    today_cost,yesterday_cost,last7_cost,last30_cost,all_cost = 0,0,0,0,0
    if total !=0:
        for item in cursor:
            if item["confirm_guanggao_success_time"] < last30_0_timestamp:
                all_cost += item["real_total_price"]
            if last30_0_timestamp <= item["confirm_guanggao_success_time"] < last7_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
            if last7_0_timestamp <= item["confirm_guanggao_success_time"] < yesterday_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
            if yesterday_0_timestamp <= item["confirm_guanggao_success_time"] < today_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
                yesterday_cost += item["real_total_price"]
            if item["confirm_guanggao_success_time"] >= today_0_timestamp:
                all_cost += item["real_total_price"]
                last30_cost += item["real_total_price"]
                last7_cost += item["real_total_price"]
                today_cost += item["real_total_price"]
    # 写入用户消费信息
    update_consume_info = {"$set":{
        "money_brief.today_cost":today_cost,
        "money_brief.yesterday_cost":yesterday_cost,
        "money_brief.last7_cost":last7_cost,
        "money_brief.last30_cost":last30_cost,
        "money_brief.all_cost":all_cost,
    }}
    try:
        updateMongodb({}, update_consume_info,"oz_data")   
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "更新账户余额及消费信息时出错！"}

# 获取平台基本数据(客户数量+客户充值+客户消费)
def getPlatformBrief(db,params):
    # print("开始获取平台基本数据：=======all")
    updatePlatformConsumeInfo()
    platform_brief = [0,0,0,0,0,0,0,0,0]
    data = findOneMongodb({"key":300101},"oz_data",db)
    if data and data !="Mongodb Collect Fail":
        platform_brief[0] = data["base"]["total_customer_count"]
        platform_brief[1] = data["money_brief"].get("total_money",0)
        platform_brief[2] = "charge" in data and data["charge"]["wait_pay_money"] or 0
        platform_brief[3] = data["money_brief"].get("curr_total_money",0)
        platform_brief[4] = data["money_brief"].get("today_cost",0)
        platform_brief[5] = data["money_brief"].get("yesterday_cost",0)
        platform_brief[6] = data["money_brief"].get("last7_cost",0)
        platform_brief[7] = data["money_brief"].get("last30_cost",0)
        platform_brief[8] = data["money_brief"].get("all_cost",0)

    return {"success": True,"data":{"result":True,"ret_data":platform_brief}}


# 获取用户概况(基本信息+充值情况+消费信息)
def getCustomerBrief(db,page):
    # print("==>获取用户概况[all用户]")
    pagination = 10
    page = int(page)
    ret_data = []

    total = 0
    cursor = findMongodb({"user_type":"customer"},"user",db)
    #print("用户概况cursor==>",cursor)
    if cursor and cursor != "Mongodb Collect Fail":
        total = cursor.count()
    if total != 0:
        total = math.ceil(float(total)/pagination)
        cursor.skip((page-1)*pagination).limit(pagination)
        for item in cursor:
            customerBriefItem = []
            customerChargeBrief = [0,0,0]
            customerGuanggaoBrief = [0,0,0,0,0,0]

            open_account_time = toFormatTime(item["register_time"])
            customerBriefItem = [item["username"],open_account_time,item["display_name"],item["contact_name"]]

            if "charge" in item:
                customerChargeBrief[0] += item["charge"].get("success_charge_money",0)
                customerChargeBrief[1] += item["charge"].get("wait_pay_money",0)
                customerChargeBrief[2] += item["charge"].get("curr_total_money",0)
            customerBriefItem.extend(customerChargeBrief)

            if "guanggao" in item:
                customerGuanggaoBrief[0] += item["guanggao"].get("going_count",0)
                customerGuanggaoBrief[1] += item["guanggao"].get("wait_check_count",0)
                customerGuanggaoBrief[2] += item["guanggao"].get("pause_count",0)
                customerGuanggaoBrief[3] += item["guanggao"].get("complete_count",0)
                customerGuanggaoBrief[4] += item["guanggao"].get("all_count",0)
                customerGuanggaoBrief[5] += item["guanggao"].get("total_cost",0)
            customerBriefItem.extend(customerGuanggaoBrief)
            ret_data.append(customerBriefItem)
        return {"success": True,"data":{"total":total,"ret_data":ret_data}}
    return {"success": True,"data":{"total":total,"ret_data":ret_data}}

# 获取平台充值概况(客户充值)
def getPlatformChargeBrief(db,params):
    # print("开始获取平台充值概况：=======all")
    # updatePlatformConsumeInfo()
    charge_brief = [0,0,0,0,0,0,0,0,0,0]
    data = findOneMongodb({"key":300101,"charge":{"$exists":True}},"oz_data",db)
    if data and data !="Mongodb Collect Fail":
        charge_brief[0] = data["charge"].get("wait_pay_count",0)
        charge_brief[1] = data["charge"].get("charge_success_count",0)
        charge_brief[2] = data["charge"].get("charge_fail_count",0)
        charge_brief[3] = data["charge"].get("cancel_charge_count",0)
        # charge_brief[4] = data["charge"].get("del_charge_count",0)
        charge_brief[4] = data["charge"].get("total_submit_charge_count",0)

        charge_brief[5] = data["charge"].get("wait_pay_money",0)
        charge_brief[6] = data["charge"].get("cancel_charge_money",0)
        charge_brief[7] = data["charge"].get("charge_success_money",0)

        charge_brief[8] = 0 
        if "money_brief" in data:
            charge_brief[8] = data["money_brief"].get("curr_total_money",0)

    return {"success": True,"data":{"result":True,"ret_data":charge_brief}}


# 获取全平台用户充值详情
def getCustomerChargeInfo(db,params):
    # print("==>开始获取全平台用户充值详情:",params)
    pagination = 10
    page = int(params[0])
    # chargeStatus = {"wait_pay":"待审核","cancel":"客户取消","fail":"充值失败","success":"充值成功","customer_del":"客户删除","all":"所有"}
    ret_data = []
    sql={"key":100301}

    if params[1] != "all":
        sql["charge_status"] = str(params[1])
        # if charge_type == "no_show":
        #     sql["is_client_show"] = str(charge_type)
        # else:   
        #     sql["charge_status"] = str(charge_type)

    # cursor = findMongodb(sql,"customer_data").sort("charge_time",-1)
    cursor = findMongodb(sql,"customer_data",db)
    #print("===========",cursor)
    total = 0
    if cursor and cursor != "Mongodb Collect Fail":
        cursor.sort("charge_time",-1)
        total = cursor.count()
    # print("=>充值总条数:",total)
    if total != 0:
        total = math.ceil(float(total)/pagination)
        cursor.skip((page-1)*pagination).limit(pagination)
        for item in cursor:
            ret_data.append([
                toFormatTime(item["charge_time"]),
                item["username"],
                item["pay_name"],
                item["need_invoice"],
                item["charge_bianhao"],
                item["charge_status"],
                # item["is_client_show"],
                item["charge_amount"],
                item["pay_amount"],
                item["pay_number"]
            ])
        return {"success": True,"data":{"total":total,"ret_data":ret_data}}
    return {"success": True,"data":{"total":total,"charge_status":params[1]}}



# 确认客户充值到账
def confirmCustomerCharge(db,params):
    # print("==>开始确认客户充值到账:",params)
    sql = {"username":params[0],"charge_bianhao":params[1]}
 
    confirmInfo = {}
    data = findOneMongodb(sql,"customer_data",db)
    # print("=>充值记录如下:\n",data)
    if not data or data == "Mongodb Collect Fail":
        return {"success": False, "message": "没有编号为"+params[1]+"的充值记录！"}
    if data["charge_status"] == "success":
        return {"success": False, "message": "该笔充值已经确认成功，请取消后刷新页面！"}
    if data["charge_status"] == "fail":
        return {"success": False, "message": "该笔充值已经失败，请取消后刷新页面！"}
    if data["charge_status"] == "cancel":
        return {"success": False, "message": "客户已经取消该笔充值，请取消后刷新页面！"}


    confirmInfo["username"] = params[0]
    confirmInfo["confirm_charge_bianhao"] = params[1]
    confirmInfo["confirm_pay_number"] = params[2]
    confirmInfo["key"] = 200301
    confirmInfo["confirm_amount"] = data["charge_amount"]
    confirmInfo["confirm_time"] = int(time.time())
    confirmInfo["confirm_ip"] = bottle.request.remote_addr
    try:
        # 修改充值记录
        update_charge_record = {"$set":{
            "charge_status":"success",
            "pay_amount":confirmInfo["confirm_amount"],
            "pay_number":confirmInfo["confirm_pay_number"],
            "confirm_charge_success_time":confirmInfo["confirm_time"],
            "confirm_charge_success_ip":confirmInfo["confirm_ip"],
        }}
        updateMongodb(sql, update_charge_record,"customer_data",db)
        # 修改用户充值信息
        update_charge_count_money = {"$inc":{
        "charge.wait_pay_count":-1,
        "charge.wait_pay_money":-confirmInfo["confirm_amount"],
        "charge.charge_success_count":1,
        "charge.charge_success_money":confirmInfo["confirm_amount"],
        "money_brief.total_money":confirmInfo["confirm_amount"],
        "money_brief.curr_total_money":confirmInfo["confirm_amount"],
        "money_brief.temp_total_money":confirmInfo["confirm_amount"],
        }}
        update_charge_time_ip = {"$set":{
        "charge.last_confirm_charge_success_time":confirmInfo["confirm_time"],
        "charge.last_confirm_charge_success_ip":confirmInfo["confirm_ip"]
        }}
        updateMongodb({"username": confirmInfo["username"]}, update_charge_count_money,"user",db)
        updateMongodb({"username": confirmInfo["username"]}, update_charge_time_ip,"user",db)
        # 修改平台充值数据
        updateMongodb({}, update_charge_count_money,"oz_data",db)
        updateMongodb({}, update_charge_time_ip,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(confirmInfo, "provider_data",db)
        # print("=>确认客户充值到账OK")
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "Sorry, there is some error ! [=confirmCustomerCharge=]"}

# 确认客户充值失败
def failCustomerCharge(db,params):
    # print("==>开始确认客户充值失败:",params)
    sql = {"username":params[0],"charge_bianhao":params[1]}
 
    data = findOneMongodb(sql,"customer_data",db)
    # print("=>充值记录如下:\n",data)
    if not data or data == "Mongodb Collect Fail":
        return {"success": False, "message": "没有编号为"+params[1]+"的充值记录！"}
    if data["charge_status"] == "success":
        return {"success": False, "message": "该笔充值已经确认成功！请刷新页面！"}
    if data["charge_status"] == "fail":
        return {"success": False, "message": "该笔充值已经失败！请刷新页面"}
    if data["charge_status"] == "cancel":
        return {"success": False, "message": "客户已经取消该笔充值！请刷新页面"}

    failInfo = {}
    failInfo["username"] = params[0]
    failInfo["confirm_charge_bianhao"] = params[1]
    failInfo["key"] = 200302
    failInfo["fail_amount"] = data["charge_amount"]
    failInfo["fail_time"] = int(time.time())
    failInfo["fail_ip"] = bottle.request.remote_addr
    try:
        # 修改充值记录
        modification0 = {"$set":{
            "charge_status":"fail",
            "confirm_charge_fail_time":failInfo["fail_time"],
            "confirm_charge_fail_ip":failInfo["fail_ip"],
        }}
        updateMongodb(sql, modification0,"customer_data",db)
        # 修改用户充值信息
        update_charge_count_money = {"$inc":{
        "charge.wait_pay_count":-1,
        "charge.wait_pay_money":-failInfo["fail_amount"],
        "charge.charge_fail_count":1,
        "charge.charge_fail_money":failInfo["fail_amount"],
        }}
        update_charge_time_ip = {"$set":{
        "charge.last_confirm_charge_fail_time":failInfo["fail_time"],
        "charge.last_confirm_charge_fail_ip":failInfo["fail_ip"]
        }}
        updateMongodb({"username": failInfo["username"]}, update_charge_count_money,"user",db)
        updateMongodb({"username": failInfo["username"]}, update_charge_time_ip,"user",db)

        # 修改平台充值数据
        updateMongodb({}, update_charge_count_money,"oz_data",db)
        updateMongodb({}, update_charge_time_ip,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(failInfo, "provider_data",db)
        # print("=>确认客户充值失败OK")
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "服务器访问超时,请联系您的服务商！"}

# 获取平台广告概况
def getPlatformGuanggaoBrief(db,params):
    # print("==>开始获取平台广告概况：[all]")
    # updatePlatformConsumeInfo()
    guanggao_brief = [0,0,0,0,0,0,0,0,0,0]
    data = findOneMongodb({"key":300101,"guanggao":{"$exists":True}},"oz_data",db)
    if data and data !="Mongodb Collect Fail":
        guanggao_brief[0] = data["guanggao"].get("wait_check_count",0)
        guanggao_brief[1] = data["guanggao"].get("check_fail_count",0)
        guanggao_brief[2] = data["guanggao"].get("going_count",0)
        guanggao_brief[3] = data["guanggao"].get("pause_count",0)
        guanggao_brief[4] = data["guanggao"].get("complete_count",0)
        guanggao_brief[5] = data["guanggao"].get("cancel_count",0)
        guanggao_brief[6] = data["guanggao"].get("all_count",0)

        guanggao_brief[7] = data["guanggao"].get("wait_check_money",0)
        guanggao_brief[8] = data["guanggao"].get("total_pay_money",0)
        guanggao_brief[9] = data["guanggao"].get("complete_money",0)
    return {"success": True,"data":{"result":True,"ret_data":guanggao_brief}}



# 获取全平台用户广告详情
def getCustomerGuanggaoInfo(db,params):
    # print("==>开始获取全平台用户广告详情:",params)
    pagination = 10
    page = int(params[0])

    # guanggao_status = {"cancel":"客户取消","wait_check":"待审核","check_fail":"审核失败","going":"投放中","pause":"暂停","complete":"完成","all":"所有"}
    ret_data = []
    sql={"key":100401}
    if params[1] != "all":    
        sql["guanggao_status"] = str(params[1])
    # cursor = findMongodb(sql,"customer_data").sort("guanggao_time",-1)
    total = 0
    cursor = findMongodb(sql,"customer_data",db)
    if cursor and cursor != "Mongodb Collect Fail":
        cursor.sort("guanggao_time",-1)
        total = cursor.count()
    if total != 0:
        total = math.ceil(float(total)/pagination)
        cursor.skip((page-1)*pagination).limit(pagination)
        for item in cursor:
            ret_data.append([
                toFormatTime(item["guanggao_time"]),
                item["username"],
                item["guanggao_bianhao"],
                item["guanggao_status"],
                item["platform_type"],
                toFormatTime(item["start_time"]),
                toFormatTime(item["end_time"]),
                item["plan_num"],
                item["complete_num"],
                item["plan_total_price"],
                item["real_total_price"]
            ])
        return {"success": True,"data":{"total":total,"ret_data":ret_data}}
    return {"success": True,"data":{"total":total,"guanggao_status":params[1]}}

# 广告审核通过
def confirmCustomerGuanggao(db,params):
    # print("==>开始审核广告通过:",params)
    sql = {}
    sql["username"] = params[0]
    sql["key"] = 100401
    sql["guanggao_bianhao"] = params[1]

    guanggao_data = findOneMongodb(sql,"customer_data",db)
    if not guanggao_data or guanggao_data == "Mongodb Collect Fail":
        return {"success": False, "message": "没有编号为"+params[1]+"的广告记录！"}
    if guanggao_data["guanggao_status"] == "cancel":
        return {"success": False, "message": "客户已经已经删除该笔广告！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "going":
        return {"success": False, "message": "该笔广告正投放中！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "check_fail":
        return {"success": False, "message": "该笔广告审核失败！请刷新页面"}
    if guanggao_data["guanggao_status"] == "pause":
        return {"success": False, "message": "该笔广告目前暂停中！请刷新页面"}
    if guanggao_data["guanggao_status"] == "complete":
        return {"success": False, "message": "该笔广告目前已完成！请刷新页面"}

    confirmInfo = {}
    confirmInfo["username"] = params[0]
    confirmInfo["key"] = 200401

    confirmInfo["confirm_plan_num"] = guanggao_data["plan_num"]
    confirmInfo["guanggao_single_price"] = guanggao_data["single_price"]
    confirmInfo["confirm_plan_total_price"] = guanggao_data["plan_total_price"]
    confirmInfo["guanggao_title"] = guanggao_data["app_title"]
    confirmInfo["guanggao_status"] = guanggao_data["guanggao_status"]
    confirmInfo["confirm_time"] = int(time.time())
    confirmInfo["confirm_ip"] = bottle.request.remote_addr
    try:
        # 修改添加广告记录
        update_guanggao_record = {"$set":{
            "guanggao_status":"going",
            "real_total_price":confirmInfo["confirm_plan_total_price"],
            "confirm_guanggao_success_time":confirmInfo["confirm_time"],
            "confirm_guanggao_success_ip":confirmInfo["confirm_ip"],
        }}
        updateMongodb(sql, update_guanggao_record,"customer_data",db)
        # 修改用户广告信息(笔数、份数、金额)
        update_guanggao_count_num_money = {"$inc":{
        "guanggao.wait_check_count":-1,
        "guanggao.wait_check_num":-confirmInfo["confirm_plan_num"],
        "guanggao.wait_check_money":-confirmInfo["confirm_plan_total_price"],

        "guanggao.going_count":1,
        "guanggao.going_num":confirmInfo["confirm_plan_num"],
        "guanggao.going_money":confirmInfo["confirm_plan_total_price"],

        "guanggao.total_pay_num":confirmInfo["confirm_plan_num"],
        "guanggao.total_pay_money":confirmInfo["confirm_plan_total_price"],

        "money_brief.curr_total_money":-confirmInfo["confirm_plan_total_price"],
        }}
        update_guanggao_time_ip = {"$set":{
        "guanggao.last_confirm_guanggao_success_time":confirmInfo["confirm_time"],
        "guanggao.last_confirm_guangao_success_ip":confirmInfo["confirm_ip"]
        }}
        updateMongodb({"username": confirmInfo["username"]}, update_guanggao_count_num_money,"user",db)
        updateMongodb({"username": confirmInfo["username"]}, update_guanggao_time_ip,"user",db)
        # 修改平台广告数据
        updateMongodb({}, update_guanggao_count_num_money,"oz_data",db)
        updateMongodb({}, update_guanggao_time_ip,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(confirmInfo, "provider_data",db)
        # 更新用户消费信息(概要)
        updateUserAccountReport(params[0])
        # print("=>审核广告通过OK")
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "Sorry, there is some error ! [=confirmCustomerGuanggao=]"}


# 广告审核失败
def failCustomerrGuanggao(db,params):
    # print("==>开始审核失败广告:",params)
    sql = {}
    sql["username"] = params[0]
    sql["key"] = 100401
    sql["guanggao_bianhao"] = params[1]

    guanggao_data = findOneMongodb(sql,"customer_data",db)
    if not guanggao_data or guanggao_data == "Mongodb Collect Fail":
        # print("=>没有编号为"+params[1]+"的广告记录！")
        return {"success": False, "message": "没有编号为"+params[1]+"的广告记录！"}
    if guanggao_data["guanggao_status"] == "cancel":
        return {"success": False, "message": "客户已经已经删除该笔广告！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "going":
        return {"success": False, "message": "该笔广告正投放中！请刷新页面！"}
    if guanggao_data["guanggao_status"] == "check_fail":
        return {"success": False, "message": "该笔广告已经审核失败！请刷新页面"}
    if guanggao_data["guanggao_status"] == "pause":
        return {"success": False, "message": "该笔广告目前暂停中！请刷新页面"}
    if guanggao_data["guanggao_status"] == "complete":
        return {"success": False, "message": "该笔广告目前已完成！请刷新页面"}

    confirmInfo = {}
    confirmInfo["username"] = params[0]
    confirmInfo["key"] = 200402

    confirmInfo["confirm_plan_num"] = guanggao_data["plan_num"]
    confirmInfo["guanggao_single_price"] = guanggao_data["single_price"]
    confirmInfo["confirm_plan_total_price"] = guanggao_data["plan_total_price"]
    confirmInfo["guanggao_title"] = guanggao_data["app_title"]
    confirmInfo["guanggao_status"] = guanggao_data["guanggao_status"]
    confirmInfo["confirm_time"] = int(time.time())
    confirmInfo["confirm_ip"] = bottle.request.remote_addr
    try:
        # 修改广告记录
        update_guanggao_record = {"$set":{
            "guanggao_status":"check_fail",
            "confirm_guanggao_fail_time":confirmInfo["confirm_time"],
            "confirm_guanggao_fail_ip":confirmInfo["confirm_ip"] ,
        }}
        updateMongodb(sql, update_guanggao_record,"customer_data",db)
        # 修改用户广告信息(笔数、份数、金额)
        update_guanggao_count_num_money = {"$inc":{
        "guanggao.wait_check_count":-1,
        "guanggao.wait_check_num":-confirmInfo["confirm_plan_num"],
        "guanggao.wait_check_money":-confirmInfo["confirm_plan_total_price"],

        "guanggao.check_fail_count":1,
        "guanggao.check_fail_num":confirmInfo["confirm_plan_num"],
        "guanggao.check_fail_money":confirmInfo["confirm_plan_total_price"],

        "money_brief.temp_total_money":confirmInfo["confirm_plan_total_price"],
        }}
        update_guanggao_time_ip = {"$set":{
        "guanggao.last_confirm_guanggao_success_time":confirmInfo["confirm_time"],
        "guanggao.last_confirm_guangao_success_ip":confirmInfo["confirm_ip"]
        }}
        updateMongodb({"username": confirmInfo["username"]}, update_guanggao_count_num_money,"user",db)
        updateMongodb({"username": confirmInfo["username"]}, update_guanggao_time_ip,"user",db)
        # 修改平台广告数据
        updateMongodb({}, update_guanggao_count_num_money,"oz_data",db)
        updateMongodb({}, update_guanggao_time_ip,"oz_data",db)
        # 向数据库写入本次操作详细
        insertOneMongodb(confirmInfo, "provider_data",db)
        # 更新用户消费信息(概要)
        updateUserAccountReport(params[0])
        return {"success": True,"data":{"result":True}}
    except Exception as e:
        traceback.print_exc()
    return {"success": False, "message": "审核通过广告==失败1145！"}


# 获取已发布任务列表
def getPlublishTaskBreif(db,page):
    # print("==>开始获取已发布任务列表(当前page):",page)
    pagination = 10
    page = int(page)

    needFieldName = ["title","appid","deviceplatformtype","starttimestamp","endtimestamp","displaystarttimestamp",
    "putinamount","putoutamount","paymoney","reward"]
    ret_data = []
    plublishTaskInfo = {}
    dataCursor = findMongodb({},"task_template_coll",db)
    total = 0
    if dataCursor != "Mongodb Collect Fail":
        total = dataCursor.count()
    if total != 0:
        total = math.ceil(float(total)/pagination)
        dataCursor.skip((page-1)*pagination).limit(pagination)
        for item in dataCursor:
            resultItem = {}
            for fieldName in needFieldName:
                if fieldName in ["starttimestamp","endtimestamp","displaystarttimestamp","displayendtimestamp"]:
                    tmpValue = toFormatTime(item[fieldName])
                else:
                    tmpValue = item[fieldName]
                resultItem[fieldName] = tmpValue
            ret_data.append(resultItem)
        return {"success": True,"data":{"total":total,"ret_data":ret_data,"fieldName":needFieldName}}
    return {"success": True,"data":{"total":total,"ret_data":ret_data,"fieldName":needFieldName}}


# 获取任务详情(所有字段)
def getTaskDetail(db,taskid):
    # print("==>开始读取任务详情(任务id号):",taskid)
    # with open('json/taskcfg.json', 'rb') as json_data:
    #     taskData = json.loads(json_data.read().decode('utf-8'))
    # taskDataFieldArr = []
    # for key in taskData:
    #     taskDataFieldArr.append(key)
    #print("==json读取的字段名==：",taskDataFieldArr)
    needFieldName = [ 
        "id",
        "type",
        "subtype",
        "sortid",
        "demandtype",
        "demandparam",
        "dormant",
        "starttimestamp",
        "endtimestamp",
        "activity",
        "displaystarttimestamp",
        "displayendtimestamp",
        "display",
        "putinamount",
        "putoutamount",
        "icon",
        "title",
        "desc",
        "reward",
        "itunesaddr",
        "jumplink",
        "searchkeyword",
        "isfreeapp",
        "appsize",
        "bundleid",
        "prjectname",
        "appid",
        "deadlinetimelong",
        "subtaskidlist",
        "deviceplatformtype",
        "checkinstalledurl",
        "startextensionnotifyurl",
        "paymoney"]
    needChangeTimeData = ["starttimestamp","endtimestamp","displaystarttimestamp","displayendtimestamp"]
    ret_data = []
    data = findOneMongodb({"appid":int(taskid)},"task_template_coll",db)
    if data and data != "Mongodb Collect Fail":
        for fieldName in needFieldName:
            resultItem = {}
            if fieldName in needChangeTimeData:
                tmpValue = toFormatTime(data[fieldName])
            else:
                tmpValue = data[fieldName]
            resultItem[fieldName] = tmpValue
            ret_data.append(resultItem)
        return {"success": True,"data":{"result":True,"ret_data":ret_data,"fieldName":needFieldName}}
    return {"success": True,"data":{"result":False,"message":"未找到appid为"+taskid+"的任务详情"}}

# 获取任务详情（可修改字段）
def getCanModifyTaskDetail(db,taskid):
    # print("==读取要修改的任务详情(appid)：",taskid)
    # with open('json/taskcfg.json', 'rb') as json_data:
    #     taskData = json.loads(json_data.read().decode('utf-8'))
    # taskDataFieldArr = []
    # for key in taskData:
    #     taskDataFieldArr.append(key)
    #print("==json读取的字段名==：",taskDataFieldArr)
    needFieldName = [ 
        "id",
        "type",
        "subtype",
        "sortid",
        "demandtype",
        "demandparam",
        "starttimestamp",
        "endtimestamp",
        "displaystarttimestamp",
        "displayendtimestamp",
        "putinamount",
        "putoutamount",
        "icon",
        "title",
        "desc",
        "reward",
        "itunesaddr",
        "jumplink",
        "searchkeyword",
        "isfreeapp",
        "appsize",
        "bundleid",
        "prjectname",
        "appid",
        "deadlinetimelong",
        "subtaskidlist",
        "deviceplatformtype",
        "checkinstalledurl",
        "startextensionnotifyurl",
        "paymoney"]
    needChangeTimeData = ["starttimestamp","endtimestamp","displaystarttimestamp","displayendtimestamp"]
    ret_data = []
    data = findOneMongodb({"appid":int(taskid)},"task_template_coll",db)
    if data and data != "Mongodb Collect Fail":
        for fieldName in needFieldName:
            resultItem = {}
            if fieldName in needChangeTimeData:
                tmpValue = toFormatTime(data[fieldName])
            else:
                tmpValue = data[fieldName]
            resultItem[fieldName] = tmpValue
            ret_data.append(resultItem)
        return {"success": True,"data":{"result":True,"ret_data":ret_data,"fieldName":needFieldName}}
    return {"success": True,"data":{"result":False,"message":"未找到appid为"+taskid+"的任务详情"}}

# 验证任务数据
def handleTaskData(data):

    with open('json/taskcfg.json', 'rb') as json_data:
        jsonData = json.loads(json_data.read().decode('utf-8'))
    jsonFieldlist = []
    for keyItem in jsonData:
        jsonFieldlist.append(keyItem)

    taskData = data
    needBoolField = ["dormant","activity","display","isfreeapp"]
    needTimeField = ["starttimestamp","endtimestamp","displaystarttimestamp","displayendtimestamp"]
    needNumField = ["type","subtype","sortid","demandtype","putinamount","putoutamount","reward","appid","deadlinetimelong","paymoney"]
    needArrField = ["subtaskidlist"]
    # needArrToInt = ["deviceplatformtype"]
    needArrToInt = {"deviceplatformtype":"投放平台"}

    for key in taskData:
        if key not in jsonFieldlist:
            return {"result":False,"message":"存在非法字段:"+key}
        if key in needBoolField:
            if taskData[key] == "true":
                taskData[key] = True
            elif taskData[key] == "false":
                taskData[key] = False
            else:
                return {"result":False,"message":key+"字段值错误！"}
        if key in needNumField:
            taskData[key] = int(taskData[key])
        if key in needArrField:
            if not isinstance(taskData[key],list):
                return {"result":False,"message":key+"字段值错误！,应该为数组！"}
            taskData[key] = [ int(arrEel) for arrEel in taskData[key]]
        if key in needArrToInt:
            # print("=>",key,"字段值:",taskData[key])
            if not isinstance(taskData[key],list):
                return {"result":False,"message":key+"字段值错误！,应该为数组！"}
            if len(taskData[key]) ==0:
                return {"result":False,"message":needArrToInt[key]+"应该至少选择一种！"}
            taskData[key] = [ int(arrEel) for arrEel in taskData[key]]   
            taskData[key] = sum(taskData[key])
    return  {"result":True,"data":taskData}

# 修改任务
def modifyTaskDetail(db,params):
    appID = int(params[1])
    data = handleTaskData(params[2])
    # print("==>开始修改任务,操作账户:",params[0],",任务id号",params[1])
    # print("=>任务data(处理前):",params[2])
    if data["result"]:
        newTaskData = data["data"]
        # print("=>任务data(处理后):\n",newTaskData)
        # 修改任务
        update_task = {"$set":newTaskData}
        updateMongodb({"appid":appID}, update_task,"task_template_coll",db)
        # print("=>修改任务OK")
        return {"success": True,"data":{"result":True}}
    return {"success": True,"data":{"result":False,"message":data["message"]}}


# 检测id,bundleid,appid是否可用
def isNoRepeatFieldOK(db,params):
    key,value = params[0],params[1]
    if not isinstance(value,(str,int)):
        return {"success": True,"data":{"result":False,"message":key+"字段值类型错误!!"}}
    if key == "appid":
        value = int(value)
    data = findOneMongodb({key:value},"task_template_coll",db)
    if data and data !="Mongodb Collect Fail":
        # print("==数据库已经存在"+key+"为",value,"的记录.")
        return {"success":True,"data":{"result":False,"message":"ERROR"+key+"值重复!!"}}
    return {"success":True,"data":{"result":True}}

# 新增任务
def addTask(db,params):
    # print("==开始新增任务,操作账户:",params[0])
    # print("==任务data详情(处理前):",params[1])
    needCheckFieldData = {}

    needCheckFieldData["id"] = params[1].get("id")
    needCheckFieldData["bundleid"] = params[1].get("bundleid")
    needCheckFieldData["appid"] = params[1].get("appid")

    for key in needCheckFieldData:
        if not needCheckFieldData[key]:
            return {"success": True,"data":{"result":False,"message":"提交内容中无"+key+"信息！"}}
        # print("==拟增加任务"+key+":",needCheckFieldData[key])
        fieldCheckRes =  isNoRepeatFieldOK(db,[key,needCheckFieldData[key]])["data"]
        if fieldCheckRes["result"]:
            pass
            # print("=="+key+":",needCheckFieldData[key],",检测结果:可用")
        else:
            return {"success":True,"data":{"result":False,"message":"ERROR"+key+"值重复!!"}}
    
    data = handleTaskData(params[1])
    if data["result"]:
        newTaskData = data["data"]
        # print("==任务data详情(处理后)：")
        # print(newTaskData)
        # 新增任务
        insertOneMongodb(newTaskData, "task_template_coll",db)
        # print("新增任务OK")
        return {"success": True,"data":{"result":True}}
    return {"success": True,"data":{"result":False,"message":data["message"]}}

# 删除任务
def delTask(db,params):
    appid = int(params[1])
    #print("==开始删除任务,操作账户:",params[0],",appid:",params[1],",验证码:",params[2])
    # print("==开始删除任务,操作账户:",params[0],",appid:",params[1])
    appidCheckRes =  isNoRepeatFieldOK(db,["appid",appid])["data"]
    if not appidCheckRes["result"]:
        # print("==成功查询到appid为",appid,"对应的记录")
        removeMongodb({"appid":appid},"task_template_coll",db)
        # print("删除任务OK")
        return {"success": True,"data":{"result":True}}
    return {"success": True,"data":{"result":False,"message":"没有查询到appid为"+appid+"的记录"}}
        
    
# 数据库操作命令
db_operator = {
"checkDbUsername":checkDbUsername,"isPasswordMatch":isPasswordMatch,"checkDbDisplayName":checkDbDisplayName,"checkOldPwd":checkOldPwd,
"userRegister":userRegister,"getUserInfo":getUserInfo,"modifyUserBaseInfo":modifyUserBaseInfo,"modifyUserPwd":modifyUserPwd,
"userCharge":userCharge,"cancelCharge":cancelCharge,"delCharge":delCharge,"getUserChargeInfo":getUserChargeInfo,
"getAccountReport":getAccountReport,"getCurrTempMoney":getCurrTempMoney,
"userAddGuanggao":userAddGuanggao,"cancelGuanggao":cancelGuanggao,
"getUserGuanggaoBreif":getUserGuanggaoBreif,"getUserGuanggaoInfo":getUserGuanggaoInfo,


"getPlatformBrief":getPlatformBrief,"getCustomerBrief":getCustomerBrief,
"getPlatformChargeBrief":getPlatformChargeBrief,"getCustomerChargeInfo":getCustomerChargeInfo,
"confirmCustomerCharge":confirmCustomerCharge,"failCustomerCharge":failCustomerCharge,
"getPlatformGuanggaoBrief":getPlatformGuanggaoBrief,"getCustomerGuanggaoInfo":getCustomerGuanggaoInfo,
"confirmCustomerGuanggao":confirmCustomerGuanggao,"failCustomerrGuanggao":failCustomerrGuanggao,

"getPlublishTaskBreif":getPlublishTaskBreif,"getTaskDetail":getTaskDetail,"getCanModifyTaskDetail":getCanModifyTaskDetail,
"modifyTaskDetail":modifyTaskDetail,"isNoRepeatFieldOK":isNoRepeatFieldOK,"addTask":addTask,"delTask":delTask,
}

# 处理数据库操作命令
def handle(db, cmd, params):
    if cmd in db_operator:
        return db_operator[cmd](db,params)
    return {"success":False, "message":"不支持此数据库操作命令"}


setting_operator = {
    }

def setting_handle(cmd,params):
    if cmd in setting_operator:
        return setting_operator[cmd](*params)
    return {"success":False, "message":"不支持此日志查询命令"}