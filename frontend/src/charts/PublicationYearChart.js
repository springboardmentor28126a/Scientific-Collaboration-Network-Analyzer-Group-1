import { useEffect, useState } from "react";
import API from "../api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PublicationYearChart() {
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
    fetchYearData();
  }, []);

  const fetchYearData = async () => {
    try {
      const response = await API.get("/analytics/publication-year");

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
    <div style={{ width: "600px", marginTop: "30px" }}>
      <h3>Publications by Year</h3>
      <Bar data={chartData} />
    </div>
  );
}

export default PublicationYearChart;