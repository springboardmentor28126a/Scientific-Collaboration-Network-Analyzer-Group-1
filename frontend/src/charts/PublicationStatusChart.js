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
      },
    ],
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await API.get("/analytics/publication-status");

      setChartData({
        labels: Object.keys(response.data),
        datasets: [
          {
            label: "Publications",
            data: Object.values(response.data),
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

      <Pie data={chartData} />
    </div>
  );
}

export default PublicationStatusChart;
