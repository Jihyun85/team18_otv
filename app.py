from flask import Flask, render_template, redirect, url_for
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.team18_OTV

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

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)