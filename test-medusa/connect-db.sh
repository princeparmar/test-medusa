#!/bin/bash

# PostgreSQL Connection Script for Medusa
# This script connects to the Medusa database

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="medusa_db"
DB_USER="medusa"
DB_PASSWORD="medusa123"

# Connection command
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

