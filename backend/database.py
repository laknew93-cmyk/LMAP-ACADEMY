from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from config import settings
from models import Base

def _engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    # Neon closes idle connections and can scale to zero: check connections before use
    # and recycle them well before the server-side idle timeout.
    return create_engine(url, pool_pre_ping=True, pool_recycle=300, pool_size=5, max_overflow=5)


engine = _engine(settings.database_url)
# Direct (unpooled) connection for DDL; same as `engine` when no separate URL is configured.
migration_engine = engine if settings.migration_database_url == settings.database_url else _engine(settings.migration_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _add_missing_columns():
    """create_all() never alters existing tables, so add any new nullable columns by hand."""
    insp = inspect(migration_engine)
    with migration_engine.begin() as conn:
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
    Base.metadata.create_all(bind=migration_engine)
    _add_missing_columns()
    if migration_engine is not engine:
        migration_engine.dispose()
