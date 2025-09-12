import Table from '../../../utils/table/Table.tsx';
import type { ColumnProps } from '../../../utils/table/Table.tsx';
import type { Ticket } from '../../../pages/ticket-form/form.tsx';
import './ticket-list-right.css';
import { Link } from '@tanstack/react-router';

interface TicketTableListProps {
  tickets: Ticket[];
  selectedStatus: string;
  setTickets: (tickets: Ticket[]) => void;
}

function TicketTableList({ tickets, selectedStatus}: TicketTableListProps) {
  const filteredTickets = selectedStatus === 'All'
    ? tickets
    : tickets.filter(t => t.status === selectedStatus);

  const ticketColumnsMap: Record<string, Partial<ColumnProps<Ticket>>> = {
    id: { caption: 'Ticket ID', size: 150 },
    subject: {
      caption: 'Ticket Subject',
      size: 250,
      render: (data: Ticket) => (
        <Link to={`/ticket/${data.id}`}>
          {`${data.mainCategory} - ${data.subCategory}`}
        </Link>
      )
    },
    status: { caption: 'Ticket Status', size: 150 },
    source: { caption: 'Source', size: 150 },
    createdAt: { caption: 'Date Requested', size: 200, data_type: 'date' }
  };

  return (
    <div className="ticket-list-right">
      <div className="ticket-list-right-header">
        <span>All Tickets</span>
        <Link to="/ticket-form">
          <button className="add-ticket-button">Add Ticket</button>
        </Link>
      </div>
      <Table data={filteredTickets} columnsMap={ticketColumnsMap} />
    </div>
  );
}

export default TicketTableList;