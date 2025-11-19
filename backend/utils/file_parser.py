import pandas as pd
import tempfile
from fastapi import UploadFile

def parse_uploaded_file(file: UploadFile):
    filename = file.filename.lower()

    # CSV files
    if filename.endswith(".csv"):
        file.file.seek(0)
        return pd.read_csv(file.file)

    # XLSX / XLS files
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        with tempfile.NamedTemporaryFile(delete=False, suffix=filename) as tmp:
            file.file.seek(0) 
            tmp.write(file.file.read())
            tmp_path = tmp.name
        return pd.read_excel(tmp_path)

    raise Exception("Unsupported file format")
