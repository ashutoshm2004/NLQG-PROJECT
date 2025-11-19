# Natural Language → SQL Query Generator (NLQG)

A full-stack project where users upload CSV/Excel files, ask natural language questions, and receive:
- Generated SQL query
- Executed results
- Optional visualizations (bar, pie, line)

## Tech Stack
### Backend:
- FastAPI
- Pandas
- SQLite
- OpenAI GPT-4.1 for SQL generation

### Frontend:
- React + Vite
- Tailwind CSS
- Recharts for visualization

## How to Run
### Backend:
pip install -r requirements.txt
uvicorn app:app --reload

### Frontend:
npm install
npm run dev

## Features
✔ Natural Language → SQL  
✔ File Upload  
✔ Automatic schema detection  
✔ SQL execution  
✔ Table output  
✔ Graph visualizations  
✔ Modular + clean code structure  