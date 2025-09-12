import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { decryptData, encryptData } from '../../utils/cryptoUtils';
import type { Ticket } from '../../pages/ticket-form/form.tsx';
import './ticket-view.css';

const statuses = ['Open', 'In Progress', 'Resolved', 'Closed', 'Dropped', 'On Hold'];

function TicketView() {
  const { id } = useParams({ from: '/ticket/$id' });
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const aesKey = import.meta.env.VITE_AES_KEY;
  const navigate = useNavigate();

  // Fetch ticket on mount or when id changes
  useEffect(() => {
    const fetchTicket = async () => {
      if (!aesKey || !id) return;
      try {
        const savedTickets = localStorage.getItem('tickets');
        if (savedTickets) {
          const decrypted = await decryptData(savedTickets, aesKey);
          const allTickets: Ticket[] = JSON.parse(decrypted);
          const foundTicket = allTickets.find(t => t.id === id);
          if (foundTicket) {
            setTicket(foundTicket);
            setStatus(foundTicket.status || 'Open');
            setSource(foundTicket.source || 'Helpdesk');
          } else {
            navigate({ to: '/tickets' });
          }
        } else {
          navigate({ to: '/tickets' });
        }
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        navigate({ to: '/tickets' });
      }
    };
    fetchTicket();
  }, [id, aesKey, navigate]);

  // Handle saving updated ticket
  const handleSave = async () => {
    if (!ticket || !aesKey) return;
    const updatedTicket = { ...ticket, status, source };
    try {
      const savedTickets = localStorage.getItem('tickets');
      let allTickets: Ticket[] = [];
      if (savedTickets) {
        const decrypted = await decryptData(savedTickets, aesKey);
        allTickets = JSON.parse(decrypted);
      }
      allTickets = allTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t));
      const encryptedTickets = await encryptData(JSON.stringify(allTickets), aesKey);
      localStorage.setItem('tickets', encryptedTickets);
      sessionStorage.setItem('tickets', encryptedTickets);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save updated ticket:', error);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors = {
      'Open': 'hsla(27, 98%, 54%, 1)',
      'In Progress': 'hsla(208, 77%, 47%, 1)',
      'Resolved': 'hsla(131, 53%, 46%, 1)',
      'Closed': 'hsla(162, 87%, 35%, 1)',
      'Dropped': 'hsla(0, 86%, 59%, 1)',
      'On Hold': 'hsla(222, 5%, 38%, 1)'
    };

    return colors[status as keyof typeof colors] || '#6b7280';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!ticket) {
    return (
      <div className="ticket-view-container">
        <div className="ticket-view-header">
          <div className="header-content">
            <button onClick={() => navigate({ to: '/tickets' })} className="back-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Tickets
            </button>
            <h1>Loading...</h1>
          </div>
        </div>
        <div className="ticket-view-loading">
          <div className="loading-spinner"></div>
          Loading ticket details...
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-view-container">
      <div className="ticket-view-header">
        <div className="header-content">
          <button onClick={() => navigate({ to: '/tickets' })} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Tickets
          </button>
          <div className="header-title">
            <h1>Ticket #{ticket.id}</h1>
            <div className="ticket-meta">
              <span className="category-badge">{ticket.mainCategory}</span>
              <span className="separator">•</span>
              <span className="subcategory">{ticket.subCategory}</span>
            </div>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="edit-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.854 2.854a.5.5 0 0 0-.708-.708L8 6.293 5.854 4.146a.5.5 0 1 0-.708.708L7.293 7 5.146 9.146a.5.5 0 0 0 .708.708L8 7.707l2.146 2.147a.5.5 0 0 0 .708-.708L8.707 7l2.147-2.146Z"/>
                  <path d="M11.5 1a.5.5 0 0 1 .5.5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 .5-.5Z"/>
                </svg>
                Edit Ticket
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-button">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="cancel-edit-button">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ticket-view-content">
        <div className="attachment-main-content">
          {/* Status and Info Cards */}
          <div className="info-cards">
            <div className="status-card">
              <div className="card-header">
                <h3>Status & Information</h3>
              </div>
              <div className="status-display">
                <div className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
                  {status}
                </div>
                <div className="created-date">Created {formatDate(ticket.createdAt)}</div>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Source</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{source}</span>
                  )}
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  {isEditing ? (
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="edit-select">
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="info-value">{status}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="details-card">
              <div className="card-header">
                <h3>Ticket Details</h3>
              </div>
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Problem/Issue</span>
                  <span className="detail-value">{ticket.problemIssue}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Main Category</span>
                  <span className="detail-value">{ticket.mainCategory}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sub Category</span>
                  <span className="detail-value">{ticket.subCategory}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="description-card">
            <div className="card-header">
              <h3>Description</h3>
            </div>
            <div className="description-content">
              <div dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>
          </div>
        </div>

        {/* Attachments Sidebar */}
        <div className="attachments-sidebar">
          <div className="attachment-sidebar-header">
            <h3>Attachments</h3>
            <span className="attachment-count">{ticket.attachments.length}</span>
          </div>
          
          {ticket.attachments.length > 0 ? (
            <div className="attachments-grid">
              {ticket.attachments.map(attachment => (
                <div key={attachment.id} className="attachment-card">
                  <div className="attachment-preview">
                    {attachment.type.startsWith('image/') && attachment.base64 ? (
                      <img
                        src={attachment.base64}
                        alt={attachment.name}
                        className="preview-image"
                      />
                    ) : (
                      <div className="pdf-preview">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="attachment-info">
                    <div className="attachment-name" title={attachment.name}>
                      {attachment.name}
                    </div>
                    <div className="attachment-size">
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-attachments">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path>
              </svg>
              <p>No attachments available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketView;