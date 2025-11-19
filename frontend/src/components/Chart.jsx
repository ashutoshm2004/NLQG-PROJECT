import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

function Chart({ data }) {
  if (!data || !data.labels) return <p>No chart data available</p>;

  const formatted = data.labels.map((label, i) => ({
    label,
    value: data.values[i],
  }));

  return (
    <div className="mt-6">
      <BarChart width={500} height={300} data={formatted}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" />
      </BarChart>
    </div>
  );
}

export default Chart;
