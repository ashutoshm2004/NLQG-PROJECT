from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sqlite3
import uvicorn
from utils.file_parser import parse_uploaded_file
from utils.sql_generator import generate_sql_query
from utils.db_manager import execute_sql_query, get_schema
from utils.visualizer import prepare_visualization_data
from utils.downloader import generate_download_response


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nl2sqlg.netlify.app",
        "https://*.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

from utils.db_manager import DATABASE_PATH



@app.post("/upload")
async def upload(file: UploadFile):
    df = parse_uploaded_file(file)
    conn = sqlite3.connect(DATABASE_PATH)
    df.to_sql("uploaded_table", conn, if_exists="replace", index=False)
    conn.close()
    return {"status": "success", "columns": df.columns.tolist()}


@app.post("/query")
async def query(question: str = Form(...)):
    schema = get_schema()
    sql = generate_sql_query(question, schema)
    result = execute_sql_query(sql)
    return {"sql": sql, "result": result}


@app.post("/visualize")
async def visualize(query: str = Form(...), chart_type: str = Form(...)):
    data = execute_sql_query(query)
    chart_data = prepare_visualization_data(chart_type, data)
    return 

@app.post("/download")
async def download(query: str = Form(...), file_type: str = Form(...)):
    data = execute_sql_query(query)     # Already returns list of dicts
    return generate_download_response(data, file_type)



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
