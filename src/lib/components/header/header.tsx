import { AddIcon, HeadphonesIcon, NotificationbellIcon, SearchIcon, UserIcon } from '../../utils/icons';
import './header.css';
import { Link } from '@tanstack/react-router';

interface HeaderProps {
  companyName: string;
  badgeText: 'Client' | 'Vendor';
}

function Header({ companyName, badgeText }: HeaderProps) {
  const badgeClass = badgeText === 'Client' ? 'client-badge' : 'vendor-badge';

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/home" className="helpdesk">
          <HeadphonesIcon />
        </Link>
        <div className="helpdesk-text">
          <span>Help Desk - {companyName}</span>
        </div>
        <div className={`helpdesk-badge ${badgeClass}`}>
          <span>{badgeText}</span>
        </div>
      </div>
      <div className="header-right">
        <Link to="/ticket-form" className="helpdesk-add">
          <AddIcon />
        </Link>
        <Link to="/search" className="helpdesk-search">
          <SearchIcon />
        </Link>
        <div className="helpdesk-dropdown">
          <select name="SelectSacco" id="sacco">
            <option>Apstar SACCO Limited</option>
            <option>Sky World Limited</option>
            <option>Another Org</option>
          </select>
        </div>
        <Link to="/notifications" className="helpdesk-bell">
          <NotificationbellIcon />
        </Link>
        <Link to="/profile" className="helpdesk-user">
          <UserIcon />
        </Link>
      </div>
    </div>
  );
}

export default Header;