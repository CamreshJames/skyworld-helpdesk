import Table from '../../../utils/table/Table.tsx';
import type { ColumnProps } from '../../../utils/table/Table.tsx';
import type { Ticket } from '../../../pages/ticket-form/form.tsx';
import './ticket-list-right.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttachmentPinIcon } from '../../../utils/icons';

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
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ticket Details and Update</h2>
        
        <div className="modal-details">
          <h3>Ticket Information</h3>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Ticket ID</span>
            <span className="modal-detail-value">{ticket.id}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Main Category</span>
            <span className="modal-detail-value">{ticket.mainCategory}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Sub Category</span>
            <span className="modal-detail-value">{ticket.subCategory}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Problem/Issue</span>
            <span className="modal-detail-value">{ticket.problemIssue}</span>
          </div>
          <div className="modal-detail-row">
            <span className="modal-detail-label">Created At</span>
            <span className="modal-detail-value">{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="modal-description">
          <h3>Description</h3>
          <div className="modal-description-content" dangerouslySetInnerHTML={{ __html: ticket.description }} />
        </div>

        <div className="modal-attachments">
          <h3>Attachments</h3>
          {ticket.attachments.length > 0 ? (
            ticket.attachments.map(attachment => (
              <div key={attachment.id} className="modal-attachment-item">
                <AttachmentPinIcon />
                <span className="modal-attachment-name">{attachment.name}</span>
                <span className="modal-attachment-size">({formatFileSize(attachment.size)})</span>
              </div>
            ))
          ) : (
            <p className="no-attachments">No attachments available.</p>
          )}
        </div>

        <div className="modal-update-section">
          <h3>Update Ticket</h3>
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

  const navigate = useNavigate();

  const handleIconClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="ticket-list-right">
      <div className="ticket-list-right-header">
        <span>All Tickets</span>
        <button onClick={() => handleIconClick('/ticket-form')} className="add-ticket-button">Add Ticket</button>
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