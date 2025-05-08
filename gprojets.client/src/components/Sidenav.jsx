import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
    Box, Drawer as MuiDrawer, AppBar as MuiAppBar, Toolbar, List,
    CssBaseline, Divider, IconButton, ListItem, ListItemButton,
    ListItemIcon, ListItemText
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';

import {
    HomeOutline, GridOutline, PeopleOutline, NewspaperOutline,
    CalendarClearOutline, NotificationsOutline, SettingsOutline,
    LogOutOutline, SearchOutline, ShareSocialOutline,
    ChatbubbleEllipsesOutline
} from 'react-ionicons';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Logo from '../assets/LogoP.jpg';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    backgroundColor: 'rgba(30, 30, 47, 0.9)',
    color: '#fff',
    zIndex: theme.zIndex.drawer + 1,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 10px rgba(0, 0, 0, 0.2)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        ...(open ? openedMixin(theme) : closedMixin(theme)),
    },
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: open ? 0 : -170,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    })
);

const SidebarLink = ({ icon: Icon, title, path, isActive, onClick }) => (
    <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
            onClick={onClick}
            sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                backgroundColor: isActive ? '#FFA726' : 'transparent',
                color: isActive ? '#fff' : '#333',
                '&:hover': {
                    backgroundColor: isActive ? '#FB8C00' : '#f5f5f5',
                },
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: isActive ? '#fff' : '#666',
                }}
            >
                <Icon color={isActive ? '#fff' : '#666'} width="22px" height="22px" />
            </ListItemIcon>
            <ListItemText primary={title} sx={{ opacity: 1 }} />
        </ListItemButton>
    </ListItem>
);

const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return {
            userId: decoded.UserId || decoded.userId,
            role: decoded.role || decoded.Role || null,
        };
    } catch (error) {
        return null;
    }
};

export default function Sidenav() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    const user = getUserFromToken();

    const navLinks = [
        { title: 'Dashboard', icon: HomeOutline, path: '/app' },

        ...(user?.role === 'admin'
            ? [
                { title: 'Projects', icon: GridOutline, path: '/app/GestionProjets' },
                { title: 'Teams', icon: PeopleOutline, path: '/app/GestionEquipe' },
                { title: 'Messaging', icon: ChatbubbleEllipsesOutline, path: '/app/chat' },
            ]
            : []),

        ...(user?.role === 'chef'
            ? [
                { title: 'Manage Team', icon: PeopleOutline, path: '/app/TaskMembers' },
                { title: 'Messaging', icon: ChatbubbleEllipsesOutline, path: '/app/chat' },
            ]
            : []),

        ...(user?.role === 'member'
            ? [
                { title: 'My tasks', icon: NewspaperOutline, path: '/app/UserTasks' },
                { title: 'Messaging', icon: ChatbubbleEllipsesOutline, path: '/app/chat' },
            ]
            : []),

        { title: 'Calendar', icon: CalendarClearOutline, path: '/app/CalendarPage' },
        { title: 'Notifications', icon: NotificationsOutline, path: '/app/Notifications' },
        { title: 'Settings', icon: SettingsOutline, path: '/app/Settings' },
    ];

    // New: handle Messaging click
    const handleMessagingClick = (path) => {
        if (location.pathname !== path) {
            navigate(path);
            setTimeout(() => window.location.reload(), 0);
        } else {
            window.location.reload();
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 3 }}>
                    <div className="flex items-center gap-4">
                        <IconButton onClick={() => setOpen(!open)} color="inherit">
                            <MenuIcon />
                        </IconButton>
                        <img src={Logo} alt="Logo" style={{ width: '36px', borderRadius: '6px' }} />
                        <span className="font-semibold text-lg">GProjets</span>
                    </div>

                    <div className="hidden md:flex items-center bg-white rounded-full px-3 py-2 w-[400px] shadow-sm gap-2">
                        <SearchOutline color="#999" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-transparent outline-none text-sm text-gray-700"
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {[ShareSocialOutline, SettingsOutline, NotificationsOutline].map((Icon, idx) => (
                            <div
                                key={idx}
                                className="grid place-items-center bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition cursor-pointer"
                            >
                                <Icon color="#555" />
                            </div>
                        ))}
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={() => setOpen(false)}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        const isMessaging = link.title === 'Messaging';
                        return (
                            <SidebarLink
                                key={link.title}
                                icon={link.icon}
                                title={link.title}
                                path={link.path}
                                isActive={isActive}
                                onClick={
                                    isMessaging
                                        ? () => handleMessagingClick(link.path)
                                        : () => navigate(link.path)
                                }
                            />
                        );
                    })}
                </List>
                <Divider sx={{ mt: 'auto' }} />
                <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                minHeight: 48,
                                justifyContent: 'initial',
                                px: 2.5,
                                mx: 1,
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#ffe0b2',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                                <LogOutOutline color="#d32f2f" width="22px" height="22px" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" sx={{ opacity: 1, color: '#d32f2f' }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            <Main open={open}>
                <DrawerHeader />
                <Outlet />
            </Main>
        </Box>
    );
}