import { useEffect, useState } from "react";
import API from "../api";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function PublicationStatusChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Publications",
        data: [],
        backgroundColor: [],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await API.get("/analytics/publication-status");

      const labels = Object.keys(response.data);
      const values = Object.values(response.data);

      // Blue professional colors
      const colors = labels.map((status) => {
        if (status === "Published") {
          return "#1976D2";
        }

        if (status === "Under Review") {
          return "#42A5F5";
        }

        if (status === "Submitted") {
          return "#64B5F6";
        }

        if (status === "Draft") {
          return "#90CAF9";
        }

        if (status === "Rejected") {
          return "#0D47A1";
        }

        return "#5C9BD5";
      });

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Publications",
            data: values,
            backgroundColor: colors,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ width: "400px" }}>
      <h3>Publication Status</h3>

      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        }}
      />
    </div>
  );
}

export default PublicationStatusChart;