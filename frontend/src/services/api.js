import axios from "axios";

const BASE = "http://127.0.0.1:8000";

export const uploadFile = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${BASE}/upload`, form);
  return res.data;
};

export const askQuery = async (question) => {
  const form = new FormData();
  form.append("question", question);
  const res = await axios.post(`${BASE}/query`, form);
  return res.data;
};

export const getVisualization = async (sql, type) => {
  const form = new FormData();
  form.append("query", sql);
  form.append("chart_type", type);
  const res = await axios.post(`${BASE}/visualize`, form);
  return res.data;
};

export const downloadResult = async (sqlQuery, fileType) => {
  const formData = new FormData();
  formData.append("query", sqlQuery);
  formData.append("file_type", fileType);

  const response = await fetch("http://127.0.0.1:8000/download", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  // Return the raw blob so App.jsx can force download
  return response.blob();
};
