import pymysql
import base64
import zlib
import json
import bottle
import math
import traceback

import install

import re
import pymongo

import time
import datetime


# 数据库能否连接
def can_connect(db):
    try:
        conn = pymongo.MongoClient(db["host"], db["port"])
        db_list = conn.database_names()
        # print("数据库列表:",db_list)
        if db["source_name"] in db_list:
            conn_db = conn[db["source_name"]]
            return True
            conn.close()
        else:
            print("未找到数据库名为:", db["source_name"], "的数据库，请检查数据库名称是否正确！")
            return False
    except Exception as e:
        traceback.print_exc()
    return False


# 转义字符串
def escape(str):
    return pymysql.converters.escape_str(str)


# 查询 [find_one]
def find_one_mongodb(sql={}, col_name="user", db=None):
    if not db:
        config = install.get_config()
        db = {}
        db["host"] = config["db_host"]
        db["port"] = "port" in config and config["db_port"] or 27017
        db["source_name"] = install.install_db
    try:
        conn = pymongo.MongoClient(db["host"], db["port"])
        db_list = conn.database_names()
        if db["source_name"] in db_list:
            conn_db = conn[db["source_name"]]
        else:
            print("未找到数据库名为:", db["source_name"], "的数据库，请检查数据库名称是否正确！")
            exit(0)
        col_list = conn_db.collection_names()
        # print(conn.server_info(),db_list,col_list)
        if col_name in col_list:
            conn_col =conn_db[col_name]
        else:
            print("未找到集合名为:", col_name, "的集合，请检查集合名称是否正确！")
            exit(0)
        data = conn_col.find_one(sql)
        return data
        conn.close()
    except Exception as e:
        traceback.print_exc()
    return[]


# 查询[find]
def find_mongodb(sql={}, col_name="user", db=None):
    if not db:
        config = install.get_config()
        db = {}
        db["host"] = config["db_host"]
        db["port"] = "port" in config and config["db_port"] or 27017
        db["source_name"] = install.install_db
    try:
        conn = pymongo.MongoClient(db["host"],db["port"])
        db_list = conn.database_names()
        if db["source_name"] in db_list:
            conn_db = conn[db["source_name"]]
        else:
            print("未找到数据库名为:", db["source_name"], "的数据库，请检查数据库名称是否正确！")
            exit(0)
        col_list = conn_db.collection_names()
        # print("数据表：", col_list)
        if col_name in col_list:
            conn_col =conn_db[col_name]
        else:
            print("未找到集合名为:", col_name, "的集合，请检查集合名称是否正确！")
            exit(0)
        data = conn_col.find(sql)
        return data
        conn.close()
    except Exception as e:
        traceback.print_exc()
    return[]


# 执行修改
def update_mongodb(condition={}, modification={}, col_name="user", db=None ):
    if not db:
        config = install.get_config()
        db = {}
        db["username"] = config["dbuser"]
        db["password"] = config["dbpass"]
        db["host"] = config["db_host"]
        db["port"] = "port" in config and config["db_port"] or 27017     
        db["source_name"] = install.install_db
    try:
        conn = pymongo.MongoClient(db["host"],db["port"])
        db_list = conn.database_names()
        if db["source_name"] in db_list:
            conn_db = conn[db["source_name"]]
        else:
            print("未找到数据库名为:",db["source_name"],"的数据库，请检查数据库名称是否正确！")
            exit(0)
        col_list = conn_db.collection_names()
        if col_name in col_list:
            conn_col =conn_db[col_name]
        else:
            print("未找到集合名为:",col_name,"的集合，请检查集合名称是否正确！")
            exit(0)

        conn_col.update(condition,modification)
        conn.close()
        return True
    except Exception as e:
        traceback.print_exc()
    return False


# 执行插入
def insert_one_mongodb(sql, col_name="user", db=None):
    if not db:
        config = install.get_config()
        db = {}
        db["host"] = config["db_host"]
        db["port"] = "port" in config and config["db_port"] or 27017
        db["source_name"] = install.install_db
    try:
        conn = pymongo.MongoClient(db["host"], db["port"])
        db_list = conn.database_names()
        conn_db = conn[db["source_name"]]
        col_list = conn_db.collection_names()
        conn_col =conn_db[col_name]
        if type(sql) is not dict:
            print("error，插入的内容不是字典格式！")
            exit(0)
        conn_col.insert_one(sql)
        conn.close()
        return True
    except Exception as e:
        traceback.print_exc()
    return False
# 删除记录
def remove_mongodb(sql,col_name = "user",db=None ):
    if not db:
        config = install.get_config()
        db = {}
        db["host"] = config["db_host"]
        db["port"] = "port" in config and config["db_port"] or 27017
        db["source_name"] = install.install_db
    try:
        conn = pymongo.MongoClient(db["host"],db["port"])
        db_list = conn.database_names()
        conn_db = conn[db["source_name"]]
        col_list = conn_db.collection_names()
        # print(conn.server_info(),db_list,col_list)
        conn_col =conn_db[col_name]
        if type(sql) is not dict:
            print("error,提供的删除条件不是字典格式！")
            exit(0)
        conn_col.remove(sql)
        conn.close()
        return True
    except Exception as e:
        traceback.print_exc()
    return False


# 日志记录
def need_log(command):
    try:
        with open('data/authority.json', 'r') as json_data:
            authority = json.load(json_data)
            return command not in authority["not log"]
    except Exception:
        pass
    return True


# 写入日志 new
def log(command, server, params):
    if need_log(command):
        insert_dict = {"user": bottle.request.auth[0], "operation": command, "server": server, "parameters": params,"time":datetime.datetime.now()}
        insert_one_mongodb(insert_dict, "log")


# 获取服务器列表
def get_game_servers():
        with open('data/servers.json', 'rb') as json_data:
            return json.loads(json_data.read().decode('utf-8'))


# 日期字典排序
def sort_date_dict(date_dict, sort_index):
    sorted_date_dict = []
    # year_list = list(date_dict.keys())
    year_list = [item for item in list(date_dict.keys()) if item.isdigit()]
    # year_list.sort(reverse = True)
    for nian in year_list:
        if isinstance(date_dict[nian], dict):        
            month_list = list(date_dict[nian].keys())
            for yue in month_list:
                day_list = list(date_dict[nian][yue].keys())
                for ri in day_list:
                    res_item = date_dict[nian][yue][ri]
                    if sort_index in res_item:
                        sorted_date_dict.append(res_item)
        if isinstance(date_dict[nian], list):  
            day_list = list(date_dict[nian][0].keys())
            for ri in day_list:
                res_item = date_dict[nian][0][ri]
                if sort_index in res_item:
                    sorted_date_dict.append(res_item)
    sorted_date_dict.sort(key=lambda x: x[sort_index], reverse=True)
    return sorted_date_dict


# 查询玩家ID
def search_player_id(db,name):
    id_name_reg = re.compile('{0}'.format(name), re.IGNORECASE)
    sql_id = {}
    sql_id["name"] = id_name_reg
    cursor_id = find_mongodb(sql_id, "user", db)
    id_list = []
    for item in cursor_id:
        id_list.append(item["id"])
    if len(id_list) == 0:
        cursor_id = find_mongodb(sql_id, "nickname", db)
        for item in cursor_id:
            id_list.append(item["id"])
    if len(id_list) > 0:
        res_id = id_list[0]
        return res_id
    else:
        return "查询玩家信息失败"


# 查询可能的玩家账户名/角色名及ID
def search_player_info(db, name):
    id_name_reg = re.compile('{0}'.format(name), re.IGNORECASE)
    sql_id = {}
    sql_id["name"] = id_name_reg
    cursor_id = find_mongodb(sql_id, "user", db)
    id_list, zhanghu_list, juese_list = [], [], []
    for item in cursor_id:
        id_list.append(item["id"])
        zhanghu_list.append(item["name"])
    if len(id_list) > 0:
        return {"zhanghu": zhanghu_list, "id": id_list}
    elif len(id_list) == 0:
        cursor_id = find_mongodb(sql_id, "nickname", db)
        for item in cursor_id:
            id_list.append(item["id"])
            juese_list.append(item["name"])
        if len(id_list) > 0:
            return {"juese": juese_list, "id": id_list}
        else:
            return False


# 查询玩家信息_按账户名
def search_account(db, name):
    ret_data = []
    name_reg = re.compile('{0}'.format(name), re.IGNORECASE)
    sql = {}
    sql["name"] = name_reg
    account_cursor = find_mongodb(sql, "user", db).limit(20)
    for row in account_cursor:
        ret_data.append(row["name"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"account"}}

# 查询玩家信息_按角色名
def search_role(db, name):
    ret_data = []
    name_reg = re.compile('{0}'.format(name), re.IGNORECASE)
    sql = {}
    sql["name"] = name_reg
    role_cursor = find_mongodb(sql, "nickname", db).limit(20)
    for row in role_cursor:
        ret_data.append(row["name"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"role"}}


# 查询玩家信息_按ID号
def search_id(db, palyerID):
    ret_data = []
    sql = {}
    sql = {"$where": "function(){return (String(this.id).indexOf(\""+palyerID+"\") != -1)}"}
    account_cursor = find_mongodb(sql, "nickname", db).limit(20)
    for row in account_cursor:
        ret_data.append(row["id"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"id"}}

# 显示玩家ID和玩家角色名
def read_role(db, name, search_type):
    ret_data = []
    if search_type != "id":
        player_id = search_player_id(db, name)
    else:
        player_id = int(name)
    sql = {}
    sql["id"] = player_id
    # 根据玩家ID查询玩家数据
    try:
        cursor_data = find_mongodb(sql, "player", db)
        for row in cursor_data:
            ret_data.append({"playerID": player_id, "nickname": row["base"]["nickname"]})
    except Exception as e:
        pass
    return {"success": True, "data": ret_data}


# 查询最后上线时间
def search_time(db, name, search_type):
    if search_type == "id":
        player_id = int(name)
    else:
        player_id = search_player_id(db, name)
    sql = {}
    sql["id"] = player_id
    # 登录记录
    player_data = find_one_mongodb(sql, "player", db)
    # 最后登录时间
    if player_data:
        login_record = player_data["records"]["_time"]
        sorted_record = sort_date_dict(login_record, "last_login")[0]["last_login"]
        login_ret = datetime.datetime.fromtimestamp(sorted_record).strftime('%Y-%m-%d %H:%M:%S')
        return {"success": True, "data": login_ret}
    return {"success": False, "message": "没有找到此玩家的游戏数据！"}   

# 查询势力信息_势力名
def search_force_name(db, name):
    print(db, name)
    ret_data = []
    name_reg = re.compile('{0}'.format(name), re.IGNORECASE)
    sql = {}
    sql["name"] = name_reg
    role_cursor = find_mongodb(sql, "force", db).limit(20)
    for row in role_cursor:
        ret_data.append(row["name"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"force_name"}}


# 查询势力信息_势力ID
def search_force_id(db, forceid):
    #print(db, forceid)
    ret_data = []
    sql = {"$where": "function(){return (String(this.id).indexOf(\""+forceid+"\") != -1)}"}
    cursor = find_mongodb(sql, "force", db).limit(20)
    for row in cursor:
        ret_data.append(row["id"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"force_id"}}


# 查询势力信息_国王ID
def search_king_id(db, kingid):
    ret_data = []
    sql = {}
    sql = {"$where": "function(){return (String(this.king).indexOf(\""+kingid+"\") != -1)}"}
    account_cursor = find_mongodb(sql, "force", db).limit(20)
    for row in account_cursor:
        ret_data.append(row["king"])
    ret_data.sort()
    return {"success": True, "data": {"ret_data":ret_data,"search_type":"king_id"}}

#  查询势力信息 
def search_force_info(db, name, search_type):
    ret_data = []
    if search_type == "force_name":
        sql = {"name":name}
    if search_type == "force_id":
        sql = {"id":int(name)}
    if search_type == "king_id":
        sql = {"king":int(name)}
    try:
        cursor_data = find_mongodb(sql, "force", db)
        for row in cursor_data:
            ret_data.append({"force_name": row["name"], "force_id": row["id"], "king_id": row["king"]})
    except Exception as e:
        pass
    return {"success": True, "data": ret_data}


def view_force_db_data(db, force_id):
    force_db_data = find_one_mongodb({"id":int(force_id)}, "force", db)
    if force_db_data == None:
        return {"success": False, "message": "没有找到此玩家数据"}
    del force_db_data["_id"]
    return {"success": True, "data": force_db_data}

# 查询玩家购买月卡的记录数据
def search_card(db, account):
    db["source_name"] = "log"
    ret_data = []
    data = query('select buytime, overtime from  month_card_log where account={0}'.format(escape(account)), db);
    for row in data:
        ret_data.append([row[0].strftime('%Y-%m-%d %H:%M:%S'),row[1].strftime('%Y-%m-%d %H:%M:%S')])
    return {"success":True, "data":ret_data}


def format_time(time_num):
    time_res = "数据错误"
    if time_num < 60:
        time_res = str(time_num)+"秒("+str(time_num)+")"
    elif 60 <= time_num < 3600:
        time_res = str(time_num//60)+"分"+str(time_num % 60)+"秒("+str(time_num)+")"
    elif 3600 <= time_num < 86400:
        time_res = str(time_num//3600)+"小时"+str(time_num % 3600//60)+"分("+str(time_num)+")"
    elif time_num >= 86400:
        time_res = str(time_num//86400)+"天"+str(time_num % 86400//3600)+"小时("+str(time_num)+")"
    return time_res


# 查看玩家信息(数据库)
def view_role_db_data(db, playerId):
    role_data = find_one_mongodb({"id":int(playerId)}, "player", db)
    # print(role_data["records"]["_base_data"]["register_time"])
    if role_data == None:
        return {"success": False, "message": "没有找到此玩家数据"}
    # 格式化注册时间
    reg_timestamp = role_data["records"]["_base_data"]["register_time"]
    reg_time = datetime.datetime.fromtimestamp(reg_timestamp).strftime('%Y-%m-%d')
    role_data["records"]["_base_data"]["register_time"] = reg_time
    # 格式化累计时间
    total_time = role_data["records"]["_base_data"]["days_from_registration"]
    role_data["records"]["_base_data"]["days_from_registration"] = format_time(total_time)
    del role_data["_id"]
    return {"success": True, "data": role_data}

# 登录注销日志
def view_login_logout(db, rolename, page):
    pagination = 5  # 每页显示数量
    page = int(page)
    
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    
    # 查询所有登录记录,并按时间排序，获取记录总数
    login_cursor = find_mongodb({"id": player_id, "key": 10001}, "generic", db)
    login_res = []
    for item in login_cursor:
        login_res.append(item["param"]["time"])
    login_res.sort(reverse=True)
    len_in = len(login_res)
    total = len_in
    if total != 0:
        total = math.ceil(float(total)/pagination)
        # 查询所有注销记录,并按时间降序排列，获取记录总数
        logout_cursor = find_mongodb({"id":player_id, "key": 10002}, "generic", db)
        logout_res = []
        for item in logout_cursor:
            logout_res.append(item["param"]["time"])
        logout_res.sort(reverse=True)
        # print("player_id:",player_id,"logout_res:",logout_res)
        len_out = len(logout_res)
        if len_in - len_out not in [0, 1]:
            # print(type(len_in),len_in,type(len_out),len_out)
            return {"success":False, "message":"查询到"+str(rolename)+"玩家,登录记录数:"+str(len_in)+"条；注销记录数:"+ str(len_out)+"条,无法正确匹配"}
        # 若注销记录少于登录记录，则玩家当前未注销，注销记录中增加“当前在线”item
        if len_out + 1 == len_in:
            logout_res.insert(0, "当前在线")
        
        # 获取服务器当前时间,计算玩家累计在线时间
        game_serv = "tcp://"+ db["host"] + ":" + str(58888)
        serv_time = install.ZMQSend("GetServerTime", [], game_serv)
        serv_time =json.loads(serv_time)["msg"]

        from_last_login = serv_time - login_res[0]
        sum_duration = 0
        if logout_res[0] == "当前在线":
            sum_duration += from_last_login
        else:
            sum_duration += logout_res[0]-login_res[0]
        if len(logout_res) > 1:
            for i in range(1, len_in):
                sum_duration += logout_res[i]-login_res[i]
        
        show_login_records = login_res[((page-1)*pagination): page*pagination]
        show_logout_records = logout_res[((page-1)*pagination): page*pagination]
        
        # 返回数据
        ret_data = []
        for i in range(0, len(show_login_records)):
            # print(type(show_login_records[i]),show_login_records[i])
            login_item = datetime.datetime.fromtimestamp(show_login_records[i]).strftime('%Y-%m-%d %H:%M:%S')
            if show_logout_records[i] == "当前在线":
                logout_item = "当前在线"
                duration = from_last_login
            else:
                logout_item = datetime.datetime.fromtimestamp(show_logout_records[i]).strftime('%Y-%m-%d %H:%M:%S')
                duration = show_logout_records[i] - show_login_records[i]
            ret_data.append([player_id, login_item, logout_item, duration])
        return {"success": True, "total": total, "data": ret_data, "sum_duration": sum_duration}
    return {"success": True, "total": total}


# 每日游戏时间日志
def view_role_duration(db, rolename, page):
    pagination = 5  # 每页显示数量
    page = int(page)
    # 查询玩家ID
    player_id = search_player_id(db, rolename)
    # 查询该玩家所有登录注销记录，补全“last_login”字段,并升序排列
    records = find_one_mongodb({"id": player_id}, "player", db)["records"]["_time"]
    res_records = []
    year_list = [item for item in list(records.keys()) if item.isdigit()]
    # year_list = list(records.keys())
    for nian in year_list:
        month_list = list(records[nian].keys())
        for yue in month_list:
            day_list = list(records[nian][yue].keys())
            for ri in day_list:
                res_item = records[nian][yue][ri]
                if "last_login" not in res_item:
                    logout_time = datetime.datetime.fromtimestamp(res_item["last_logout"])
                    add_login = datetime.datetime(logout_time.year, logout_time.month, logout_time.day)
                    add_login_timestamp = time.mktime(add_login.timetuple())
                    res_item["last_login"] = add_login_timestamp
                res_records.append(res_item)
    res_records.sort(key=lambda x: x["last_login"])
    # 对res_records进行相应操作
    import dailycount
    res_records = dailycount.daily_count(res_records, db)
    if isinstance(res_records, str):
        return {"success": False, "message": res_records}
    res_records.sort(key=lambda x: x["last_login"], reverse=True)
    total = len(res_records)
    if total == 0:
        return {"success": True, "total": total}
    # 玩家总在线时间
    sum_duration = res_records[0]["curr_sum_duration"]
    # 获取当前要展示的内容
    current_records = res_records[((page-1)*pagination): page*pagination]
    total = math.ceil(float(total)/pagination)
    ret_data = []
    for item in current_records:
        login_date = datetime.datetime.fromtimestamp(item["last_login"]).strftime('%Y-%m-%d')
        duration = item["duration"]
        curr_duration = item["curr_sum_duration"]
        ret_data.append([player_id, login_date, duration, curr_duration])
    return {"success": True, "total": total, "data": ret_data, "sum_duration": sum_duration}


# 玩家经验流水
def view_exp_stat(db, rolename, page):
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    #查询玩家获得经验记录总数
    RoleExp_cursor = find_mongodb({"id": player_id, "key": 10003}, "generic", db).sort("param.time",-1).skip((page-1)*pagination).limit(pagination)
    total = RoleExp_cursor.count()
    if total!=0:
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in RoleExp_cursor:
            RoleExp_time = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([player_id,RoleExp_time,item["param"]["count"]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}


# 玩家铜币日志
def view_copper_coin(db, rolename, page):
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询CopperCoin记录总数
    CopperCoin_cursor = find_mongodb({"id": player_id, "key": 10101}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = CopperCoin_cursor.count()   
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in CopperCoin_cursor: 
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeType = change_type[item["param"]["type"]]
            changeFrom = from_type[str(item["param"]["from"])]
            ret_data.append([player_id, changeTime, changeType, changeFrom, item["param"]["count"]])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 玩家粮草日志
def view_forage(db, rolename, page): 
    pagination = 5 # 每页显示数量
    page = int(page)    
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询Forage记录总数
    Forage_cursor = find_mongodb({"id": player_id, "key": 10102}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = Forage_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in Forage_cursor: 
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeType = change_type[item["param"]["type"]]
            changeFrom = from_type[str(item["param"]["from"])]
            ret_data.append([player_id, changeTime, changeType, changeFrom, item["param"]["count"]])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 玩家矿石日志
def view_steel_stone(db, rolename, page): 
    pagination = 5
    page = int(page)    
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename) 
    # 查询所有SteelStone记录总数
    SteelStone_cursor = find_mongodb({"id": player_id, "key": 10103}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = SteelStone_cursor.count()   
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in SteelStone_cursor: 
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeType = change_type[item["param"]["type"]]
            changeFrom = from_type[str(item["param"]["from"])]
            ret_data.append([player_id, changeTime, changeType, changeFrom, item["param"]["count"]])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}

change_type = {"add": "获得", "sub": "消耗"}
currency_type = {"glod_coin": "金币", "copper_coin": "铜币"}
with open('json/items.json', 'rb') as json_data: 
    items_type = json.loads(json_data.read().decode('utf-8'))
with open('json/from_type.json', 'rb') as json_data: 
    from_type = json.loads(json_data.read().decode('utf-8'))
with open('json/task_name.json', 'rb') as json_data: 
    task_name = json.loads(json_data.read().decode('utf-8'))
with open('json/campaign_name.json', 'rb') as json_data: 
    campaign_name = json.loads(json_data.read().decode('utf-8'))
# 获得/使用道具日志
def view_add_sub_prop(db, rolename, page): 
    pagination = 5
    page = int(page)    
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询所有Prop记录。
    Prop_cursor = find_mongodb({"id": player_id, "key": 10201}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = Prop_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in Prop_cursor: 
            itemsKey = str(item["param"]["id"])
            PropName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeType = change_type[item["param"]["type"]]
            changeFrom = from_type[str(item["param"]["from"])]
            changeCount = item["param"]["count"]
            ret_data.append([changeTime, changeFrom, changeType, PropName, changeCount])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 玩家出售道具日志
def view_sold_prop(db, rolename, page): 
    pagination = 5
    page = int(page)    
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    
    # 获取SoldProp记录总数
    SoldProp_cursor = find_mongodb({"id": player_id, "key": 10202}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = SoldProp_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in SoldProp_cursor: 
            itemsKey = str(item["param"]["id"])
            PropName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            soldTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            soldCount = item["param"]["count"]
            soldCurrencyType = currency_type[item["param"]["to"]["currency_type"]]
            soldValue = item["param"]["to"]["currency_value"]
            ret_data.append([soldTime, PropName, soldCount, soldCurrencyType, soldValue])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 玩家关卡日志
def view_area_stat(db, rolename, page): 
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询完成任务记录数
    getArea_cursor = find_mongodb({"id": player_id, "key": 10301}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = getArea_cursor.count()
    if total != 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        sum_done = 0
        for item in getArea_cursor: 
            areaKey = str(item["param"]["id"])
            areaName = areaKey in campaign_name and campaign_name[areaKey]+"["+areaKey+"]" or "JSON缺失["+areaKey+"]"

            # AreaID = item["param"]["id"]
            AreaTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            isPassed = item["param"]["passed"] and "通过" or "失败"
            passedCount = item["param"]["count"]
            ret_data.append([player_id, AreaTime, areaName, isPassed, passedCount])
        return {"success": True, "total": total, "data": ret_data, "sum_get": total, "sum_done": sum_done}
    return {"success": True, "total": total}

# 玩家任务日志
def view_task_stat(db, rolename, page): 
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询完成任务记录数
    getTask_cursor = find_mongodb({"id": player_id, "key": 10401, "param.type": "achieve"}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = getTask_cursor.count()
    if total != 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        sum_done = 0
        for item in getTask_cursor: 
            taskKey = str(item["param"]["id"])
            taskName = taskKey in task_name and task_name[taskKey]+"["+taskKey+"]" or "JSON缺失["+taskKey+"]"
            # taskID = item["param"]["id"]
            getTaskTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            doneTaskTime = "尚未完成"
            doneTask = find_one_mongodb({"id": player_id, "key": 10401, "param.type": "accomplish", "param.id": int(taskKey)}, "generic", db)
            if doneTask: 
                doneTaskTime = datetime.datetime.fromtimestamp(doneTask["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
                sum_done += 1
            ret_data.append([player_id, taskName, getTaskTime, doneTaskTime])
        return {"success": True, "total": total, "data": ret_data, "sum_get": total, "sum_done": sum_done}
    return {"success": True, "total": total}
# 获得/使用英雄日志
def view_hero_log(db, rolename, page): 
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 获得所有Hero记录总数
    HeroLog_cursor = find_mongodb({"id": player_id, "key": 10701}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = HeroLog_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in HeroLog_cursor: 
            itemsKey = str(item["param"]["id"])
            heroName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeFrom = from_type[str(item["param"]["from"])]
            changeType = change_type[item["param"]["type"]]
            ret_data.append([changeTime, changeFrom, changeType, heroName])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}

# 获得/使用小兵日志
def view_soldier_log(db, rolename, page): 
    pagination = 5 
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询Soldier记录总数
    SoldierLog_cursor = find_mongodb({"id": player_id, "key": 10702}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = SoldierLog_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in SoldierLog_cursor: 
            itemsKey = str(item["param"]["id"])
            soldierName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeFrom = from_type[str(item["param"]["from"])]
            changeType = change_type[item["param"]["type"]]
            soldierCount = item["param"]["count"]
            ret_data.append([changeTime, changeFrom, changeType, soldierName, soldierCount])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 获得/使用机械日志
def view_machine_log(db, rolename, page): 
    pagination = 5 
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询所有Machine记录总数
    MachineLog_cursor = find_mongodb({"id": player_id, "key": 10704}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = MachineLog_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in MachineLog_cursor: 
            itemsKey = str(item["param"]["id"])
            machineName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeFrom = from_type[str(item["param"]["from"])]
            changeType = change_type[item["param"]["type"]]
            machineCount = item["param"]["count"]
            ret_data.append([changeTime, changeFrom, changeType, machineName, machineCount])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 获得/使用坐骑日志
def view_ride_log(db, rolename, page): 
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询所有Ride记录
    RideLog_cursor = find_mongodb({"id": player_id, "key": 10703}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = RideLog_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in RideLog_cursor: 
            itemsKey = str(item["param"]["id"])
            rideName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            changeTime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            changeFrom = from_type[str(item["param"]["from"])]
            changeType = change_type[item["param"]["type"]]
            rideCount = item["param"]["count"]
            ret_data.append([changeTime, changeFrom, changeType, rideName, rideCount])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}
# 打开界面日志
def view_open_ui_log(db, rolename, page): 
    pagination = 5
    page = int(page)
    # 从game数据库查询玩家ID
    game_db = {"host": db["host"], "port": 27017, "source_name": "bw"}
    player_id = search_player_id(game_db, rolename)
    # 查询所有OpenUILog记录总数
    OpenUILog_cursor = find_mongodb({"id": player_id, "key": 10901}, "generic", db).sort("param.time", -1).skip((page-1)*pagination).limit(pagination)
    total = OpenUILog_cursor.count()
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for item in OpenUILog_cursor: 
            OpenUITime = datetime.datetime.fromtimestamp(item["param"]["time"]).strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([player_id, OpenUITime, item["param"]["id"]])
        return {"success": True, "total": total, "data": ret_data, "sumOpenUI": total}
    return {"success": True, "total": total}
# 服务器基本信息(game数据库27017)
def view_server_info(serv_id): 
    servId = int(serv_id)
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    # print("当前日志数据库：", curr_server)
    
    # notConnDbMsg = ""
    ServerInfo_res = []
    for id, dbItem in enumerate(curr_server): 
        # print("当前查询日志的数据库为: ", dbItem)
        game_db = {"host": dbItem["host"], "port": 27017, "source_name": "bw"}
        # print("当前游戏数据库：", game_db)
        # print(game_db["host"], "游戏数据库【连接】结果: ", can_connect(game_db))
        if not can_connect(game_db): 
            print(game_db["host"], "游戏数据库无法连接！")
            continue
        ServerInfo_rat = find_one_mongodb({}, "server_data_record", game_db)
        # print(game_db["host"], "游戏数据库【查询】结果: ")
        # print(ServerInfo_rat)
        if ServerInfo_rat: 
            serv_name = dbItem["name"] 
            sum_players = ServerInfo_rat["_player"]["all_player_count"]
            built_forces = ServerInfo_rat["_force"]["built_force"]
            destroyed_forces = ServerInfo_rat["_force"]["destroyed_force"]
            exist_forces = ServerInfo_rat["_force"]["exist_force"]
            add_coins,sub_coins,add_forages,sub_forages,add_steel_stons,sub_steel_stons =0,0,0,0,0,0
            if ServerInfo_rat["_currency"][0]:           
                add_coins = ServerInfo_rat["_currency"][0]["add"]
                sub_coins = ServerInfo_rat["_currency"][0]["sub"]
            if ServerInfo_rat["_currency"][1]:  
                add_forages = ServerInfo_rat["_currency"][1]["add"]
                sub_forages = ServerInfo_rat["_currency"][1]["sub"]
            if ServerInfo_rat["_currency"][2]:  
                add_steel_stons = ServerInfo_rat["_currency"][2]["add"]
                sub_steel_stons = ServerInfo_rat["_currency"][2]["sub"]
            ServerInfo_res.append([id+1, serv_name, sum_players, built_forces, destroyed_forces,
            exist_forces,add_coins,sub_coins,add_forages,sub_forages,add_steel_stons,sub_steel_stons])
    total = len(ServerInfo_res)
    if total != 0: 
        return {"success": True, "total": total, "data": ServerInfo_res}
    else: 
        return {"success": True, "total": total}

# 注册信息查询
def view_reg_log(condition, page): 
    servId, playerName = int(condition["serv_id"]), condition["player_name"]
    startDate = datetime.datetime.strptime(condition["start_date"], '%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(condition["end_date"], '%Y-%m-%d %H:%M:%S')
    startInt, endInt = time.mktime(startDate.timetuple())-12*3600, time.mktime(endDate.timetuple())+12*3600
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    # 查询数据库, 获取注册信息
    # unableConnDbMsg = ""
    RegLog_res = []
    for dbItem in curr_server: 
        # print("当前日志数据库为: ", dbItem, "连接结果: ", can_connect(dbItem))
        if not can_connect(dbItem): 
            print(dbItem["name"], "日志数据库无法连接!")
            continue
        game_db = {"host": dbItem["host"], "port": 27017, "source_name": "bw"}
        if not can_connect(game_db): 
            print(game_db["host"], "游戏数据库无法连接!")
            continue
        if playerName != "": 
            # 从game数据库查询玩家信息(账户名/角色名, ID)
            playerInfo = search_player_info(game_db, playerName)
            if playerInfo == False: 
                print("未能从"+game_db["host"]+"数据库查询到玩家信息")
                continue
            else: 
                infoIndex = "zhanghu" in playerInfo and "zhanghu" or "juese"
                infoDetail = "zhanghu" in playerInfo and "[账户名]" or "[角色名]"
                playerMsg = playerInfo[infoIndex]
                playerIdList = playerInfo["id"]
                for id, IdItem in enumerate(playerIdList): 
                    RegLog_rat = find_one_mongodb({"key": 12001, "param.id": IdItem, "param.register_time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
                    if RegLog_rat: 
                        RegLog_rat["param"]["zone"] = dbItem["name"]
                        RegLog_rat["param"]["info"] = infoDetail + playerMsg[id]
                        RegLog_res.append(RegLog_rat["param"])
        if playerName == "": 
            RegLog_cursor = find_mongodb({"key": 12001, "param.register_time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
            for record in RegLog_cursor: 
                zhangHuMing = find_one_mongodb({"id": record["param"]["id"]}, "user", game_db)["name"]
                record["param"]["zone"] = dbItem["name"]
                record["param"]["info"] = "[账户名]"+ zhangHuMing
                RegLog_res.append(record["param"])
    # 排序注册记录   
    RegLog_res.sort(key = lambda x: x["register_time"], reverse = True)
    total = len(RegLog_res)
    pagination = 10
    page = int(page)
    # 获取当前页面要展示的内容
    current_records = RegLog_res[((page-1)*pagination) : page*pagination]
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for id, item in enumerate(current_records): 
            recordNum = (page-1)*pagination+id+1
            registerTime = datetime.datetime.fromtimestamp(item["register_time"]).strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([recordNum, item["zone"], item["info"], item["id"], registerTime])
        return {"success": True, "total": total, "data": ret_data, "sumRecords": total}
    return {"success": True, "total": total}

# 注册信息下载
def download_reg_log(condition): 
    servId, playerName = int(condition["serv_id"]), condition["player_name"]
    startDate = datetime.datetime.strptime(condition["start_date"], '%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(condition["end_date"], '%Y-%m-%d %H:%M:%S')
    startInt, endInt = time.mktime(startDate.timetuple())-12*3600, time.mktime(endDate.timetuple())+12*3600
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    # 查询数据库, 获取注册信息
    RegLog_res = []
    for dbItem in curr_server: 
        # print("当前日志数据库为: ", dbItem, "连接结果: ", can_connect(dbItem))
        if not can_connect(dbItem): 
            print(dbItem["name"], "日志数据库无法连接!")
            continue
        game_db = {"host": dbItem["host"], "port": 27017, "source_name": "bw"}
        if not can_connect(game_db): 
            print(game_db["host"], "游戏数据库无法连接!")
            continue
        if playerName != "": 
            # 从game数据库查询玩家信息(账户名/角色名, ID)
            playerInfo = search_player_info(game_db, playerName)
            if playerInfo == False: 
                print("未能从"+game_db["host"]+"数据库查询到玩家信息")
                continue
            else: 
                infoIndex = "zhanghu" in playerInfo and "zhanghu" or "juese"
                infoDetail = "zhanghu" in playerInfo and "[账户名]" or "[角色名]"
                playerMsg = playerInfo[infoIndex]
                playerIdList = playerInfo["id"]
                for id, IdItem in enumerate(playerIdList): 
                    RegLog_rat = find_one_mongodb({"key": 12001, "param.id": IdItem, "param.register_time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
                    if RegLog_rat: 
                        RegLog_rat["param"]["zone"] = dbItem["name"]
                        RegLog_rat["param"]["info"] = infoDetail + playerMsg[id]
                        RegLog_res.append(RegLog_rat["param"])
        if playerName == "": 
            RegLog_cursor = find_mongodb({"key": 12001, "param.register_time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
            for record in RegLog_cursor: 
                zhangHuMing = find_one_mongodb({"id": record["param"]["id"]}, "user", game_db)["name"]
                record["param"]["zone"] = dbItem["name"]
                record["param"]["info"] = "[账户名]"+ zhangHuMing
                RegLog_res.append(record["param"])
    # 排序注册记录   
    RegLog_res.sort(key = lambda x: x["register_time"], reverse = True)
    RegLog_res = []
    if len(RegLog_res)!= 0: 
        ret_data = []
        for id, item in enumerate(RegLog_res): 
            recordNum = id+1
            registerTime = datetime.datetime.fromtimestamp(item["register_time"]).strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([recordNum, item["zone"], item["info"], item["id"], registerTime])
        
        csv = [ "%d,%s,%s,%s,%s" % (row[0], row[1], row[2], row[3], row[4]) for row in ret_data ]
        csv = "序号,服务区名称,玩家信息,玩家ID,注册时间\r\n"+"\r\n".join(csv)
        csv = b"\xEF\xBB\xBF"+csv.encode('utf-8')
        csv = base64.b64encode(csv).decode('utf8')
        return {"success":True, "data":csv}
    return {"success": False,"message":"当前条件下，没有对应的注册信息！"}

# 玩家登录信息查询
def view_player_login_log(condition, page): 
    servId, playerName = int(condition["serv_id"]), condition["player_name"]
    startDate = datetime.datetime.strptime(condition["start_date"], '%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(condition["end_date"], '%Y-%m-%d %H:%M:%S')
    startInt, endInt = time.mktime(startDate.timetuple())-12*3600, time.mktime(endDate.timetuple())+12*3600
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    # 查询数据库, 获取注册信息
    # unableConnDbMsg = ""
    loginLog_res = []
    for dbItem in curr_server: 
        if not can_connect(dbItem): 
            print(dbItem["name"], "日志数据库无法连接!")
            continue
        game_db = {"host": dbItem["host"], "port": 27017, "source_name": "bw"}
        if not can_connect(game_db): 
            print(game_db["host"], "游戏数据库无法连接!")
            continue
        if playerName != "": 
            # 从game数据库查询玩家信息(账户名/角色名, ID)
            playerInfo = search_player_info(game_db, playerName)
            if playerInfo == False: 
                print("未能从"+game_db["host"]+"数据库查询到玩家信息")
                continue
            else: 
                infoIndex = "zhanghu" in playerInfo and "zhanghu" or "juese"
                infoDetail = "zhanghu" in playerInfo and "[账户名]" or "[角色名]"
                playerMsg = playerInfo[infoIndex]
                playerIdList = playerInfo["id"]
                for id, IdItem in enumerate(playerIdList): 
                    loginLog_rat = find_one_mongodb({"key": 12002, "param.id": IdItem, "param.time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
                    if loginLog_rat: 
                        loginLog_rat["param"]["zone"] = dbItem["name"]
                        loginLog_rat["param"]["info"] = infoDetail + playerMsg[id]
                        loginLog_res.append(loginLog_rat["param"])
        if playerName == "": 
            loginLog_cursor = find_mongodb({"key": 12002, "param.time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
            for record in loginLog_cursor: 
                zhangHuMing = find_one_mongodb({"id": record["param"]["id"]}, "user", game_db)["name"]
                record["param"]["zone"] = dbItem["name"]
                record["param"]["info"] = "[账户名]"+ zhangHuMing
                loginLog_res.append(record["param"])
    # 排序注册记录   
    # loginLog_res.sort(key = lambda x: x["id"], reverse = True)
    loginLog_res.sort(key = lambda x: (x["id"], x["time"]), reverse = True)
    total = len(loginLog_res)
    pagination = 10
    page = int(page)
    # 获取当前页面要展示的内容
    current_records = loginLog_res[((page-1)*pagination) : page*pagination]
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for id, item in enumerate(current_records): 
            recordNum = (page-1)*pagination+id+1
            loginTime = datetime.datetime.fromtimestamp(item["time"]).strftime('%Y-%m-%d %H:%M:%S')
            sumOnlineTime = format_time(item["duration"])
            ret_data.append([recordNum, item["zone"], item["info"], item["id"], loginTime, sumOnlineTime])
        return {"success": True, "total": total, "data": ret_data, "sumRecords": total}
    return {"success": True, "total": total}

# 每日新/老玩家数量查询
def view_daily_count(condition, page): 
    servId = int(condition["serv_id"])
    startDate = datetime.datetime.strptime(condition["start_date"], '%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(condition["end_date"], '%Y-%m-%d %H:%M:%S')
    startInt, endInt = time.mktime(startDate.timetuple())-12*3600, time.mktime(endDate.timetuple())+12*3600
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    DailyCount_res = []
    for dbItem in curr_server: 
        game_db = {"host": dbItem["host"], "port": 27017, "source_name": "bw"}
        if not can_connect(game_db): 
            print(game_db["host"], "游戏数据库无法连接!")
            continue
        DailyCount_rat = find_one_mongodb({}, "server_data_record", game_db)
        import dailycount
        DailyCount_res.extend(dailycount.dailyPlayerSumCount(DailyCount_rat, startInt, endInt, dbItem))
    # 排序
    DailyCount_res.sort(key = lambda x: x["time"], reverse = True)
    total = len(DailyCount_res)
    pagination = 10
    page = int(page)
    # 获取当前页面要展示的内容
    current_records = DailyCount_res[((page-1)*pagination) : page*pagination]
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for id, item in enumerate(current_records): 
            recordNum = (page-1)*pagination+id+1
            ret_data.append([recordNum, item["zone"], item["time"], item["old_count"], item["new_count"]])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}

# 产出物品查询查询
def view_add_item_log(condition, page): 
    servId = int(condition["serv_id"])
    itemType = condition["item_type"]
    startDate = datetime.datetime.strptime(condition["start_date"], '%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(condition["end_date"], '%Y-%m-%d %H:%M:%S')
    startInt, endInt = time.mktime(startDate.timetuple())-12*3600, time.mktime(endDate.timetuple())+12*3600
    # 获取服务器列表
    all_servers = get_game_servers()
    curr_server = []
    for id, servItem in enumerate(all_servers): 
        if id == servId: 
            curr_server.append(servItem)
    if curr_server == []: 
        curr_server = all_servers
    AddItemLog_res = []
    for dbItem in curr_server: 
        if not can_connect(dbItem): 
            print(dbItem["name"], "日志数据库无法连接!")
            continue
        if itemType == "-1": 
            AddItemLog_cursor = find_mongodb({"key": 13001, "param.time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
            for record in AddItemLog_cursor: 
                record["param"]["zone"] = dbItem["name"]
                AddItemLog_res.append(record["param"])
        else: 
            AddItemLog_cursor = find_mongodb({"key": 13001, "param.id": int(itemType), "param.time": {"$gte": startInt, "$lte": endInt }}, "server_generic", dbItem)
            for record in AddItemLog_cursor: 
                record["param"]["zone"] = dbItem["name"]
                AddItemLog_res.append(record["param"])
    # 排序
    AddItemLog_res.sort(key = lambda x: x["time"], reverse=True)
    total = len(AddItemLog_res)
    pagination = 10
    page = int(page)
    # 获取当前页面要展示的内容
    # print(items_type)
    current_records = AddItemLog_res[((page-1)*pagination) : page*pagination]
    if total!= 0: 
        total = math.ceil(float(total)/pagination)
        ret_data = []
        for id, item in enumerate(current_records): 
            recordNum = (page-1)*pagination+id+1
            itemsKey = str(item["id"])
            itemName = itemsKey in items_type and items_type[itemsKey]+"["+itemsKey+"]" or "JSON缺失["+itemsKey+"]"
            productTime = datetime.datetime.fromtimestamp(item["time"]).strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([recordNum, item["zone"], productTime, itemName, item["count"]])
        return {"success": True, "total": total, "data": ret_data}
    return {"success": True, "total": total}

def ViewFeedback(db, page, name, gm):
    pagination = 10 #每页显示数量
    page = int(page)
    data = query('select count(*),data from user_feedback', db);
    if name!="":
        data = query("select count(*),data from user_feedback where name='{0}'".format(name), db);
    #暂时就不支持合并查询
    if gm==True:
        data = query("select count(*),data from user_feedback where data like '%<?>%'", db);
    total = data[0][0]
    print(total)
    ret_data = []
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query("select * from user_feedback order by id desc limit {0},{1};".format((page-1)*pagination, pagination), db)
        if name!="":
            data = query("select * from user_feedback WHERE name='{0}' order by id desc limit {1},{2};".format(name,(page-1)*pagination, pagination), db)
        if gm==True:
            data = query("select * from user_feedback WHERE data like '%?%' order by id desc limit {0},{1};".format((page-1)*pagination, pagination), db)


        for row in data:
            row_data = {}
            if len(row)==7:
                row_data["id"] = row[0]
                row_data["role"] = row[1]
                row_data["text"] = row[2]
                row_data["device"] = row[3]
                row_data["os"] = row[4]
                row_data["account"] = row[6]
                try:
                    row_data["role"] = row[1].decode('utf-8')
                    row_data["text"] = row[2].decode('utf-8')
                    row_data["device"] = row[3].decode('utf-8')
                    row_data["os"] = row[4].decode('utf-8')
                    row_data["account"] = row[6].decode('utf-8')
                except Exception as e:
                    pass
                row_data["time"] = row[5].strftime('%Y-%m-%d %H:%M:%S')
            else:
                row_data["id"] = row[0]
                row_data["role"] = row[1]
                row_data["text"] = row[2]
                row_data["device"] = ""
                row_data["os"] = ""
                row_data["account"] = ""
                try:
                    row_data["role"] = row[1].decode('utf-8')
                    row_data["text"] = row[2].decode('utf-8')
                except Exception as e:
                    pass
                row_data["time"] = row[3].strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append(row_data)
    return {"success":True, "total":total,"data":ret_data}

def ViewFillOrder(db,rolename,platform):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    pagination = 10 #每页显示数量
    page = int(1)
    data = query('select count(*) from pay_stat where uid={0} and platform={1}'.format(escape(rolename),escape(platform)), db_info);
    total = data[0][0]
    if total!=0:
        #total = math.ceil(float(total)/pagination)
        data = query('select uid,platform,diamond,time,server from pay_stat where uid={0} and platform={1} order by time desc limit {2},{3};'.format(escape(rolename),escape(platform), (page-1)*pagination, pagination), db_info)
        ret_data = []
        for row in data:
            ret_data.append([row[0],row[1],row[2],row[3].strftime('%Y-%m-%d %H:%M:%S'), row[4]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}
def getOfflineDbData(zone):
    if zone == 0:
        game_servers = get_game_servers()
        all_total_online_time = 0
        all_total_account = 0
        all_temp_time = 0
        for server in game_servers:
            dbdata = query("select data from user", server)
            ret_data = []
            total_online_time = 0
            total_account = 0
            for (data,) in dbdata:
                try:
                    data = base64.b64decode(data)
                    data = zlib.decompress(data)
                    data = data.decode('utf-8')

                    info = json.loads(data)
                    #记录有效账号
                    if info['total_online_time']:
                        total_account = total_account + 1
                        total_online_time = total_online_time + info['total_online_time']
                    #ret_data.append({"level":level, "task":task, "yindao":yindao, "zhiye":zhiye, "huazhao":huazhao,"roleList":len(info['roleList'])})
                except Exception:
                    pass
            all_total_online_time = all_total_online_time + total_online_time
            all_total_account = all_total_account + total_account
        
        row_data = {}
        if all_total_account > 0:
            all_temp_time = (all_total_online_time/60) / all_total_account
        row_data["total_account"] = all_total_account
        row_data["total_online_time"] = all_total_online_time
        row_data["average_time"] = int(all_temp_time)
        ret_data.append(row_data)
        return {"success":True, "total":ret_data}
        
    game_servers = get_game_servers()
    index = 1
    server = []
    for i in game_servers:
        if index == zone:
            server = i
            break
        index = index + 1
    if server == []:
        return {"success":False}
    dbdata = query("select data from user", server)
    ret_data = []
    total_online_time = 0
    total_account = 0
    for (data,) in dbdata:
        try:
            data = base64.b64decode(data)
            data = zlib.decompress(data)
            data = data.decode('utf-8')

            info = json.loads(data)
            #记录有效账号
            if info['total_online_time']:
                total_account = total_account + 1
                total_online_time = total_online_time + info['total_online_time']
            print(info['total_online_time'])  
            #ret_data.append({"level":level, "task":task, "yindao":yindao, "zhiye":zhiye, "huazhao":huazhao,"roleList":len(info['roleList'])})
        except Exception:
            pass
    temp_time = 0
    row_data = {}
    if total_account > 0:
        temp_time = (total_online_time/60) / total_account
    row_data["total_account"] = total_account
    row_data["total_online_time"] = total_online_time
    row_data["average_time"] = int(temp_time)
    ret_data.append(row_data)
    return {"success":True, "total":ret_data}
    
def DelFeedback(db, feedback_id):
    if execute('DELETE FROM user_feedback WHERE id={0};'.format(feedback_id), db):
        return {"success":True}

def ViewException(db):
    data = query('select * from stat_exception order by amount desc, id limit 0,10;', db)
    ret_data = []
    for row in data:
        row_data = {}
        row_data["id"] = row[0]
        row_data["exception"] = row[2]
        row_data["message"] = row[3]
        row_data["account"] = row[4]
        row_data["amount"] = row[5]
        try:
            row_data["exception"] = row[2].decode('utf-8')
            row_data["message"] = row[3].decode('utf-8')
            row_data["account"] = row[4].decode('utf-8')
        except Exception as e:
            pass

        row_data["account"] = row_data["account"] or '未知'
        ret_data.append(row_data)
    return {"success":True, "data":ret_data}

def DelException(db, exception_id):
    if execute('DELETE FROM stat_exception WHERE id={0};'.format(exception_id), db):
        return {"success":True}

def RegisterStat(db, stat_type):
    stat_type = ("os", "device", "resolution")[int(stat_type)-1]
    ret_data = []
    data = query('SELECT count(*) FROM register_log;', db)
    total = data[0][0]
    data = query('SELECT {0},count(*) FROM register_log group by {0} order by count(*) desc limit 0,20;'.format(stat_type), db)
    sum_ = total
    for row in data:
        sum_ = sum_ - row[1]
        ret_data.append([row[0] or '未知', row[1]/total])
    if sum_!=0:
        ret_data.append(['其他', sum_/total])
    return {"success":True, "data":ret_data}

import random
import codecs
import time
codeRetained = 'data/codeRetained_code-1.json'
def readRetained():
    try:
        with codecs.open(codeRetained, 'r', 'utf-8') as f:
            return json.load(f, encoding="utf-8")
    except Exception:
        pass
    return []

def writeRetained(data):
    try:
        with open(codeRetained, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        traceback.print_exc()
        
#ALTER TABLE  `register_log` ADD INDEX (  `time` )
def view_retained(db, page):
    ret_data = readRetained()
    print(ret_data)
    return {"success":True, "total":7,"data":ret_data}
    '''print(db)
    db11 = get_game_servers()[0]
    print(db11)
    pagination = 3 #每页显示数量
    page = int(page)
    data = query('select count(*) from (SELECT * from register_log group by DATE(`time`)) T', db);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query("SELECT DATE(`time`),count(*) FROM register_log group by DATE(`time`) desc limit {0},{1};".format((page-1)*pagination, pagination), db);
        ret_data = []
        for row in data:
            next_days = [2,3,4,5,6,7,14,30,60,90]
            next_goal = [32,26,23,16,13,8,6,4,2,1]
            days_count = []
            for index, day in enumerate(next_days):
                day = day - 1
                if datetime.date.today()>=row[0] + datetime.timedelta(days=day):
                    data2 = query("SELECT count(DISTINCT account) FROM login_log where account in (select account from register_log where `time`>'{0}' and `time`<'{0}' + interval 1 day) and `time`>'{1}' and `time`<'{1}' + interval 1 day".format(row[0].strftime('%Y-%m-%d'), (row[0] + datetime.timedelta(days=day)).strftime('%Y-%m-%d')), db);
                    # print("SELECT count(DISTINCT account) FROM login_log where account in (select account from register_log where `time`>'{0}' and `time`<'{0}' + interval 1 day) and `time`>'{1}' and `time`<'{1}' + interval 1 day".format(row[0].strftime('%Y-%m-%d'), (row[0] + datetime.timedelta(days=day)).strftime('%Y-%m-%d')))
                    random.seed(row[1])
                    ratio = 1
                    if datetime.date.today()==row[0] + datetime.timedelta(days=day):
                        ratio = (datetime.datetime.now().hour + 1) / 24
                    want = int(next_goal[index] * row[1] / 100) + 1
                    real = data2[0][0]
                    if real<want:
                        delta = want - real
                        delta = random.randint(int(delta*0.6), int(delta*1.1))
                        real = real + int(delta * ratio)
                    # print(index, row[1], real, want, want/row[1])
                    print(real,row[1],real/row[1])
                    days_count.append(real/row[1])
                else:
                    days_count.append(0)
            # print(row[0].strftime('%Y-%m-%d'))
            # print(days_count)
            ret_data.append([row[0].strftime('%Y-%m-%d'), row[1], days_count[0], days_count[1], days_count[2], days_count[3], days_count[4], days_count[5], days_count[6], days_count[7], days_count[8], days_count[9]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":0}'''

import pickle
def Load(path):
    try:
        with open(path, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        pass
    return {}
def Dump(data, path):
    with open(path, 'wb') as f:
        pickle.dump(data, f)

AnalysisDumpFile = "data/analysis{0}.dat"

def Analysis(db, AnalysisType,dbid):
    data = Load(AnalysisDumpFile.format(dbid))
    if "time" not in data:
        return {"success":True, "time":"", "data":[]}
    
    if AnalysisType == '1':
        AnalysisType = "level"
    elif AnalysisType == '2':
        AnalysisType = "task"
    elif AnalysisType == '3':
        AnalysisType = "yindao"
    elif AnalysisType == '4':
        AnalysisType = "zhiye"
    elif AnalysisType == '5':
        AnalysisType = "huazhao"
    elif AnalysisType == '6':
        AnalysisType = "roleList"
    else:
        AnalysisType = "level"
    
    ret_data = []
    temp = {}
    for record in data["data"]:
        level = record[AnalysisType]
        if level in temp:
            temp[level] += 1
        else:
            temp[level] = 1
    for i in temp:
        ret_data.append([i, temp[i]])
    ret_data = sorted(ret_data, key=lambda x:x[0])
    return {"success":True, "time":data["time"], "data":ret_data}

def AnalysisGen(db,startdate,enddate,dbid):
    startDate= datetime.datetime.strptime(startdate+" 00:00:00",'%Y-%m-%d %H:%M:%S')
    endDate = datetime.datetime.strptime(enddate+" 23:59:59",'%Y-%m-%d %H:%M:%S')
    startInt,endInt = time.mktime(startDate.timetuple()),time.mktime(endDate.timetuple())

    dbdata = find_mongodb({"records._base_data.register_time":{"$gte":startInt,"$lte":endInt }},"player",db)
    #print(dbdata.count())
    ret_data = []
    if dbdata.count()==0:
        ret_data.append({"level":0})
    for record in dbdata:
        level = record['base']['level']
        ret_data.append({"level":level})
    data = {"data":ret_data, "time":startdate + " 至 " + enddate}
    Dump(data, AnalysisDumpFile.format(dbid))
    return {"success":True, "time":data["time"]}

def view_talk(db, page, content):
    pagination = 20 #每页显示数量
    page = int(page)
    data = query('select count(*) from talk_log where content like {0}'.format(escape("%"+content+"%")), db);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select * from talk_log where content like {0} order by id desc limit {1},{2};'.format(escape("%"+content+"%"), (page-1)*pagination, pagination), db)
        ret_data = []
        for row in data:
            ret_data.append([row[1], row[2], row[3].strftime('%Y-%m-%d %H:%M:%S')])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def viewPayStat(db, account, page):
    pagination = 10 #每页显示数量
    page = int(page)
    data = query('select count(*) from stat_pay where account={0}'.format(escape(account)), db);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select * from stat_pay where account={0} order by time desc limit {1},{2};'.format(escape(account), (page-1)*pagination, pagination), db)
        ret_data = []
        for row in data:
            ret_data.append([row[2], row[3], row[4], row[5].strftime('%Y-%m-%d %H:%M:%S')])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def viewBaseinfo(db, account, rolename):
    ret_data = {}
    try:
        data = query('select data from user where name={0};'.format(escape(account)), db)
        data = base64.b64decode(data[0][0])
        data = zlib.decompress(data)
        data = data.decode('utf-8')
        data = json.loads(data)
        ret_data["blue"] = data['diamond']

        if 'recharged_diamond' in data:
            ret_data["recharged"] = data['recharged_diamond']
        else:
            ret_data["recharged"] = 0
        for role in data['roleList']:
            if role["base"]["name"]==rolename:
                ret_data["level"] = role["base"]["lev"]
                ret_data["diamond"] = role["attribute"][0][6]
                ret_data["gold"] = role["attribute"][0][4]
                ret_data["chenghao"] = role["chenghao"]["id"]
                ret_data["vip"] = role["vip"]["level"]

        data = query('select * from register_log where account={0};'.format(escape(account)), db)
        ret_data["time"] = data[0][1].strftime('%Y-%m-%d %H:%M:%S')
        ret_data["device"] = data[0][2]
        ret_data["os"] = data[0][3]
    except Exception as e:
        pass
    return {"success":True, "data":ret_data}

def viewGoldStat(db, rolename, page):
    pagination = 10 #每页显示数量
    page = int(page)
    data = query('select count(*) from game_log where event_type="金币" and player_name={0}'.format(escape(rolename)), db);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select log_time,log_type,number from game_log where event_type="金币" and player_name={0} order by log_time desc limit {1},{2};'.format(escape(rolename), (page-1)*pagination, pagination), db)
        ret_data = []
        for row in data:
            ret_data.append([row[0].strftime('%Y-%m-%d %H:%M:%S'), row[1], row[2]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

#查询
def queryOrderlist(sql, db=None):
    try:
        con = pymysql.connect(user="star", passwd="star", host="127.0.0.1", db="entry", port=3306, charset='utf8')
        cur = con.cursor()
        cur.execute(sql)
        data = cur.fetchall()
        cur.close()
        con.close()
        return data
    except Exception as e:
        traceback.print_exc()
    return [] 
def viewOrderID(db, rolename, page):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]
    pagination = 10 #每页显示数量
    page = int(page)
    data = queryOrderlist('select count(*) from pay_stat where account={0}'.format(escape(rolename)), db);
    print(data)
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = queryOrderlist('select time,platform,amount,diamond,OrderSerial from pay_stat where account={0} order by time desc limit {1},{2};'.format(escape(rolename), (page-1)*pagination, pagination), db)
        ret_data = []
        for row in data:
            print(row[3])
            ret_data.append([row[0].strftime('%Y-%m-%d %H:%M:%S'), row[1], row[2],row[3],row[4]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def viewConsignment(db, rolename, page):
    pagination = 10 #每页显示数量
    page = int(page)
    data = query('select count(*) from consignment_log where role={0}'.format(escape(rolename)), db);
    total = data[0][0]

    with open('json/item.json', 'rb') as json_data:
        item = json.loads(json_data.read().decode('utf-8'))

    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select time,item_id,amount,unit_price,final,buy from consignment_log where role={0} order by time desc limit {1},{2};'.format(escape(rolename), (page-1)*pagination, pagination), db)
        ret_data = []
        for row in data:
            ret_data.append([row[0].strftime('%Y-%m-%d %H:%M:%S'), item[str(row[1])], row[2], row[3], row[4], row[5]])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def CloneUser(db, account):
    data = query('select data from user where name={0};'.format(escape(account)), db)
    if len(data)!=1:
        return {"success":False, "message":"没有找到此玩家数据"}
    data = "REPLACE INTO `user` (`id`, `name`, `password`, `data`) VALUES (NULL, 'test', 'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff', '{0}');".format(data[0][0])
    return {"success":True, "data":data}
    


db_operator = {"view_open_ui_log":view_open_ui_log,"view_ride_log":view_ride_log,"view_machine_log":view_machine_log,"view_soldier_log":view_soldier_log,"view_hero_log":view_hero_log,"view_task_stat":view_task_stat,"view_area_stat":view_area_stat,"view_sold_prop":view_sold_prop,"view_add_sub_prop":view_add_sub_prop,"view_steel_stone":view_steel_stone,"view_forage":view_forage,"view_forage":view_forage,"view_copper_coin":view_copper_coin,"view_role_duration":view_role_duration,"view_login_logout":view_login_logout,"view_force_db_data":view_force_db_data,"search_force_info":search_force_info,"search_force_name":search_force_name,"search_force_id":search_force_id,"search_king_id":search_king_id,"search_id":search_id,"search_account":search_account, "search_role":search_role, "read_role":read_role, "view_role_db_data":view_role_db_data, "ViewFeedback":ViewFeedback, "DelFeedback":DelFeedback,
    "ViewException":ViewException, "DelException":DelException, "RegisterStat":RegisterStat, "view_retained":view_retained,
    "AnalysisGen":AnalysisGen, "Analysis":Analysis, "view_talk":view_talk, "viewPayStat":viewPayStat,
    "viewBaseinfo":viewBaseinfo, "viewGoldStat":viewGoldStat, "view_exp_stat":view_exp_stat,"viewOrderID":viewOrderID, "viewConsignment":viewConsignment, "CloneUser":CloneUser, "search_time":search_time, "search_card":search_card,
    "ViewFillOrder":ViewFillOrder,
    #"QADownload":QADownload
}

# 处理消息
def handle(db, cmd, params):
    if cmd == "QADownload":
        return QADownload(db,*params)

    if cmd == "searchGamelog":
        return searchGamelog(db,*params)
    if cmd in db_operator:
        return db_operator[cmd](db, *params)
    return {"success":False, "message":"不支持此命令1"}


#设置相关
def user_list():
    ret_data = []
    sql = {}
    cursor_data = find_mongodb(sql)
    for row in cursor_data:
        ret_data.append({'user':row["name"], 'pass':row["pass"], 'auth':row["authority"]})
    return {"success":True, "data":ret_data}

def user_add(username, password, auth):
    sql = {}
    sql["name"] = username
    sql["pass"] = password
    sql["authority"] = auth
    # print(username, password, auth)
    data = find_one_mongodb({"name":username})
    if data:
        return {"success":False,"message":"用户名"+username+"已经存在，请使用其它用户名！"}
    if insert_one_mongodb(sql): 
        return {"success":True,"message":"成功添加"+username+"用户信息!"}

def user_modify(username, new_pass, new_auth):
    condition = {"name":str(username)}
    modification = {"$set":{"pass":str(new_pass),"authority":new_auth}}
    data = find_one_mongodb({"name":username})
    old_pass = data["pass"]
    old_auth = data["authority"]
    if old_pass == new_pass and old_auth == new_auth:
        return{"success":False,"type":"info", "message":"您未对"+username+"用户做任何修改!"}
    if update_mongodb(condition,modification):
        return {"success":True,"message":"成功修改"+username+"的用户信息!"}

def user_remove(username):
    sql = {"name":username}
    if remove_mongodb(sql):    
        return {"success":True,"message":"您已成功删除"+username+"的用户信息!"}
  
def view_log(page):
    pagination = 20 #每页显示数量
    page = int(page)
    sql = {}
    total = find_mongodb(sql,"log").count()
    game_servers = get_game_servers()
    print(game_servers)
    if total!=0:
        total = math.ceil(float(total)/pagination)
        cursor_data = find_mongodb({},"log").skip((page-1)*pagination).limit(pagination).sort("time",-1)        
        ret_data = []
        for row in cursor_data:
            server = int(row["server"])
            try:
                if server==-1:
                    server=""
                else:
                    server = game_servers[int(row["server"])]["name"]
            except Exception:
                pass
            ret_time = row["time"].strftime('%Y-%m-%d %H:%M:%S')
            ret_data.append([row["user"], row["operation"], server,row["parameters"][0:200],ret_time])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def upload_config(path, content):
    with open("json/"+path, 'wb') as f:
        f.write(content.encode("utf8"))
    return {"success":True}

def getPay():
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]

    #总额
    data = query('SELECT IFNULL(sum(amount)/1.5, 0) FROM pay_stat', db_info)
    total = int(data[0][0])

    #充值用户数
    data = query('SELECT count(DISTINCT account) FROM pay_stat', db_info)
    count = data[0][0]

    #总注册用户
    reg = "未知"
    try:
        game_servers = get_game_servers()
        servers = ["SELECT count(*) cnt FROM %s.user" % server["db"] for server in game_servers]
        data = query('SELECT SUM(cnt) FROM (%s) T' % (" UNION ALL ".join(servers)), db_info)
        reg = int(data[0][0])
    except:
        pass

    #平台
    platform = []
    data = query('SELECT platform, sum(amount)/1.5  FROM pay_stat group by platform ORDER BY sum(amount)/1.5 DESC', db_info)
    for row in data:
        platform.append([row[0], int(row[1])])

    return {"success":True, "total":total, "count":count, "reg":reg, "platform":platform}

def PayDownload():
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]

    data = query('SELECT platform,zone,amount,account,time FROM pay_stat', db_info)
    
    csv = [ "%s,%d,%d,%s,%s" % (row[0], row[1], row[2]/1.5, row[3], row[4].strftime('%Y-%m-%d %H:%M:%S')) for row in data ]
    csv = "平台,服务器,金额,用户,时间\r\n" + "\r\n".join(csv)
    csv = b"\xEF\xBB\xBF"+csv.encode('utf-8')
    csv = base64.b64encode(csv).decode('utf8')
    return {"success":True, "data":csv}


def shopListDownload(condition):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    where_statement = "where "
    if condition["zone"]!='0':
        where_statement += "server='{0}' and ".format(condition["zone"])
    if condition["role"]!='':
        #where_statement += "upper(role) LIKE upper({0}) and ".format(escape("%"+condition["role"]+"%"))
        where_statement += "role={0} and ".format(escape(condition["role"]))
    if condition["item"]!='':
        where_statement += "item='{0}' and ".format(condition["item"])
    if condition["type"]!='':
        where_statement += "type='{0}' and ".format(condition["type"])
    where_statement += "1=1"

    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))
    data =query('select server,role,item,amount,type,value,level,time from shop_log {0}'.format(where_statement),db_info)

    csv = [ "%d,%s,%s,%d,%s,%d,%d,%s" % (row[0], row[1], row[2], row[3], row[4],row[5],row[6],row[7].strftime('%Y-%m-%d %H:%M:%S')) for row in data ]
    csv = "区,角色,购买物品,数量,花费,金额,等级,时间\r\n"+"\r\n".join(csv)
    csv = b"\xEF\xBB\xBF"+csv.encode('utf-8')
    csv = base64.b64encode(csv).decode('utf8')
    return {"success":True, "data":csv}

def computePlayer(s):
    spl = s.split('<?>')
    str = ""
    for i in spl:
        i=i.replace('\n','')
        i=i.replace(',',';')
        return i
    return ""
    
def computeGM(s):
    spl = s.split('<?>')
    str = ""
    index = 0
    for i in spl:
        i=i.replace('\n','')
        i=i.replace(',',';')
        if index > 0:
            str = str + "GM:" + i
        index = index + 1
    return str
def QADownload(db,param):
    print(param)
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]

    data = query('SELECT name,data,device,os,time,account FROM user_feedback', db)

    csv = [ "%s,%s,%s,%s,%s,%s,%s" % (row[0], computePlayer(row[1]),computeGM(row[1]), row[2], row[3], row[4].strftime('%Y-%m-%d %H:%M:%S'),row[5]) for row in data ]
    csv = "角色名,内容,GM内容,设备,系统,时间,账号\r\n" + "\r\n".join(csv)
    csv = b"\xEF\xBB\xBF"+csv.encode('utf-8')
    csv = base64.b64encode(csv).decode('utf8')
    
    return {"success":True, "data":csv}

 
def view_payrank(page):
    pagination = 10 #每页显示数量

    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]

    page = int(page)
    data = query('select count(*) from (select * from pay_stat group by account,zone) T', db_info);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select account,zone,sum(amount)/1.5 from pay_stat group by account,zone order by sum(amount) desc limit {0},{1};'.format((page-1)*pagination, pagination), db_info)
        ret_data = []
        for row in data:
            ret_data.append([row[0], row[1], int(row[2])])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def income(zone, startdate, enddate):
    zone = int(zone)
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = db_info["database"]

    platforms = {}
    """
    {
        "uc":
        {
            "register":0,
            "active":0,
            "recharge":0,
            "amount":0,
        }
    }
    """

    game_servers = get_game_servers()

    #新增用户
    if zone==0:
        #全部服务器
        try:
            servers = ["SELECT platform,count(platform) cnt FROM(SELECT substring_index(name, '_', 1) as platform FROM  %s.user WHERE `registerTime`>'%s' and `registerTime`<'%s' + interval 1 day) V group by platform" % (server["db"], startdate, enddate) for server in game_servers]
            data = query('SELECT platform, SUM(cnt) FROM (%s) T group by platform' % (" UNION ALL ".join(servers)), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["register"] = int(i[1])
        except:
            pass
    else:
        try:
            data = query("SELECT platform,count(platform) cnt FROM(SELECT substring_index(name, '_', 1) as platform FROM  %s.user WHERE `registerTime`>'%s' and `registerTime`<'%s' + interval 1 day) V group by platform" % (game_servers[zone - 1]["db"], startdate, enddate), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["register"] = int(i[1])
        except:
            pass

    #活跃用户
    if zone==0:
        #全部服务器
        try:
            servers = ["SELECT platform,count(platform) cnt FROM(select substring_index(account, '_', 1) as platform FROM(SELECT DISTINCT account FROM  %s.login_log WHERE `time`>'%s' and `time`<'%s' + interval 1 day) U ) V group by platform" % (server["db"], startdate, enddate) for server in game_servers]
            data = query('SELECT platform, SUM(cnt) FROM (%s) T group by platform' % (" UNION ALL ".join(servers)), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["active"] = int(i[1])
        except:
            pass
    else:
        try:
            data = query("SELECT platform,count(platform) cnt FROM(select substring_index(account, '_', 1) as platform FROM(SELECT DISTINCT account FROM  %s.login_log WHERE `time`>'%s' and `time`<'%s' + interval 1 day) U ) V group by platform" % (game_servers[zone - 1]["db"], startdate, enddate), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["active"] = int(i[1])
        except:
            pass

    #充值人数
    if zone==0:
        #全部服务器
        try:
            data = query("SELECT substring_index(platform, '_', 1), count(DISTINCT account) FROM pay_stat WHERE DATE(`time`)>='%s' and DATE(`time`)<='%s' group by substring_index(platform, '_', 1)" % (startdate, enddate), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["recharge"] = int(i[1])
        except:
            pass
    else:
        try:
            data = query("SELECT substring_index(platform, '_', 1), count(DISTINCT account) FROM pay_stat WHERE DATE(`time`)>='%s' and DATE(`time`)<='%s' and zone='%s' group by substring_index(platform, '_', 1)" % (startdate, enddate, zone), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["recharge"] = int(i[1])
        except:
            pass


    #充值金额
    if zone==0:
        #全部服务器
        try:
            data = query("SELECT substring_index(platform, '_', 1), sum(amount)/1.5 FROM pay_stat WHERE DATE(`time`)>='%s' and DATE(`time`)<='%s' group by substring_index(platform, '_', 1)" % (startdate, enddate), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["amount"] = int(i[1])
        except:
            pass
    else:
        try:
            data = query("SELECT substring_index(platform, '_', 1), sum(amount)/1.5 FROM pay_stat WHERE DATE(`time`)>='%s' and DATE(`time`)<='%s' and zone='%s' group by substring_index(platform, '_', 1)" % (startdate, enddate, zone), db_info)
            for i in data:
                if i[0] not in platforms:
                    platforms[i[0]] = {}
                    for param in ["register", "active", "recharge", "amount"]:
                        platforms[i[0]][param] = 0
                platforms[i[0]]["amount"] = int(i[1])
        except:
            pass

    platforms["total"] = {}
    for param in ["register", "active", "recharge", "amount"]:
        platforms["total"][param] = 0

    for platform in platforms:
        if platform!="total":
            for param in platforms[platform]:
                platforms["total"][param] += platforms[platform][param]

    ret_data = []
    for platform in platforms:
        if platform!="total":
            ret_data.append([platform, platforms[platform]["register"], platforms[platform]["active"], platforms[platform]["recharge"], platforms[platform]["amount"]])

    for platform in platforms:
        if platform=="total":
            ret_data.append([platform, platforms[platform]["register"], platforms[platform]["active"], platforms[platform]["recharge"], platforms[platform]["amount"]])
            break

    return {"success":True, "data":ret_data}

def searchGamelog( page, condition):
    
    pagination = 20 #每页显示数量
    #获取服务器列表
    with open('data/servers.json', 'rb') as json_data:
        server = json.loads(json_data.read().decode('utf-8'))
                
    index = 1
    local_db = ""
    #在所有的服务器中寻找开放的服务器
    serverID = condition["zone"]
    
    for ser in server:
        if index==int(serverID):
            local_db = ser["db"]
            break
        else:
            index = index + 1
        
        
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = local_db

    
    page = int(page)

    where_statement = "where "
    #if condition["zone"]!='0':
    #    where_statement += "server='{0}' and ".format(condition["zone"])
    if condition["player_name"]!='':
        where_statement += "upper(player_name) LIKE upper({0}) and ".format(escape("%"+condition["player_name"]+"%"))
        #where_statement += "player_name='{0}' and ".format(escape(condition["player_name"]))
    #if condition["event_type"]!='':
    #    where_statement += "event_type='{0}' and ".format(condition["event_type"])
    if condition["log_type"]!='':
        where_statement += "log_type='{0}' and ".format(condition["log_type"])
    #if condition["data1"]!='':
    #    where_statement += "data1='{0}' and ".format(condition["data1"])
    where_statement += "1+1"
    
    print(where_statement)
    with open('json/item.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))
    
    data = query('select count(*) from game_log {0}'.format(where_statement),db_info);
    total = data[0][0]
    #判断一下
    if len(data):
       total = data[0][0]
    else:
        return ("false")
    len(data)
    #报错list会越界
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select  player_name, data1,  event_type, log_type, number, player_level, log_time  from  game_log {0} order by log_time desc limit {1},{2};'.format(where_statement, (page-1)*pagination, pagination),db_info)
        ret_data = []
        for row in data:
            data1name = row[1]
            try:
                data1name = shop[str(row[1])]
            except:
                pass
            value = row[4]
            if str(row[2]).find("消耗") > 0:
                value = "-"+str(row[4])
            if str(row[2]).find("增加") > 0: 
                value = "+"+str(row[4])
            ret_data.append([ row[0], data1name, row[2], row[3], value, row[5], row[6].strftime('%Y-%m-%d %H:%M:%S')])
        return {"success":True, "total":total, "data":ret_data}     
    return {"success":True, "total":total}  
    
def searchlog( page, condition):
    
    pagination = 20 #每页显示数量
    #获取服务器列表
    with open('data/servers.json', 'rb') as json_data:
        server = json.loads(json_data.read().decode('utf-8'))
                
    index = 0
    local_db = ""
    serverID = ""
    #在所有的服务器中寻找开放的服务器
    dataID = ""
    for dataID, item in enumerate(server):
        if dataID!="":
             serverID=dataID
             break
   
    for ser in server:
        if index==serverID:
            local_db = ser["db"]
            break
        else:
            index = index + 1
        
        
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = local_db

    
    page = int(page)

    where_statement = "where "
    #if condition["zone"]!='0':
    #    where_statement += "server='{0}' and ".format(condition["zone"])
    if condition["player_name"]!='':
        where_statement += "upper(player_name) LIKE upper({0}) and ".format(escape("%"+condition["player_name"]+"%"))
        #where_statement += "player_name='{0}' and ".format(escape(condition["player_name"]))
    if condition["event_type"]!='':
        where_statement += "event_type='{0}' and ".format(condition["event_type"])
    if condition["log_type"]!='':
        where_statement += "log_type='{0}' and ".format(condition["log_type"])
    if condition["data1"]!='':
        where_statement += "data1='{0}' and ".format(condition["data1"])
    where_statement += "1+1"
    

    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))
        
    data = query('select count(*) from game_log {0}'.format(where_statement),db_info);
    total = data[0][0]
    #判断一下
    #if len(data):
    #   total = data[0][0]
    #else:
     #   return ("false")
    #len(data)
    #报错list会越界
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select  player_name, data1,  event_type, log_type, number, player_level, log_time  from  game_log {0} order by log_time desc limit {1},{2};'.format(where_statement, (page-1)*pagination, pagination),db_info)
        ret_data = []
        for row in data:
            data1name = row[1]
            try:
                data1name = shop[str(row[1])]
            except:
                pass
            value = row[4]
            if str(row[2]).find("消耗") > 0:
                value = "-"+str(row[4])
            if str(row[2]).find("增加") > 0: 
                value = "+"+str(row[4])
            ret_data.append([ row[0], data1name, row[2], row[3], value, row[5], row[6].strftime('%Y-%m-%d %H:%M:%S')])
        return {"success":True, "total":total, "data":ret_data}     
    return {"success":True, "total":total}  

def searchshop(page, condition):
    pagination = 20 #每页显示数量

    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    page = int(page)

    where_statement = "where "
    if condition["zone"]!='0':
        where_statement += "server='{0}' and ".format(condition["zone"])
    if condition["role"]!='':
        #where_statement += "upper(role) LIKE upper({0}) and ".format(escape("%"+condition["role"]+"%"))
        where_statement += "role={0} and ".format(escape(condition["role"]))
    if condition["item"]!='':
        where_statement += "item='{0}' and ".format(condition["item"])
    if condition["type"]!='':
        where_statement += "type='{0}' and ".format(condition["type"])
    where_statement += "1=1"

    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))

    data = query('select count(*) from shop_log {0}'.format(where_statement), db_info);
    total = data[0][0]
    if total!=0:
        total = math.ceil(float(total)/pagination)
        data = query('select server,role,item,amount,type,value,level,time from shop_log {0} order by time desc limit {1},{2};'.format(where_statement, (page-1)*pagination, pagination), db_info)
        ret_data = []
        for row in data:
            itemname = row[2]
            try:
                itemname = shop[str(row[2])]
            except:
                pass
            ret_data.append([row[0], row[1] ,itemname, row[3], row[4], row[5], row[6], row[7].strftime('%Y-%m-%d %H:%M:%S')])
        return {"success":True, "total":total, "data":ret_data}
    return {"success":True, "total":total}

def consume(zone, startdate, enddate, type):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    game_servers = get_game_servers()

    where_statement = "where "
    if zone!='0':
        where_statement += "server='{0}' and ".format(zone)
    if type!='':
        where_statement += "type='{0}' and ".format(type)
    where_statement += "`time`>'{0}' and `time`<'{1}' + interval 1 day".format(startdate, enddate)

    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))

    data = query('select type, `from`, SUM(value) from generic_log {0} GROUP BY type,`from` ORDER BY type,SUM(value) DESC '.format(where_statement), db_info)
    ret_data = []
    for row in data:
        ret_data.append([row[0], row[1], str(row[2])])
    return {"success":True, "data":ret_data}

def Shop(zone, startdate, enddate, type, froms ):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    game_servers = get_game_servers()

    where_statement = "where "
    if zone!='0':
        where_statement += "server='{0}' and ".format(zone)
    if type!='':
        where_statement += "type='{0}' and ".format(type)
    if froms!='':
        where_statement += "`from`='{0}' and ".format(froms)
        
    where_statement += "`time`>'{0}' and `time`<'{1}' + interval 1 day".format(startdate, enddate)
    #where_statement += "1=1"
        
    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))

    data = query('select item,  SUM(amount), type, SUM(value), `from`  from shop_log {0} GROUP BY item  ORDER BY type, SUM(value) DESC '.format(where_statement), db_info)
    ret_data = []
    for row in data:
        itemname = row[0]
        try:
            itemname = shop[str(row[0])]
        except:
            pass
        ret_data.append([itemname, str(row[1]), row[2], str(row[3]), row[4]])
    return {"success":True, "data":ret_data}

#剩余量的分析（数据库查询）     
def view_remained(zone, startdate, enddate, type):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    game_servers = get_game_servers()

    where_statement = "where "
    if zone!='0':
        where_statement += "server='{0}' and ".format(zone)
    where_statement += "`time`>'{0}' and `time`<'{1}' + interval 1 day".format(startdate, enddate)
        #where_statement += "1=1"
        
    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))
        
    #加判断
    if type=='1':
        data = query('select  blueDiamondConsume, blueDiamondOutput, blueDiamond, time  from  currency_remain_log {0}  ORDER BY time DESC '.format(where_statement), db_info)
    elif type=='2':
        data = query('select  goldCoinConsume, goldCoinOutput, goldCoin, time  from currency_remain_log {0}  ORDER BY time DESC '.format(where_statement), db_info)
    elif type=='3':
        data = query('select  purpleDiamondConsume, purpleDiamondOutput, purpleDiamond, time  from currency_remain_log {0}  ORDER BY time DESC '.format(where_statement), db_info)
        
    ret_data = []
    for row in data:
        ret_data.append([row[0], row[1], row[2], row[3].strftime('%Y-%m-%d')])
    return {"success":True, "data":ret_data}

#月卡分析（收入分析） 
def month_card(zone, startdate, enddate):
    db_info = json.loads(install.ZMQSend("get_db_info", []))
    db_info["sourcename"] = "log"

    game_servers = get_game_servers()

    where_statement = "where "
    if zone!='0':
        where_statement += "server='{0}' and ".format(zone)
    where_statement += "`time`>'{0}' and `time`<'{1}' + interval 1 day".format(startdate, enddate)
        #where_statement += "1=1"
        
    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))
    #玩家购买月卡总量
    data = query('SELECT count(*) as ctt FROM month_card_log '.format(where_statement), db_info)
    cnt = 0
    cntt = 0
    for row in data:
        cnt = row[0]
    
    #有效月卡数量
    data = query('SELECT count(*)  as cnt FROM month_card_log where overtime > now()'.format(where_statement), db_info)
    for row in data:
        cntt = row[0]
    
    ret_data = []
    #for row in data:
    ret_data.append([cnt,cntt])
    return {"success":True, "data":ret_data}
    

setting_operator = {"view_add_item_log":view_add_item_log,"view_player_login_log":view_player_login_log,"view_server_info":view_server_info,"view_daily_count":view_daily_count,"download_reg_log":download_reg_log,"view_reg_log":view_reg_log,"user_list":user_list, "user_add":user_add, "user_modify":user_modify, "user_remove":user_remove, "view_log":view_log,
    "upload_config":upload_config, "getPay":getPay, "PayDownload":PayDownload, "view_payrank":view_payrank,
    "income":income,  "searchlog":searchlog ,"searchshop":searchshop, "consume":consume, "Shop":Shop, "view_remained":view_remained, "month_card":month_card,"ViewFillOrder":ViewFillOrder,"getOfflineDbData":getOfflineDbData,
    "QADownload":QADownload,"searchGamelog":searchGamelog
    }

def setting_handle(cmd,params):
    if cmd in setting_operator:
        return setting_operator[cmd](*params)
    return {"success":False, "message":"不支持此命令"}




#######################5/10 Mongo数据库操作###########################
def collectMongo(mongo_cmd,col_name,db):
    # admin_db = conn["admin"]
    # admin_db.authenticate("root","root") 
    conn = pymongo.MongoClient(db["mongo_uri"])
    db_list = conn.database_names()
    if db["db_name"] in db_list:
        conn_db = conn[db["db_name"]]
    else:
        print("Warning Message:未找到数据库==>>>", db["db_name"])
        conn.close()
        return "Mongodb Collect Fail"
    col_list = conn_db.collection_names()
    # print(conn.server_info(),db_list,col_list)
    if col_name in col_list:
        conn_col = conn_db[col_name]
        return conn_col
    else:
        print("Warning Message:未找到聚集(数据表)==>>>",col_name,)
        conn.close()
        return "Mongodb Collect Fail"


# 查询 [find_one]
def findOneMongodb(sql={}, col_name = "user", db = None):
    # 选择数据库
    if not db:
        db = getDbInfo()["oz_manage"]
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        conn_col = collectMongo(conn,col_name,db)
        if conn_col != "Mongodb Collect Fail":
            data = conn_col.find_one(sql)
            conn.close()
            return data
        else:
            return "无数据"
    except Exception as e:
        traceback.print_exc()
    return False


# 查询[find]
def findMongodb(sql={}, col_name = "user", db = None):

    # 选择数据库
    if not db:
        db = getDbInfo()["oz_manage"]
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        conn_col = collectMongo(conn,col_name,db)
        if conn_col != "Mongodb Collect Fail":
            data = conn_col.find(sql)
            conn.close()
            return data
        else:
            return "无数据"
    except Exception as e:
        traceback.print_exc()
    return False


# 执行修改
def updateMongodb(condition={}, modification={}, col_name = "user", db = None ):
    # 选择数据库
    if not db:
        db = getDbInfo()["oz_manage"]
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        conn_col = collectMongo(conn,col_name,db)
        if conn_col != "Mongodb Collect Fail":
            conn_col.update(condition,modification)
            conn.close()
            return True
        else:
            return False
    except Exception as e:
        traceback.print_exc()
    return False


# 执行插入
def insertOneMongodb(sql, col_name = "user", db = None):
    if not isinstance(sql, dict):
        print("ERROR，插入的内容不是字典格式！")
        return False
    # 选择数据库
    if not db:
        db = getDbInfo()["oz_manage"]
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        conn_col = collectMongo(conn,col_name,db)
        if conn_col == "Mongodb Collect Fail":
            return False
        else:
            conn_col.insert_one(sql)
            conn.close()
            return True
    except Exception as e:
        traceback.print_exc()
    return False


# 删除记录
def removeMongodb(sql,col_name = "user",db = None ):
    # if type(sql) is not dict:
    if not isinstance(sql, dict):
        print("ERROR,提供的删除条件不是字典格式！")
        return False
    # 选择数据库
    if not db:
        db = getDbInfo()["oz_manage"]
    try:
        conn = pymongo.MongoClient(db["mongo_uri"])
        conn_col = collectMongo(conn,col_name,db)
        if conn_col == "Mongodb Collect Fail":
            return False
        else:
            conn_col.remove(sql)
            conn.close()
            return True
    except Exception as e:
        traceback.print_exc()
    return False