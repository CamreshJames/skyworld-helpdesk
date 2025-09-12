// sidebar.tsx
import './sidebar.css';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChangecatalogIcon, CollapseIcon, OrganizationIcon, PiedashboardIcon, SettingIcon, TicketsIcon, UsersIcon } from '../../utils/icons';

interface SidebarProps {
  onToggle: (isExpanded: boolean) => void;
}

function Sidebar({ onToggle }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle(newState);
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
      <div className="sidebar-top">
        <Link to="/" className="sidebar-link" data-tooltip="Dashboard" aria-label="Dashboard">
          <PiedashboardIcon />
          <span className="sidebar-icon-label">Dashboard</span>
        </Link>
        <Link to="/tickets" className="sidebar-link" data-tooltip="Tickets" aria-label="Tickets">
          <TicketsIcon />
          <span className="sidebar-icon-label">Tickets</span>
        </Link>
        <Link to="/change-catalog" className="sidebar-link" data-tooltip="Change Catalog" aria-label="Change Catalog">
          <ChangecatalogIcon />
          <span className="sidebar-icon-label">Change Catalog</span>
        </Link>
        <Link to="/organization" className="sidebar-link" data-tooltip="Organization" aria-label="Organization">
          <OrganizationIcon />
          <span className="sidebar-icon-label">Organization</span>
        </Link>
        <Link to="/users" className="sidebar-link" data-tooltip="Users" aria-label="Users">
          <UsersIcon />
          <span className="sidebar-icon-label">Users</span>
        </Link>
        <Link to="/settings" className="sidebar-link" data-tooltip="Settings" aria-label="Settings">
          <SettingIcon />
          <span className="sidebar-icon-label">Settings</span>
        </Link>
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