from flask import Flask, render_template, redirect, url_for, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.team18_OTV

import jwt

SECRET_KEY = "SPARTA" # 변경 필요

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/join')
def join():
    return render_template('join.html')

@app.route('/webtoons/<id>')
def webtoon(id):
    my_webtoon = db.team18_OTV.find_one({'id': int(id)})
    if my_webtoon is not None:
        return render_template('detail.html', webtoon=my_webtoon)
    else:
        return redirect(url_for('home'))

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
            "username": user_info["name"],
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
            db.webtoons.update_one({'title': int(id_receive)}, {'$set': {'likes': new_like}})
        return jsonify({"result": 'success'})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)