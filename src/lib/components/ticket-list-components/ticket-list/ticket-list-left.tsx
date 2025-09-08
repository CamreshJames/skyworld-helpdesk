import "./ticket-list-left.css"
import TicketStatusCount from "../ticket-count-status"

function TicketlistLeft() {
  return (
    <div className="ticket-list-left">
      <div className="ticket-list-left-header">
        All Tickets
      </div>
      <div className="ticket-list-left-body">
        <TicketStatusCount color="hsla(190, 68%, 23%, 1)" name="All" count={0} />
        <TicketStatusCount color="hsla(27, 98%, 54%, 1)" name="Open" count={0} />
        <TicketStatusCount color="hsla(208, 77%, 47%, 1)" name="In Progress" count={0} />
        <TicketStatusCount color="hsla(131, 53%, 46%, 1)" name="Resolved" count={0} />
        <TicketStatusCount color="hsla(162, 87%, 35%, 1)" name="Closed" count={0} />
        <TicketStatusCount color="hsla(0, 86%, 59%, 1)" name="Dropped" count={0} />
        <TicketStatusCount color="hsla(222, 5%, 38%, 1)" name="On Hold" count={0} />
      </div>
    </div>
  )
}

export default TicketlistLeft
