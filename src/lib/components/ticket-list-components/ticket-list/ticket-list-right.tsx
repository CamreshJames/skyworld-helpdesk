import Table from '../../../utils/table/Table.tsx';
import type { ColumnProps } from '../../../utils/table/Table.tsx';
import type { Ticket } from '../../../pages/ticket-form/form.tsx';
import './ticket-list-right.css';
import { useState } from 'react';
import { encryptData } from '../../../utils/cryptoUtils';

interface TicketTableListProps {
  tickets: Ticket[];
  selectedStatus: string;
  setTickets: (tickets: Ticket[]) => void;
}

const statuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'Dropped', 'On Hold'];

function TicketEditModal({ ticket, onClose, onSave }: { ticket: Ticket; onClose: () => void; onSave: (updated: Ticket) => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [source, setSource] = useState(ticket.source);
  const aesKey = import.meta.env.VITE_AES_KEY;

  const handleSave = async () => {
    if (!aesKey) return;
    const updatedTicket = { ...ticket, status, source };
    onSave(updatedTicket);
    try {
      const encryptedTickets = await encryptData(JSON.stringify([updatedTicket]), aesKey);
      localStorage.setItem('tickets', encryptedTickets);
      sessionStorage.setItem('tickets', encryptedTickets);
    } catch (error) {
      console.error('Failed to save updated ticket:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Ticket</h2>
        <div className="modal-form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>Source</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function TicketTableList({ tickets, selectedStatus, setTickets }: TicketTableListProps) {
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const filteredTickets = selectedStatus === 'All'
    ? tickets
    : tickets.filter(t => t.status === selectedStatus);

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
  };

  const handleSave = (updated: Ticket) => {
    setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    setEditingTicket(null);
  };

  const ticketColumnsMap: Record<string, Partial<ColumnProps<Ticket>>> = {
    id: { caption: 'Ticket ID', size: 150 },
    subject: {
      caption: 'Ticket Subject',
      size: 250,
      render: (data: Ticket) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleEdit(data);
          }}
        >
          {`${data.problemIssue}`}
        </a>
      )
    },
    status: { caption: 'Ticket Status', size: 150 },
    source: { caption: 'Source', size: 150 },
    createdAt: { caption: 'Date Requested', size: 200, data_type: 'date' }
  };

  return (
    <div className="ticket-list-right">
      <div className="ticket-list-right-header">
        All Tickets
      </div>
      <Table data={filteredTickets} columnsMap={ticketColumnsMap} />
      {editingTicket && (
        <TicketEditModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default TicketTableList;