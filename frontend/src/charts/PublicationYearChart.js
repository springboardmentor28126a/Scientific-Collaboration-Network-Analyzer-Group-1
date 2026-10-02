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
        backgroundColor: "#1976D2",
        borderColor: "#0D47A1",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "#0D47A1",
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
            backgroundColor: "#1976D2",
            borderColor: "#0D47A1",
            borderWidth: 1,
            borderRadius: 6,
            hoverBackgroundColor: "#0D47A1",
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

      <Bar
        data={chartData}
        options={{
          responsive: true,

          plugins: {
            legend: {
              position: "top",
            },
          },

          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  );
}

export default PublicationYearChart;