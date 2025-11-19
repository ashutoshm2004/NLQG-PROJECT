import os
import time
import random
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

import re

def call_groq_safely(payload, retries=5):
    for attempt in range(retries):
        try:
            return client.chat.completions.create(**payload)
        except Exception as e:
            err_text = str(e)
            print("Groq error:", err_text)

            # If it's Cloudflare 500 HTML → wait and retry
            if "Error code 500" in err_text or "Internal server error" in err_text:
                wait = 1 + attempt * 1.5
                print(f"Retrying in {wait} seconds...")
                time.sleep(wait)
                continue  

            # If other errors → break immediately
            raise e

    # Final fallback if all retries fail
    raise Exception("Groq API failed after multiple retries.")


def quote_columns(sql, schema):
    cols = [col.split(" (")[0] for col in schema.split("\n")]

    for col in cols:
        if " " in col:
            pattern = r'\b' + re.escape(col) + r'\b'
            sql = re.sub(pattern, f'"{col}"', sql)
    return sql


def generate_sql_query(question, schema):

    SYSTEM_PROMPT = f"""
You are an SQL generator. Follow these STRICT rules:

1. You MUST use ONLY the columns that actually exist in the schema below.
2. NEVER assume or guess values that the user didn't mention.
3. NEVER add filters unless the user explicitly requests them.
4. If the question is general (e.g., "How many titles...?"), 
   do NOT add ANY WHERE clause.
5. Do NOT infer information from the filename (e.g., amazon_prime_titles.csv).
6. SQL MUST reference this table name exactly: uploaded_table
7. ALWAYS keep queries simple: SELECT … FROM uploaded_table …
8. DO NOT guess genres, ratings, types, or dates.
9. If a column name is missing from the schema, respond with:
   "Column does not exist".
10. The SQL MUST NEVER hallucinate. If unsure, generate:
    "SELECT * FROM uploaded_table LIMIT 5;"
11. If the question asks specifically for "movies" or "tv shows", 
    then use a WHERE clause:
    - WHERE LOWER(type) = 'movie'
    - WHERE LOWER(type) = 'tv show'
12. When matching values (e.g., "Movie", "TV Show"), 
    ALWAYS lower-case both sides:
    WHERE LOWER(type) = LOWER('Movie')
13. ALWAYS use the real column name from schema EXACTLY as it appears.
14. NEVER remove or rename columns.
15. RETURN ONLY valid SQLite SQL. No explanations, no markdown.
16. DATE RULES (IMPORTANT):
    - When the user asks anything relative to the current date or current year, ALWAYS use SQLite date functions.
    - For year-relative questions, use:
        CAST(strftime('%Y', 'now') AS INT)
    Example:
        release_year >= CAST(strftime('%Y','now') AS INT) - 5

    - For day-level relative time:
        date_added >= date('now', '-30 day')

    - NEVER use release_year > release_year - N  
    (That is always wrong.)

    - NEVER use MAX(release_year) for “last X years”.  
    Use current year from NOW instead.
    Return ONLY valid SQLite SQL.

=== SCHEMA START ===
{schema}
=== SCHEMA END ===
"""

    response = call_groq_safely({
        "model":"llama-3.3-70b-versatile",
        "messages":[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question}
        ],
        "temperature":0.0
    })

    sql = response.choices[0].message.content.strip()

    sql = quote_columns(sql, schema)

    sql = sql.replace("```sql", "").replace("```", "").strip()

    return sql
