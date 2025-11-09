import { useSelector } from "react-redux";
import NotificationBell from "../shared/notifications/NotificationBell";

const Topbar = () => {
  const { user } = useSelector((state) => state.authentication || {});

  return (
    <header className="hidden lg:flex items-center justify-between fixed top-0 left-0 w-full h-[70px] z-40 px-6 bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="flex items-center gap-4">
        <img src="/metro.png" alt="logo" className="w-10 h-10" />
        <h2 className="text-lg font-semibold">Metro HR</h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={user?.profilePicture || "/unknown.jpeg"}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
