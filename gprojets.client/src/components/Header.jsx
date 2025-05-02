import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoP from '../assets/LogoP.jpg';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/Header.css';

const Header = () => {
    const [notificationsVisible, setNotificationsVisible] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = () => navigate('/profile');
    const toggleNotifications = () => setNotificationsVisible(!notificationsVisible);

    return (
        <header className="admin-header">
            <img src={LogoP} alt="Logo Entreprise" className="logo-image" />
            <div className="header-icons">
                <div className="search-container">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher..."
                    />
                </div>
                <AccountCircleIcon
                    className="header-icon"
                    titleAccess="Profil"
                    onClick={handleProfileClick}
                />
                <div className="notification-container">
                    <NotificationsIcon
                        className="header-icon"
                        titleAccess="Notifications"
                        onClick={toggleNotifications}
                    />
                    {notificationsVisible && (
                        <div className="notification-popup">
                            <h3>Notifications</h3>
                            <div className="notifications-content">
                                <div className="notification-placeholder">
                                    <p>Aucune notification pour le moment.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
