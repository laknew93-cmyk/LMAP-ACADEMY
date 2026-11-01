from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./lmap.db"
    # Neon: DATABASE_URL is the pooled (PgBouncer) string for app queries; schema changes
    # (create tables / add columns) must use the direct string, per Neon's guidance.
    DATABASE_URL_UNPOOLED: str = ""
    SECRET_KEY: str = "change-this-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
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

    # Shared secret for scripts that upload lesson videos (header X-Upload-Token). Disabled if empty.
    VIDEO_UPLOAD_TOKEN: str = ""

    class Config:
        env_file = ".env"

    @staticmethod
    def _normalise(url: str) -> str:
        # Render/Heroku hand out postgres:// URLs; SQLAlchemy 2 needs postgresql://
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        return url

    @property
    def database_url(self) -> str:
        return self._normalise(self.DATABASE_URL)

    @property
    def migration_database_url(self) -> str:
        return self._normalise(self.DATABASE_URL_UNPOOLED or self.DATABASE_URL)


settings = Settings()
