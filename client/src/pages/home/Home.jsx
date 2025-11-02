import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import InfoCard from "../../components/shared/cards/InfoCard";
import LineChart from "../../components/shared/charts/LineChart";
import FetchError from "../../components/shared/error/FetchError";
import ComponentLoader from "../../components/shared/loaders/ComponentLoader";

const Home = () => {
  const { employeeInsights, loading, error } = useSelector(
    (state) => state.insight
  );

  const attendanceByMonth = employeeInsights?.attendanceRecord?.map((item) => {
    return item.attendancePercentage;
  });

  const employeeInsightsData = [
    { 
      id: 1,
      title: "Leaves Taken", 
      stats: employeeInsights?.leavesTaken,
      icon: "fas fa-calendar-times"
    },
    { 
      id: 2,
      title: "Leave Balance", 
      stats: employeeInsights?.leaveBalance,
      icon: "fas fa-calendar-check"
    },
    { 
      id: 3,
      title: "Feedbacks", 
      stats: employeeInsights?.feedbackSubmitted,
      icon: "fas fa-comments"
    },
    { 
      id: 4,
      title: "Complaints", 
      stats: employeeInsights?.complaintResolved,
      icon: "fas fa-exclamation-circle"
    },
    { 
      id: 5,
      title: "KPI Score", 
      stats: `${employeeInsights?.kpiScore || 0}%`,
      icon: "fas fa-chart-line"
    },
    {
      id: 6,
      title: "Attendance",
      stats: `${employeeInsights?.attendancePercentage || 0}%`,
      icon: "fas fa-user-check"
    },
  ];

  if (error) return <FetchError error={error} />;
  if (loading || !employeeInsights) return <ComponentLoader />;

  return (
    <>
      <Helmet>
        <title>Dashboard - Metro HR</title>
      </Helmet>

      <section className="px-1 sm:px-0 bg-gray-200 dark:bg-primary min-h-screen">
        <div className="w-full flex flex-wrap justify-between gap-2">
          {employeeInsightsData.map((item) => (
            <InfoCard key={item.id} detail={item} />
          ))}
        </div>

        <div className="flex gap-2 sm:gap-1 justify-between md:flex-row flex-col h-auto md:h-[400px] mt-2 mb-2">
          <div
            id="overflow"
            className="w-full block h-full rounded-lg dark:text-gray-200 text-gray-700 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-primary p-4 overflow-auto shadow"
          >
            <h3 className="text-[0.93rem] font-semibold mb-4 border-b dark:border-gray-600 pb-2">
              Overall Attendance Overview
            </h3>
            <div className="w-full pt-5 pr-6">
              <LineChart
                label="Attendance Percentage"
                chartData={attendanceByMonth}
                title="Monthly Attendance Percentage"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
