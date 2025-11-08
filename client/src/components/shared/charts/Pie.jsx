import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import PropTypes from 'prop-types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PieGraph = ({ labels, title, label, data1, data2, height = 220 }) => {
  const pieData = {
    labels: [labels.category1, labels.category2],
    datasets: [
      {
        label: label,
        data: [data1, data2],
        backgroundColor: ["rgba(30, 144, 255, 0.7)", "rgba(220, 20, 60, 0.7)"],

        borderColor: ["rgba(30, 144, 255, 1)", "rgba(220, 20, 60, 1)"],

        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <Pie data={pieData} options={pieOptions} height={height} />
    </div>
  );
};

PieGraph.propTypes = {
  labels: PropTypes.shape({
    category1: PropTypes.string,
    category2: PropTypes.string,
  }).isRequired,
  title: PropTypes.string,
  label: PropTypes.string,
  data1: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  data2: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default PieGraph;
