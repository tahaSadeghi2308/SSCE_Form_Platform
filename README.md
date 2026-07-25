# سامانه ثبت اطلاعات TA

اپلیکیشن Flask چند صفحه‌ای، ریسپانسیو و راست‌به‌چپ (با فونت وزیرمتن) برای
جمع‌آوری اطلاعات ثبت TA و ارسال خودکار فایل اکسل خروجی به یک بات تلگرام.

## نصب و اجرا

```bash
cd ta-platform
python3 -m venv venv
source venv/bin/activate      # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
```

### تنظیم بات تلگرام

فایل `config.py` را باز کنید و مقادیر زیر را تکمیل کنید (یا آن‌ها را به‌عنوان
Environment Variable ست کنید):

```python
TELEGRAM_BOT_TOKEN = "توکن بات از @BotFather"
TELEGRAM_CHAT_ID   = "شناسه چت مقصد"
```

راه گرفتن `chat_id`: پیامی به بات بفرستید، سپس آدرس زیر را در مرورگر باز کنید:
`https://api.telegram.org/bot<TOKEN>/getUpdates` و مقدار `chat.id` را بردارید.

### تنظیم سمت‌های اعضای تیم

لیست `TEAM_ROLES` در `config.py` را با سمت‌های دلخواه خودتان ویرایش کنید.

### لوگوها

دو فایل `static/images/logo1.svg` و `static/images/logo2.svg` نمونه (Placeholder)
هستند؛ آن‌ها را با لوگوی واقعی خودتان جایگزین کنید (svg یا png، فقط مسیر و
پسوند را در `templates/welcome.html` به‌روزرسانی کنید).

### اجرا

```bash
python3 app.py
```

سپس آدرس `http://127.0.0.1:5000` را باز کنید. برای اجرای Production از یک
سرور WSGI مثل gunicorn استفاده کنید:

```bash
gunicorn -w 2 -b 0.0.0.0:8000 app:app
```

و حتماً `SECRET_KEY` را در تنظیمات production با یک مقدار تصادفی و امن
جایگزین کنید.

## معماری و محافظت از روند ثبت

- هر مرحله (نام درس → نام استاد → اعضای تیم → ثبت نهایی) داده‌ی خودش را در
  `session` سمت سرور (امضاشده با `SECRET_KEY`) ذخیره می‌کند.
- هر route با یک دکوریتور (`require_course`, `require_professor`,
  `require_submitted`) بررسی می‌کند که آیا داده‌ی مرحله‌ی قبل موجود است.
  اگر کاربر مستقیماً URL یک مرحله‌ی جلوتر را باز کند، بدون آنکه مرحله‌ی قبلی
  را تکمیل کرده باشد، به‌طور خودکار به همان مرحله‌ای که باید کامل کند
  هدایت می‌شود.
- افزودن/ویرایش/حذف اعضای تیم از طریق چند API کوچک (`/api/members`) و با
  fetch انجام می‌شود؛ داده‌ی نهایی همیشه در session سرور نگه داشته می‌شود
  (نه فقط در مرورگر)، بنابراین کاربر نمی‌تواند با دستکاری جاوااسکریپت سمت
  کلاینت داده‌ی نامعتبر را مستقیماً ثبت کند — سرور دوباره اعتبارسنجی می‌کند.
- پس از ثبت موفق، تمام داده‌های مرحله‌ها پاک می‌شوند (فقط پرچم `submitted`
  باقی می‌ماند) تا امکان ارسال تکراری وجود نداشته باشد.

## ساختار پروژه

```
ta-platform/
├── app.py                 # روت‌ها، محافظت از روند، تولید اکسل، ارسال تلگرام
├── config.py               # تنظیمات قابل ویرایش (توکن، سمت‌ها، ...)
├── requirements.txt
├── templates/
│   ├── base.html
│   ├── welcome.html        # صفحه ۱
│   ├── _stepper.html
│   ├── course.html         # صفحه ۲
│   ├── professor.html      # صفحه ۳
│   ├── team.html           # صفحه ۴
│   └── thanks.html         # صفحه ۵
└── static/
    ├── css/style.css
    ├── js/team.js
    └── images/logo1.svg, logo2.svg
```
