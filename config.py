import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
BALE_BOT_TOKEN = os.getenv("BALE_BOT_TOKEN")
BALE_CHAT_ID = os.getenv("BALE_CHAT_ID")
BALE_MAX_MSG_PER_SEC = int(os.getenv("BALE_MAX_MSG_PER_SEC"))
BALE_MAX_CONCURRENT_REQUESTS = int(os.getenv("BALE_MAX_CONCURRENT_REQUESTS"))

TEAM_ROLES = [
    "عضو تیم",
]

SITE_TITLE = "سامانه ثبت اطلاعات دستیار آموزشی (TA)"

SEMESTERS = [
    "4041",
    "4042",
]

PROFESSORS = [
    "میرحسین دزفولیان",
    "حاتم عبدلی",
    "مهدی سخایی نیا",
    "حسن ختن لو",
    "مرتضی یوسف صنعتی",
    "محرم منصوری زاده",
    "رضا محمدی",
    "نرگس السادات بطحائیان",
    "شکور وکیلیان",
    "الهام افشار",
    "مهدی عباسی",
    "محمدجواد داوری",
    "علی جاویدانی",
    "امین نظری",
]