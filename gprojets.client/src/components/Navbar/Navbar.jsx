import React from "react";
import {
    ChevronDown,
    NotificationsOutline,
    PersonCircle,
    SearchOutline,
    SettingsOutline,
    ShareSocialOutline,
} from "react-ionicons";

const Navbar = () => {
    return (
        <div className="md:w-[calc(100%-180px)] w-[calc(100%-60px)] fixed flex items-center justify-between pl-2 pr-4 h-[50px] top-0 md:left-[180px] left-[50px] border-b border-slate-300 bg-[#fff] z-50">
            {/* Section gauche : Nom du board + icône utilisateur */}
            <div className="flex items-center gap-2 cursor-pointer">
                <PersonCircle color="#fb923c" width="22px" height="22px" />
                <span className="text-orange-400 font-semibold md:text-base text-xs whitespace-nowrap">
                    Board Name
                </span>
                <ChevronDown color="#fb923c" width="14px" height="14px" />
            </div>

            {/* Barre de recherche */}
            <div className="md:w-[600px] w-[100px] bg-gray-100 rounded-lg px-2 py-[6px] flex items-center gap-1">
                <SearchOutline color="#999" width="16px" height="16px" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-gray-100 outline-none text-[13px]"
                />
            </div>

            {/* Icônes à droite */}
            <div className="md:flex hidden items-center gap-3">
                <div className="grid place-items-center bg-gray-100 rounded-full p-1 cursor-pointer">
                    <ShareSocialOutline color="#444" width="18px" height="18px" />
                </div>
                <div className="grid place-items-center bg-gray-100 rounded-full p-1 cursor-pointer">
                    <SettingsOutline color="#444" width="18px" height="18px" />
                </div>
                <div className="grid place-items-center bg-gray-100 rounded-full p-1 cursor-pointer">
                    <NotificationsOutline color="#444" width="18px" height="18px" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;