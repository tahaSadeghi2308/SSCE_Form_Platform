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
