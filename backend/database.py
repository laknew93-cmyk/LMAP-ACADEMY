from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from config import settings
from models import Base

_url = settings.database_url
engine = create_engine(
    _url,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if _url.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _add_missing_columns():
    """create_all() never alters existing tables, so add any new nullable columns by hand."""
    insp = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not insp.has_table(table.name):
                continue
            existing = {c["name"] for c in insp.get_columns(table.name)}
            for col in table.columns:
                if col.name in existing:
                    continue
                col_type = col.type.compile(dialect=engine.dialect)
                conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN "{col.name}" {col_type}'))


def init_db():
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()
