import './list.css';
import TicketlistLeft from '../../components/ticket-list-components/ticket-list/ticket-list-left';
import  TicketTableList from '../../components/ticket-list-components/ticket-list/ticket-list-right';
import type { Ticket } from '../ticket-form/form';
import { decryptData } from '../../utils/cryptoUtils';
import { useState, useEffect } from 'react';

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const aesKey = import.meta.env.VITE_AES_KEY;

  // Load tickets from localStorage and decrypt on mount
  useEffect(() => {
    if (!aesKey) return;

    const loadTickets = async () => {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) {
        try {
          const decrypted = await decryptData(savedTickets, aesKey);
          setTickets(JSON.parse(decrypted));
        } catch (error) {
          console.error('Failed to decrypt tickets:', error);
          setTickets([]);
        }
      }
    };
    loadTickets();
  }, [aesKey]);

  return (
    <div className="ticket-list-container">
      <TicketlistLeft />
      <TicketTableList tickets={tickets} />
    </div>
  );
}

export default TicketList;
