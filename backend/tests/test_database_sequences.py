from app.database import build_sequence_sync_sql


def test_build_sequence_sync_sql_for_postgresql():
    sql = build_sequence_sync_sql("users", "id", dialect_name="postgresql")

    assert sql is not None
    assert "pg_get_serial_sequence" in sql
    assert "'users'" in sql
    assert "'id'" in sql


def test_build_sequence_sync_sql_is_disabled_for_sqlite():
    assert build_sequence_sync_sql("users", "id", dialect_name="sqlite") is None
