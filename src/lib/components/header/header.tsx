import './header.css'
import { useNavigate } from 'react-router-dom';

function Header(){
    const navigate = useNavigate();

    const handleIconClick = (path:string) => {
        navigate(path);
    }
    return(
    <>
        <div className="header">
            <div className="header-left">
                <div className="helpdesk"
                     onClick={() => handleIconClick('/home')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1C7 1 3 5 3 10V17C3 17.7956 3.31607 18.5587 3.87868 19.1213C4.44129 19.6839 5.20435 20 6 20H9V12H5V10C5 8.14348 5.7375 6.36301 7.05025 5.05025C8.36301 3.7375 10.1435 3 12 3C13.8565 3 15.637 3.7375 16.9497 5.05025C18.2625 6.36301 19 8.14348 19 10V12H15V20H19V21H12V23H18C18.7956 23 19.5587 22.6839 20.1213 22.1213C20.6839 21.5587 21 20.7956 21 20V10C21 5 16.97 1 12 1Z" fill="white"/>
                    </svg>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="white"/>
                    </svg>
                </div>
                <div className="helpdesk-search"
                onClick={() => handleIconClick('/search')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="white"/>
                    </svg>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 21H14C14 22.1 13.1 23 12 23C10.9 23 10 22.1 10 21ZM21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2C13.1 2 14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19ZM17 11C17 8.2 14.8 6 12 6C9.2 6 7 8.2 7 11V18H17V11Z" fill="white"/>
                    </svg>
                </div>
                <div className="helpdesk-user"
                     onClick={() => handleIconClick('/profile')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.16797 18.849C6.41548 18.0252 6.92194 17.3032 7.61222 16.79C8.30249 16.2768 9.13982 15.9997 9.99997 16H14C14.8612 15.9997 15.6996 16.2774 16.3904 16.7918C17.0811 17.3062 17.5874 18.0298 17.834 18.855M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z" stroke="#CED4DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    </>
    )
}
export default Header;