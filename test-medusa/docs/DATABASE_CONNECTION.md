# Database Connection Guide

## Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** medusa_db
- **User:** medusa
- **Password:** medusa123

## Connection Methods

### 1. Using the Connection Script
```bash
./connect-db.sh
```

### 2. Direct psql Command
```bash
psql -h localhost -p 5432 -U medusa -d medusa_db
```
When prompted, enter password: `medusa123`

### 3. Using Environment Variable (No Prompt)
```bash
PGPASSWORD=medusa123 psql -h localhost -p 5432 -U medusa -d medusa_db
```

### 4. Connection String (for applications)
```
postgresql://medusa:medusa123@localhost:5432/medusa_db
```

## Quick Test Connection
```bash
PGPASSWORD=medusa123 psql -h localhost -p 5432 -U medusa -d medusa_db -c "SELECT version();"
```

## Medusa Configuration

The database connection is configured in `.env`:
```
DATABASE_URL=postgresql://medusa:medusa123@localhost:5432/medusa_db
```

