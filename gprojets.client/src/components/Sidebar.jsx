import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { VscGithubProject } from 'react-icons/vsc';
import { IoLogOutOutline } from 'react-icons/io5';
import { RiContactsBook3Fill } from "react-icons/ri";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const goToManageTeam = () => {
        navigate('/GestionEquipe');
    };

    const goToManageProjects = () => {
        navigate('/GestionProjets');
    };

    const goToContacts = () => {
        navigate('/contacts');
    };

    const goToCalendar = () => {
        navigate('/CalendarPage');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="avatar">U</div>
                <div className="username">Admin</div>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    <li>
                        <button className="sidebar-button" onClick={goToManageTeam}>
                            <FaUser className="icon" />
                            <span>Manage Team</span>
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-button" onClick={goToManageProjects}>
                            <VscGithubProject className="icon" />
                            <span>Manage Projects</span>
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-button" onClick={goToContacts}>
                            <RiContactsBook3Fill  className="icon" />
                            <span>Contacts</span>
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-button" onClick={goToCalendar}>
                            <FaCalendarAlt className="icon" />
                            <span>Calendar</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout" onClick={handleLogout}>
                    <IoLogOutOutline className="icon" />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
