import hmac
import hashlib
import requests
from requests.auth import HTTPBasicAuth

RAZORPAY_BASE = "https://api.razorpay.com/v1"


class RazorpayClient:
    def __init__(self, key_id: str, key_secret: str):
        self.auth = HTTPBasicAuth(key_id, key_secret)
        self.key_secret = key_secret

    def create_order(self, amount: int, currency: str = "INR", receipt: str = "") -> dict:
        r = requests.post(
            f"{RAZORPAY_BASE}/orders",
            json={"amount": amount, "currency": currency, "receipt": receipt},
            auth=self.auth,
            timeout=10,
        )
        r.raise_for_status()
        return r.json()

    def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        message = f"{order_id}|{payment_id}"
        expected = hmac.new(self.key_secret.encode(), message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
