"""Business/site details editable from the admin panel, with sensible defaults."""
import json

from sqlalchemy.orm import Session

from config import settings
from models import SiteSetting

DEFAULTS = {
    "brand_name": "LMAP Academy",
    "legal_name": "LMAP Academy Pvt. Ltd.",
    "support_email": "support@lmapacademy.org",
    "phone": "+91 81110 55661",
    "whatsapp": "",
    "address": "",
    "gstin": "",
    "bundle_price": settings.BUNDLE_PRICE,
    "refund_days": 7,
    "announcement": "",  # optional banner text shown across the site
}


def get_site_settings(db: Session) -> dict:
    values = dict(DEFAULTS)
    for row in db.query(SiteSetting).all():
        if row.key in DEFAULTS:
            values[row.key] = json.loads(row.value)
    return values


def update_site_settings(db: Session, changes: dict) -> dict:
    for key, value in changes.items():
        if key not in DEFAULTS:
            continue
        if isinstance(DEFAULTS[key], (int, float)) and value not in (None, ""):
            value = type(DEFAULTS[key])(value)
        row = db.query(SiteSetting).filter(SiteSetting.key == key).first() or SiteSetting(key=key)
        row.value = json.dumps(value)
        db.add(row)
    db.commit()
    return get_site_settings(db)
