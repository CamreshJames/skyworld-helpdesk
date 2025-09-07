import './sidebar.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangecatalogIcon, CollapseIcon, OrganizationIcon, PiedashboardIcon, SettingIcon, TicketsIcon, UsersIcon, } from '../../utils/icons';

function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };
    const handleIconClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
            <div className="sidebar-top">
                <div
                    onClick={() => handleIconClick('/')}
                    data-tooltip="Dashboard"
                    aria-label="Dashboard"
                >
                    <PiedashboardIcon />
                    <span className="sidebar-icon-label">Dashboard</span>
                </div>
                <div
                    onClick={() => handleIconClick('/tickets')}
                    data-tooltip="Tickets"
                    aria-label="Tickets"
                >
                    <TicketsIcon />
                    <span className="sidebar-icon-label">Tickets</span>
                </div>
                <div
                    onClick={() => handleIconClick('/change-catalog')}
                    data-tooltip="Change Catalog"
                    aria-label="Change Catalog"
                >
                    <ChangecatalogIcon />
                    <span className="sidebar-icon-label">Change Catalog</span>
                </div>
                <div
                    onClick={() => handleIconClick('/organization')}
                    data-tooltip="Organization"
                    aria-label="Organization"
                >
                    <OrganizationIcon />
                    <span className="sidebar-icon-label">Organization</span>
                </div>
                <div
                    onClick={() => handleIconClick('/users')}
                    data-tooltip="Users"
                    aria-label="Users"
                >
                    <UsersIcon />
                    <span className="sidebar-icon-label">Users</span>
                </div>
                <div
                    onClick={() => handleIconClick('/settings')}
                    data-tooltip="Settings"
                    aria-label="Settings"
                >
                    <SettingIcon />

                    <span className="sidebar-icon-label">Settings</span>
                </div>
            </div>
            <div className="sidebar-bottom">
                <div
                    className="sidebarbottom-collapse"
                    onClick={handleToggle}
                    aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
                >
                    <CollapseIcon />
                </div>
            </div>
        </div>
    );
}

export default Sidebar;