import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className=" flex overflow-hidden h-screen ">
      <Sidebar />
      <div className="w-full h-full overflow-hidden">
        <Topbar />
        <div className="px-8 pt-8 pb-[150px] w-full h-[91%] overflow-auto bg-secondary_bg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
