from flask import Flask, render_template, redirect, url_for, jsonify, request
from pymongo import MongoClient

import jwt
import datetime
import hashlib

from datetime import datetime, timedelta

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.team18_OTV

SECRET_KEY = 'team18' # 변경하였습니다

@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        webtoons = list(db.webtoons.find({}, {'_id': False}))

        # likes 순으로 정렬
        data = sorted(webtoons, key=lambda a: (a['likes']), reverse=True)

        # 해당 유저가 좋아요를 눌렀는지 여부 확인
        check_data = []
        for webtoon in data:
            like_check = db.likes.find_one({'webtoon_id': str(webtoon['id']), 'username': user_info['username']}) != None
            webtoon['check_like'] = like_check
            check_data.append(webtoon)
        return render_template('index.html', webtoons=check_data, user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/join')
def join():
    return render_template('join.html')

@app.route('/webtoons/<id>')
def webtoon(id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        my_webtoon = db.webtoons.find_one({'id': int(id)})

        check_like = db.likes.find_one({'webtoon_id': str(id), 'username': user_info['username']}) != None

        if my_webtoon is not None:
            return render_template('detail.html', webtoon=my_webtoon, check_like=check_like)
        else:
            return redirect(url_for('home'))
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))



@app.route('/api/likes', methods=['POST'])
def like_webtoon():
    token_receive = request.cookies.get('mytoken') # 설정한 쿠키명에 따라 달라질 수 있습니다.
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        id_receive = request.form['id_give']
        target_webtoon = db.webtoons.find_one({'id': int(id_receive)}, {'_id': False})
        action_receive = request.form["action_give"]  # like 인지 dislike 인지 확인

        doc = {
            "webtoon_id": id_receive,
            "username": user_info["username"],
        }

        if action_receive == "like":
            # collection - likes
            db.likes.insert_one(doc)
            # collection - webtoons
            new_like = target_webtoon['likes'] + 1
            db.webtoons.update_one({'id': int(id_receive)}, {'$set': {'likes': new_like}})
        else:
            # collection - likes
            db.likes.delete_one(doc)
            # collection - webtoons
            new_like = target_webtoon['likes'] - 1
            db.webtoons.update_one({'id': int(id_receive)}, {'$set': {'likes': new_like}})
        return jsonify({"count": new_like})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})
    # 찾으면
    if result is not None:
        payload = {
            'id': username_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)
            # 로그인 24시간 유지, datetime.utcnow() 지금부터 + timedelta(seconds=60초*60분*24시간)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')  # 토큰 암호화?

        return jsonify({'result': 'success', 'token': token})  # 클라이언트에게 토큰 던져주기
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})

@app.route('/join/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    nickname_receive = request.form['nickname_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,  # 아이디
        "nickname": nickname_receive,  # 닉네임
        "password": password_hash,  # 비밀번호

    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

# 중복확인(회원가입-아이디)
@app.route('/join/sign_up/check_dup_id', methods=['POST'])
def check_dup_id():
    username_receive = request.form['username_give']
    exists = bool(db.users.find_one({"username": username_receive}))  # 기존 id 있으면 true, 없으면 false
    return jsonify({'result': 'success', 'exists': exists})

# 중복확인(회원가입-닉네임)
@app.route('/join/sign_up/check_dup_nickname', methods=['POST'])
def check_dup_nickname():
    nickname_receive = request.form['nickname_give']
    exists = bool(db.users.find_one({"nickname": nickname_receive}))  # 기존 nickname 있으면 true, 없으면 false
    return jsonify({'result': 'success', 'exists': exists})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)