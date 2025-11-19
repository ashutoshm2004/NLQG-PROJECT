import pandas as pd
import io
from fastapi.responses import StreamingResponse

def generate_download_response(data, file_type):
    df = pd.DataFrame(data)

    if file_type == "csv":
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=result.csv"}
        )

    elif file_type == "excel":
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine='openpyxl')
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type=("application/vnd.openxmlformats-officedocument"
                        ".spreadsheetml.sheet"),
            headers={"Content-Disposition": "attachment; filename=result.xlsx"}
        )

    else:
        raise ValueError("Invalid file type. Use 'csv' or 'excel'.")
