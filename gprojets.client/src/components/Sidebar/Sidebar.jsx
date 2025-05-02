import React from "react";
import {
	HomeOutline,
	GridOutline,
	PeopleOutline,
	NewspaperOutline,
	CalendarClearOutline,
	NotificationsOutline,
	SettingsOutline,
	LogOutOutline,
} from "react-ionicons";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/LogoP.jpg";

const Sidebar = () => {
	const navigate = useNavigate();

	const navLinks = [
		{ title: "Dashboard", icon: <HomeOutline color="#555" width="22px" height="22px" />,path: "/GestionProjets"  },
		{ title: "Projects", icon: <GridOutline color="#555" width="22px" height="22px" /> },
		{ title: "Teams", icon: <PeopleOutline color="#555" width="22px" height="22px" />, path: "/GestionEquipe" },
		{ title: "Tasks", icon: <NewspaperOutline color="#555" width="22px" height="22px" /> },
		{ title: "Calendar", icon: <CalendarClearOutline color="#555" width="22px" height="22px" />, path: "/Dashboard"},
		{ title: "Notifications", icon: <NotificationsOutline color="#555" width="22px" height="22px" /> },
		{ title: "Settings", icon: <SettingsOutline color="#555" width="22px" height="22px" /> },
	];

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/", { replace: true });
	};

	return (
		<div className="fixed left-0 top-0 md:w-[230px] w-[60px] overflow-hidden h-full flex flex-col shadow-md z-50 bg-white">
			{/* Logo */}
			<div className="w-full flex items-center justify-center h-[70px] bg-white border-b border-slate-200">
				<img
					src={logoImage}
					alt="Logo"
					className="md:w-[120px] w-[40px] md:h-auto h-[40px] object-contain"
				/>
			</div>

			{/* Liens de navigation */}
			<div className="w-full h-[calc(100vh-70px)] flex flex-col md:items-start items-center gap-2 py-5 md:px-3 px-2 relative">
				{navLinks.map((link) => (
					<div
						key={link.title}
						className="flex items-center gap-2 w-full rounded-lg hover:bg-orange-300 px-2 py-3 cursor-pointer transition-all duration-200"
						onClick={() => navigate(link.path)}
					>
						{link.icon}
						<span className="font-medium text-[15px] text-black md:block hidden">{link.title}</span>
					</div>
				))}

				{/* Bouton Déconnexion */}
				<div
					onClick={handleLogout}
					className="flex absolute bottom-4 items-center md:justify-start justify-center gap-2 md:w-[90%] w-[70%] rounded-lg hover:bg-orange-300 px-2 py-3 cursor-pointer bg-gray-200"
				>
					<LogOutOutline color="#333" width="22px" height="22px" />
					<span className="font-medium text-[15px] text-black md:block hidden">Log Out</span>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
