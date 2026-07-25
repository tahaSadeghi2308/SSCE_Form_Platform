import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
BALE_BOT_TOKEN = os.getenv("BALE_BOT_TOKEN")
BALE_CHAT_ID = os.getenv("BALE_CHAT_ID")

TEAM_ROLES = [
    "سرپرست تیم",
    "عضو تیم",
    "مسئول فنی",
    "مسئول مستندات",
]

SITE_TITLE = "سامانه ثبت اطلاعات دستیار آموزشی (TA)"
