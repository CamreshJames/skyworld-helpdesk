import { AddIcon, HeadphonesIcon, NotificationbellIcon, SearchIcon, UserIcon } from '../../utils/icons';
import './header.css'
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleIconClick = (path: string) => {
        navigate(path);
    }
    return (
        <>
            <div className="header">
                <div className="header-left">
                    <div className="helpdesk"
                        onClick={() => handleIconClick('/home')}
                    >
                        <HeadphonesIcon />
                    </div>
                    <div className="helpdesk-text">
                        <span>Help Desk - Sky World Limited</span>
                    </div>
                    <div className="helpdesk-badge">
                        <span>VENDOR</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="helpdesk-add"
                        onClick={() => handleIconClick('/ticket-form')}>
                        <AddIcon />
                    </div>
                    <div className="helpdesk-search"
                        onClick={() => handleIconClick('/search')}>
                        <SearchIcon />
                    </div>
                    <div className="helpdesk-dropdown">
                        <select name="SelectSacco" id="sacco">
                            <option>Apstar SACCO Limited</option>
                            <option>Sky World Limited</option>
                            <option>Another Org</option>
                        </select>
                    </div>
                    <div className="helpdesk-bell"
                        onClick={() => handleIconClick('/notifications')}
                    >
                        <NotificationbellIcon />
                    </div>
                    <div className="helpdesk-user"
                        onClick={() => handleIconClick('/profile')}
                    >
                        <UserIcon />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Header;