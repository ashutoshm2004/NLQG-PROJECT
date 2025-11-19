import sqlite3
import pandas as pd
import os

# Base directory of utils folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Path to /backend/database/
DB_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "database"))

# Ensure database folder exists
if not os.path.exists(DB_FOLDER):
    os.makedirs(DB_FOLDER, exist_ok=True)

# Final absolute path for the database file
DATABASE_PATH = os.path.join(DB_FOLDER, "user_database.db")

print("USING DATABASE PATH =>", DATABASE_PATH)


def get_schema():
    """Return list of columns with types from uploaded_table."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(uploaded_table)")
    columns = cursor.fetchall()
    conn.close()

    # Return schema as plain dict list
    schema = [f"{col[1]} ({col[2]})" for col in columns]
    return "\n".join(schema)


def execute_sql_query(query):
    """Execute SQL query and return rows as list of dictionaries."""
    conn = sqlite3.connect(DATABASE_PATH)
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df.to_dict(orient="records")
