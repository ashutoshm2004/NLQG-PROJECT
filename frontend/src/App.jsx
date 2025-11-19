import React, { useEffect, useMemo, useState } from "react";
import { uploadFile, askQuery, downloadResult } from "./services/api";
import Chart from "./components/Chart";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [generatedSql, setGeneratedSql] = useState("");
  const [resultRows, setResultRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [downloadType, setDownloadType] = useState("csv");
  const [metrics, setMetrics] = useState({ rows: 0, cols: 0 });

  // ---------------- DARK MODE ----------------
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // ---------------- SEARCH ------------------
  const visibleRows = useMemo(() => {
    if (!searchText) return resultRows;
    const q = searchText.toLowerCase();

    return resultRows.filter((r) =>
      Object.values(r).some((v) =>
        v === null ? false : String(v).toLowerCase().includes(q)
      )
    );
  }, [resultRows, searchText]);

  // ---------------- FILE UPLOAD ----------------
  const handleUpload = async () => {
    if (!file) return alert("Choose a file first.");
    try {
      setLoading(true);
      await uploadFile(file);
      alert("File uploaded successfully");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ASK QUERY ----------------
  const handleAsk = async () => {
    if (!question.trim()) return alert("Ask a question first.");
    try {
      setLoading(true);
      const res = await askQuery(question);

      setGeneratedSql(res.sql || "");
      setResultRows(res.result || []);

      setMetrics({
        rows: res.result?.length || 0,
        cols: res.result?.length ? Object.keys(res.result[0]).length : 0,
      });
    } catch (e) {
      console.error(e);
      alert("Query failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DOWNLOAD ----------------
  const handleDownload = async () => {
    if (!generatedSql.trim()) return alert("Run a query first.");
    try {
      const blob = await downloadResult(generatedSql, downloadType);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        downloadType === "csv"
          ? "result.csv"
          : downloadType === "excel"
          ? "result.xlsx"
          : "result.pdf";

      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Download failed");
    }
  };

  // ============================================================
  //                        UI RENDER
  // ============================================================

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 w-full">

        {/* HEADER */}
        <header className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold">Natural Language → SQL</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload any dataset and ask questions.
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        {/* TOP CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-6">

          {/* Upload */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Upload File</div>

            <div className="mt-2 truncate text-sm">
              {file?.name || "No file selected"}
            </div>

            <div className="mt-3 flex gap-2">
              <label>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">
                  Choose File
                </div>
              </label>

              <button
                onClick={handleUpload}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Rows</div>
            <div className="text-2xl font-bold">{metrics.rows}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Columns</div>
            <div className="text-2xl font-bold">{metrics.cols}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Last SQL</div>
            <div className="text-xs mt-2 break-all">{generatedSql || "—"}</div>
          </div>
        </section>

        {/* QUERY + RESULTS */}
        <section className="px-6 space-y-6">

          {/* Query Input */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
            <textarea
              placeholder="Ask: How many movies from 2020?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border rounded h-28 dark:bg-gray-700 dark:border-gray-600"
            />

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAsk}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Run Query
              </button>

              <button
                onClick={() => {
                  setQuestion("");
                  setGeneratedSql("");
                  setResultRows([]);
                  setMetrics({ rows: 0, cols: 0 });
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
              >
                Reset
              </button>

              {loading && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                  Working…
                </span>
              )}
            </div>
          </div>

          {/* SQL OUTPUT */}
          {generatedSql && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Generated SQL:
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSql);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  {copied ? "🗋 Copied" : "🗍 Copy SQL"}
                </button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all overflow-x-auto">
                {generatedSql}
              </pre>
            </div>
          )}

          {/* RESULTS TABLE */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">

            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Query Results</div>

              <div className="flex items-center gap-3">
                <input
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />

                <select
                  value={downloadType}
                  onChange={(e) => setDownloadType(e.target.value)}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>

                <button
                  onClick={handleDownload}
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  Download
                </button>
              </div>
            </div>

            {/* FIXED TABLE SCROLL */}
            <div className="overflow-x-auto overflow-y-auto border rounded max-h-[420px]">
              <table className="min-w-max table-auto text-sm">
                <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {resultRows.length > 0 &&
                      Object.keys(resultRows[0]).map((key) => (
                        <th
                          key={key}
                          className="p-3 text-left border-b dark:border-gray-600"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-900"
                      }
                    >
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="p-3 border-b dark:border-gray-700"
                        >
                          {val === null ? "—" : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
