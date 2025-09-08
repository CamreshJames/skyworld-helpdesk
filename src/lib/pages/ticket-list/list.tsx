import './list.css';

const dummyTickets = [
  { id: 1, summary: 'Login issue', priority: 'High', status: 'Open' },
  { id: 2, summary: 'UI bug on dashboard', priority: 'Medium', status: 'In Progress' },
  { id: 3, summary: 'Feature request: Export to PDF', priority: 'Low', status: 'Closed' },
  { id: 4, summary: 'API connection failure', priority: 'High', status: 'Open' },
];

function TicketList() {
  return (
    <div className="ticket-list-container">
      <h2>Ticket List</h2>
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Summary</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dummyTickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.summary}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketList;