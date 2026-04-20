import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiPlusCircle, FiSettings, FiGrid } from 'react-icons/fi';

const Layout = () => {
    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <FiGrid size={24} />
                    <span>StudentHub</span>
                </div>
                <nav className="nav-links mt-6">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiHome size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/students"
                        className={({ isActive }) => `nav-link ${isActive && window.location.pathname === '/students' ? 'active' : ''}`}
                    >
                        <FiUsers size={20} />
                        All Students
                    </NavLink>
                    <NavLink
                        to="/students/new"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiPlusCircle size={20} />
                        New Application
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); alert('Settings coming soon!'); }}
                    >
                        <FiSettings size={20} />
                        Settings
                    </NavLink>
                </nav>
            </aside>

            <main className="main-content glass-panel animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
