import "./ticket-list-left.css";
import TicketStatusCount from "../ticket-count-status";
import type { Ticket } from '../../../pages/ticket-form/form';

interface TicketlistLeftProps {
  tickets: Ticket[];
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

const statusConfigs = [
  { color: "hsla(190, 68%, 23%, 1)", name: "All" },
  { color: "hsla(27, 98%, 54%, 1)", name: "Open" },
  { color: "hsla(208, 77%, 47%, 1)", name: "In Progress" },
  { color: "hsla(131, 53%, 46%, 1)", name: "Resolved" },
  { color: "hsla(162, 87%, 35%, 1)", name: "Closed" },
  { color: "hsla(0, 86%, 59%, 1)", name: "Dropped" },
  { color: "hsla(222, 5%, 38%, 1)", name: "On Hold" }
];

function TicketlistLeft({ tickets, selectedStatus, setSelectedStatus }: TicketlistLeftProps) {
  return (
    <div className="ticket-list-left">
      <div className="ticket-list-left-header">
        All Tickets
      </div>
      <div className="ticket-list-left-body">
        {statusConfigs.map(({ color, name }) => {
          const count = name === "All" ? tickets.length : tickets.filter(t => t.status === name).length;
          return (
            <TicketStatusCount
              key={name}
              color={color}
              name={name}
              count={count}
              onClick={() => setSelectedStatus(name)}
              selected={selectedStatus === name}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TicketlistLeft;