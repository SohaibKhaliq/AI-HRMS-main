import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, xKey = "month", seriesKeys = ["Applied", "Interview", "Hired"] }) => {
  const labels = data.map((d) => d[xKey]);
  const datasets = seriesKeys.map((key, i) => ({
    label: key,
    data: data.map((d) => d[key] || 0),
    backgroundColor: ["#3b82f6", "#10b981", "#ef4444"][i % 3],
  }));

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return <div className="w-full h-[260px]"><Bar data={chartData} options={options} /></div>;
};

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
  xKey: PropTypes.string,
  seriesKeys: PropTypes.array,
};

export default BarChart;
