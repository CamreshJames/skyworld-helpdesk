import './list.css';
import TicketlistLeft from '../../components/ticket-list-components/ticket-list/ticket-list-left';
import TicketTableList from '../../components/ticket-list-components/ticket-list/ticket-list-right';
import type { Ticket } from '../ticket-form/form';
import { decryptData, encryptData } from '../../utils/cryptoUtils';
import { useState, useEffect } from 'react';

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('Open');
  const aesKey = import.meta.env.VITE_AES_KEY;

  // Load tickets from localStorage and decrypt on mount
  useEffect(() => {
    if (!aesKey) return;

    const loadTickets = async () => {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) {
        try {
          const decrypted = await decryptData(savedTickets, aesKey);
          const parsed = JSON.parse(decrypted);
          const updated = parsed.map((t: Ticket) => ({
            ...t,
            status: t.status || 'Open',
            source: t.source || 'Helpdesk'
          }));
          setTickets(updated);
        } catch (error) {
          console.error('Failed to decrypt tickets:', error);
          setTickets([]);
        }
      }
    };
    loadTickets();
  }, [aesKey]);

  // Save tickets to localStorage when tickets change
  useEffect(() => {
    if (!aesKey || tickets.length === 0) return;

    const saveTickets = async () => {
      try {
        const encryptedTickets = await encryptData(JSON.stringify(tickets), aesKey);
        localStorage.setItem('tickets', encryptedTickets);
        sessionStorage.setItem('tickets', encryptedTickets);
      } catch (error) {
        console.error('Failed to save tickets:', error);
      }
    };
    saveTickets();
  }, [tickets, aesKey]);

  // Listen for storage changes (for cross-tab updates)
  useEffect(() => {
    if (!aesKey) return;

    const handleStorage = async (e: StorageEvent) => {
      if (e.key === 'tickets' && e.newValue) {
        try {
          const decrypted = await decryptData(e.newValue, aesKey);
          const parsed = JSON.parse(decrypted);
          const updated = parsed.map((t: Ticket) => ({
            ...t,
            status: t.status || 'Open',
            source: t.source || 'Helpdesk'
          }));
          setTickets(updated);
        } catch (error) {
          console.error('Failed to decrypt tickets from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [aesKey]);

  return (
    <div className="ticket-list-container">
      <TicketlistLeft tickets={tickets} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} />
      <TicketTableList tickets={tickets} selectedStatus={selectedStatus} setTickets={setTickets} />
    </div>
  );
}

export default TicketList;