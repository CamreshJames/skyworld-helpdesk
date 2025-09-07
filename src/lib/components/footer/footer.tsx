import { SkyWorldIcon, UserlineIcon } from '../../utils/icons'
import './footer.css'
function Footer(){
    return (
        <>
            <div className="footer">
                <div className="right">
                    <div className="skyworld">
                        <SkyWorldIcon/>
                    </div>
                    <div className="skyworld-text">
                        <span>Sky World Limited</span>
                    </div>
                </div>
                <div className="left">
                    <div className="user-line">
                        <UserlineIcon/>
                    </div>
                    <div className="user-line-text">
                        James Mwangi
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer