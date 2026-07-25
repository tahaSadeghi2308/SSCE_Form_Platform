# -*- coding: utf-8 -*-

import logging
import threading
import time

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

import config

logger = logging.getLogger("bale_client")


class TokenBucket:
    def __init__(self, rate_per_sec, capacity=None):
        self.rate = float(rate_per_sec)
        self.capacity = float(capacity or rate_per_sec)
        self.tokens = self.capacity
        self.last_refill = time.monotonic()
        self.lock = threading.Lock()

    def acquire(self, timeout=20):
        deadline = time.monotonic() + timeout
        while True:
            with self.lock:
                now = time.monotonic()
                elapsed = now - self.last_refill
                self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
                self.last_refill = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return True
            if time.monotonic() >= deadline:
                raise TimeoutError(
                    "سرور در حال حاضر درخواست‌های زیادی را پردازش می‌کند. "
                    "لطفاً چند لحظه دیگر دوباره تلاش کنید."
                )
            time.sleep(0.05)


_rate_limiter = TokenBucket(rate_per_sec=config.BALE_MAX_MSG_PER_SEC)

_concurrency_semaphore = threading.Semaphore(config.BALE_MAX_CONCURRENT_REQUESTS)


def _build_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=0.6, 
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"],
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(
        max_retries=retry,
        pool_connections=20,
        pool_maxsize=20,
    )
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


_session = _build_session()


def send_document(file_buffer, filename, caption, max_attempts=3):
    if "PUT-YOUR" in config.BALE_BOT_TOKEN or "PUT-YOUR" in str(config.BALE_CHAT_ID):
        raise RuntimeError(
            "توکن بات یا شناسه چت بله تنظیم نشده است. "
            "لطفاً فایل config.py را تکمیل کنید."
        )

    url = f"https://tapi.bale.ai/bot{config.BALE_BOT_TOKEN}/sendDocument"
    original_bytes = file_buffer.getvalue()

    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            _rate_limiter.acquire(timeout=20)
        except TimeoutError as exc:
            last_error = exc
            continue

        got_slot = _concurrency_semaphore.acquire(timeout=20)
        if not got_slot:
            last_error = RuntimeError(
                "سرور در حال حاضر شلوغ است، لطفاً چند لحظه دیگر دوباره تلاش کنید."
            )
            continue

        try:
            import io
            fresh_buffer = io.BytesIO(original_bytes)

            files = {
                "document": (
                    filename,
                    fresh_buffer,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            data = {"chat_id": config.BALE_CHAT_ID, "caption": caption}
            resp = _session.post(url, data=data, files=files, timeout=(10, 30))

            if resp.status_code == 429:
                retry_after = int(resp.headers.get("Retry-After", "2"))
                logger.warning("Bale rate limit hit (429), retrying after %ss", retry_after)
                last_error = RuntimeError("محدودیت نرخ ارسال بله؛ در حال تلاش مجدد...")
                time.sleep(retry_after)
                continue

            payload = resp.json()
            if not payload.get("ok"):
                raise RuntimeError(payload.get("description", "خطای نامشخص از سمت بله"))

            return payload

        except (requests.ConnectionError, requests.Timeout) as exc:
            last_error = exc
            wait = 0.8 * (2 ** (attempt - 1))
            logger.warning(
                "Network error sending to Bale (attempt %s/%s): %s", attempt, max_attempts, exc
            )
            time.sleep(wait)
        except RuntimeError:
            raise
        except Exception as exc:
            last_error = exc
            logger.exception("Unexpected error while sending document to Bale")
            break
        finally:
            _concurrency_semaphore.release()

    raise RuntimeError(f"ارسال به بله پس از {max_attempts} تلاش ناموفق بود: {last_error}")
