from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./lmap.db"
    SECRET_KEY: str = "change-this-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    # Lets checkout complete without Razorpay keys. Local development only — never enable in production.
    ALLOW_DEV_PAYMENTS: bool = False
    UPLOAD_DIR: str = "uploads"
    MAX_VIDEO_SIZE_MB: int = 2000  # 2GB per video

    # Admin account created on first start. Nothing is created if ADMIN_PASSWORD is empty.
    ADMIN_EMAIL: str = "admin@lmapacademy.org"
    ADMIN_PASSWORD: str = ""

    # Sync backend/content/courses into the database on startup.
    SYNC_CONTENT: bool = True

    # All-Access Pass: every paid course in one purchase.
    BUNDLE_SLUG: str = "all-access"
    BUNDLE_TITLE: str = "All-Access Pass — every LMAP Academy course"
    BUNDLE_PRICE: int = 6999

    CORS_ORIGINS: str = "*"

    class Config:
        env_file = ".env"

    @property
    def database_url(self) -> str:
        # Render/Heroku hand out postgres:// URLs; SQLAlchemy 2 needs postgresql://
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        return url


settings = Settings()
