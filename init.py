# 스크랩 이후 본 파일은 삭제 예정입니다.

import requests
from bs4 import BeautifulSoup

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.team18_OTV

headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
data = requests.get('https://comic.naver.com/webtoon/weekday.nhn',headers=headers)

soup = BeautifulSoup(data.text, 'html.parser')

weekDays = soup.select('#content > div.list_area.daily_all > div')

j = 1
for div in weekDays:
    i = 0
    data_ = requests.get('https://comic.naver.com/webtoon/weekday.nhn', headers=headers)
    soup_ = BeautifulSoup(data_.text, 'html.parser')
    toonUrls = div.select('div > div > ul > li')

    for li in toonUrls:
        a = li.select_one('div > a')['href']
        data__ = requests.get('https://comic.naver.com'+a, headers=headers)
        soup__ = BeautifulSoup(data__.text, 'html.parser')

        image = soup__.select_one('#content > div.comicinfo > div.thumb > a > img')['src']
        title = soup__.select_one('#content > div.comicinfo > div.thumb > a > img')['title']
        author = soup__.select_one('#content > div.comicinfo > div.detail > h2 > span').text.strip()
        kind = soup__.select_one('#content > div.comicinfo > div.detail > p.detail_info > span.genre').text
        summary = soup__.select_one('#content > div.comicinfo > div.detail > p:nth-child(2)').text
        url = 'https://comic.naver.com'+a
        id = j
        doc = {
            'image' : image,
            'title' : title,
            'author' : author,
            'kind' : kind,
            'summary' : summary,
            'url' : url,
            'id' : j
        }
        name = db.webtoons.find_one({'title':title})
        if name is None:
            db.webtoons.insert_one(doc)
            j += 1
        i += 1
        if i > 14:
            break


