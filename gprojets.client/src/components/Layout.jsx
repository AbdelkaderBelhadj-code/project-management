import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Navbar/Navbar";

const Layout = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Navbar />
                <main className="p-6 bg-gray-100 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default Layout;
