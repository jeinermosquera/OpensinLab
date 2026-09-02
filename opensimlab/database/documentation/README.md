# Database Documentation

## Schema

Tables will be defined via Alembic migrations in `apps/api/alembic/versions/`.

## Migrations

```bash
# Create a new migration
cd apps/api
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Connection

Default credentials (see `.env.example`):
- Host: localhost:5432
- Database: opensimlab
- User: opensimlab
- Password: opensimlab
