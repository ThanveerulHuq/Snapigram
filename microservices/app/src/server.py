from src import app
from flask import jsonify, request, render_template,make_response,request
import requests
import json
import base64

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024


signup_url = "https://auth.derogation85.hasura-app.io/v1/signup"
data_url = "https://data.derogation85.hasura-app.io/v1/query"
login_url ="https://auth.derogation85.hasura-app.io/v1/login"
filestore_url= "https://filestore.derogation85.hasura-app.io/v1/file"
userinfo_url= "https://auth.derogation85.hasura-app.io/v1/user/info"
auth_headers = {"Content-Type": "application/json"}
data_headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer b317a855176fed910c37855eccef518d7a19e7f6342ca088"
}
@app.route('/')
def index():
    return "<h1>Hello World - Thanveer</h1>"

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    request_json = request.get_json(silent=True)
    print(request_json['user_name'])
    res = add_user_auth(request_json)
    if('error' in res):
        return jsonify(error=res['error'])
    else:
        print(jsonify(user=add_user_data(request_json)))
        return jsonify(res)

def add_user_data(user):
    query= {
        "type": "insert",
        "args":{
            "table":"users",
            "objects":[
                {"name": user['name'],"user_name": user['user_name'] ,"email_id":user['email_id'],"mobile_no":user['mobile_no'],"age":user['age']}
            ],
            "returning":["user_id"]
        }
    }
    resp = requests.request("POST", data_url, data=json.dumps(query), headers=data_headers)
    response = resp.content
    jsonResponse = json.loads(response.decode('utf-8'))
    print(jsonResponse)
    return jsonResponse
    

def add_user_auth(user):
    query = {
    "provider": "username",
    "data": {
    "username": user['user_name'],
    "password": user['password']
    }
    }
    resp = requests.request("POST", signup_url, data=json.dumps(query), headers=auth_headers)
    response = resp.content
    jsonResponse = json.loads(response.decode('utf-8'))
    print(jsonResponse)
    # print(jsonResponse['code'])
    if('code' in jsonResponse):
        return jsonResponse['message']
    else:
        auth_token= jsonResponse['auth_token']
        username= jsonResponse['username']
        print(auth_token)
        return {'auth_token':auth_token,'username':username}


@app.route('/login',methods = ['POST'])
def login():
    print('hello')
    request_json = request.get_json(silent=True)
    if('user_name' in request_json):
        requestPayload = {
            "provider": "username",
		    "data": {
            "username": request_json["user_name"],
            "password": request_json["password"]
            }
            }
        resp = requests.request("POST", login_url, data=json.dumps(requestPayload), headers=auth_headers)
        response = resp.content
        jsonResponse = json.loads(response.decode('utf-8'))
        return jsonify(user=jsonResponse)
    # else:
    #     return "username or password not valid"
		
		
		
		
		
@app.route('/uploadImage', methods=['POST'])
def upload():
    request_json = request.get_json(silent=True)
    file = request_json['file']
    starter = file.find(',')
    image_data = file[starter + 1:]
    image_data = bytes(image_data, encoding="ascii")
    with open("imageToSave.png", "wb") as fh:
        fh.write(base64.decodebytes(image_data))
        resp = requests.post(filestore_url, data=base64.decodebytes(image_data), headers=data_headers)
        response = resp.content
        json_response = json.loads(response.decode('utf-8'))
        return json.dumps({'filekey': json_response['file_id']})



@app.route('/uploadPost', methods=['POST'])
def upload_post():
    request_json = request.get_json(silent=True)
    auth_token=request.headers.get('Auth')
    user_name = auth_user(auth_token)
    user_id = 0
    if(user_name != 0):
        user_id = get_userid(user_name)
    print(request_json)
    file_key = request_json['file_key']
    # user_name=request_json['user_name']
    descr = request_json['descr']
    tags_string=request_json['tags']
    query= {
        "type": "insert",
        "args":{
            "table":"user_post",
            "objects":[
                {"image_url": file_key ,"created_by": user_id ,"description": descr}
            ],
            "returning":["post_id"]
        }
    }
    resp = requests.request("POST", data_url, data=json.dumps(query), headers=data_headers)
    response = resp.content
    jsonResponse = json.loads(response.decode('utf-8'))
    post_id= jsonResponse['returning'][0]['post_id']
    tag_added=add_tags(tags_string,post_id)
    if(tag_added):
        return "success"
    else:
        return "upload failed"


@app.route('/getPosts', methods=['POST'])
def get_post():
    request_json = request.get_json(silent=True)
    post_id = request_json["post_id"]
    return get_posts(post_id)
	
@app.route('/postwithimage', methods=['POST'])
def post_image():
    request_json = request.get_json(silent=True)
    auth_token = request.headers.get('Auth')
    user_name = auth_user(auth_token)
    user_id = 0
    if (user_name != None):
        user_id = get_userid(user_name)
    file_key = uploadimage(request_json['file'])
    descr = request_json['descr']
    tags_string = request_json['tags']
    query = {
        "type": "insert",
        "args": {
            "table": "user_post",
            "objects": [
                {"image_url": file_key, "created_by": user_id, "description": descr}
            ],
            "returning": ["post_id"]
        }
    }
    resp = requests.request("POST", data_url, data=json.dumps(query), headers=data_headers)
    response = resp.content
    jsonResponse = json.loads(response.decode('utf-8'))
    if 'returning' not in jsonResponse:
        return jsonResponse
    post_id = jsonResponse['returning'][0]['post_id']
    tag_added = add_tags(tags_string, post_id)
    if (tag_added):
        return "success"
    else:
        return "upload failed"


def add_tags(tag_string,post_id):
    post_tag_ids=[]
    tags = tag_string.split('|')
    for tag in tags:
        print(tag)
        requestPayload = {
            "type": "select",
            "args": {
                "table": "user_tags",
                "columns": ["tag_id"],
                "where": {
                    "tag_name": tag
                }
            }
        }
        resp = requests.request("POST", data_url, data=json.dumps(requestPayload), headers=data_headers)
        json_res = decode_json(resp)
        if(len(json_res) > 0):
            tag_id = json_res[0]['tag_id']
        else:
            requestPayload1 = {
                "type": "insert",
                "args": {
                    "table": "user_tags",
                    "objects": [
                        {
                            "tag_name": tag,
                            "created_by": 1
                        }
                    ],
                    "returning": [
                        "tag_id"
                    ]
                }
            }
            resp1 = requests.request("POST", data_url, data=json.dumps(requestPayload1), headers=data_headers)
            tag_id= decode_json(resp1)['returning'][0]['tag_id']
            print('tag_id:'+str(tag_id))

        requestPayload2= {
            "type": "insert",
            "args":{
                "table":"post_tags",
                "objects":[
                    {"post_id":post_id ,"tag_id": tag_id}
                ],
                "returning":["post_tag_id"]
            }
        }
        resp2 = requests.request("POST", data_url, data=json.dumps(requestPayload2), headers=data_headers)
        response = decode_json(resp2)['returning'][0]['post_tag_id']
        print(response)
        post_tag_ids.append(response)
    if(len(post_tag_ids) > 0):
        return True
    else:
        return False

def decode_json(response):
    response = response.content
    json_response = json.loads(response.decode('utf-8'))
    return json_response

def get_posts(post_id):
    query = { 
        "type":"select",
        "args": {
            "table": "user_post",
            "columns": ["*"],
            "where": {"post_id": {"$lt":post_id}},
            "limit":"5",
            "order_by": "-post_id"
        }
    }
    resp = requests.request("POST", data_url, data=json.dumps(query), headers=data_headers)
    json_res = decode_json(resp)
    print(json_res)
    # posts=[]
    for i in range(len(json_res)):
        json_res[i]['created_by']=get_username(json_res[i]['created_by'])
    return jsonify(posts=json_res)

def get_userid(username):
    requestPayload = {
    "type": "select",
    "args": {
        "table": "users",
        "columns": [
            "*"
        ],
        "where": {
            "user_name": username
        },
        "limit": "1"
    }
    }
    resp1 = requests.request("POST", data_url, data=json.dumps(requestPayload), headers=data_headers)
    response1 = resp1.content
    jsonResponse1= json.loads(response1.decode('utf-8'))
    print(jsonResponse1)
    return jsonResponse1[0]['user_id']



def auth_user(auth_token):
    if(auth_token != ''):
         info_headers = {
             "Content-Type": "application/json",
             "Authorization": "Bearer "+auth_token
             }
         resp = requests.request("GET", userinfo_url, headers=info_headers)
         response = resp.content
         jsonResponse = json.loads(response.decode('utf-8'))
         if 'username' in jsonResponse:
             return jsonResponse['username']
         else:
             return 0
    else:
        return 0
def get_username(user_id):
    requestPayload = {
    "type": "select",
    "args": {
        "table": "users",
        "columns": [
            "*"
        ],
        "where": {
            "user_id": user_id
        },
        "limit": "1"
    }
    }
    resp1 = requests.request("POST", data_url, data=json.dumps(requestPayload), headers=data_headers)
    response1 = resp1.content
    jsonResponse1= json.loads(response1.decode('utf-8'))
    return jsonResponse1[0]['user_name']
	
def uploadimage(file):
    starter = file.find(',')
    image_data = file[starter + 1:]
    image_data = bytes(image_data, encoding="ascii")
    with open("imageToSave.png", "wb") as fh:
        fh.write(base64.decodebytes(image_data))
        resp = requests.post(filestore_url, data=base64.decodebytes(image_data), headers=data_headers)
        response = resp.content
        json_response = json.loads(response.decode('utf-8'))
        return json_response['file_id']

