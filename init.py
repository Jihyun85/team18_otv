# 스크랩 이후 본 파일은 삭제 예정입니다.

import requests
from bs4 import BeautifulSoup

from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.dbsparta