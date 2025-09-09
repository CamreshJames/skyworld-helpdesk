import './App.css';
import Header from './lib/components/header/header.tsx';
import Sidebar from './lib/components/sidebar/sidebar.tsx';
import Footer from './lib/components/footer/footer.tsx';
import TicketForm from './lib/pages/ticket-form/form.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Table from './lib/utils/table/Table.tsx';
import type { ColumnProps } from './lib/utils/table/Table.tsx'
import { getEnvConfig } from './lib/utils/envUtils';
import { decryptData } from './lib/utils/cryptoUtils';
import { useEffect, useState } from 'react';

// Ticket type from TicketForm.tsx
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Ticket {
  id: string;
  mainCategory: string;
  subCategory: string;
  problemIssue: string;
  description: string;
  attachments: Attachment[];
  createdAt: string;
}

function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      fontSize: '2rem', 
      color: '#144D5A'
    }}>
      {pageName} - Coming Soon
    </div>
  );
}

function App() {
  // Read environment variables
  const { companyName, badgeText } = getEnvConfig();

  // State for tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const aesKey = import.meta.env.VITE_AES_KEY;

  // Load tickets from localStorage on mount
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

  // Columns configuration for ticket table
  const ticketColumnsMap: Record<string, Partial<ColumnProps<Ticket>>> = {
    id: { hide: true },
    mainCategory: {
      caption: 'Main Category',
      size: 200
    },
    subCategory: {
      caption: 'Sub Category',
      size: 200
    },
    problemIssue: {
      caption: 'Problem/Issue',
      size: 250
    },
    description: {
      size: 300,
      render: (data: Ticket) => (
        <div
          dangerouslySetInnerHTML={{ __html: data.description }}
          style={{ maxHeight: '100px', overflowY: 'auto' }}
        />
      )
    },
    attachments: {
      caption: 'Attachments',
      size: 200,
      render: (data: Ticket) => data.attachments.map((att: Attachment) => att.name).join(', ') || 'None'
    },
    createdAt: {
      caption: 'Created At',
      size: 200,
      data_type: 'date'
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Header companyName={companyName} badgeText={badgeText} />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<ComingSoonPage pageName="Dashboard" />} />
              <Route path="/home" element={<ComingSoonPage pageName="Home" />} />
              <Route path="/ticket-form" element={<TicketForm />} />
              <Route path="/search" element={<ComingSoonPage pageName="Search" />} />
              <Route path="/notifications" element={<ComingSoonPage pageName="Notification" />} />
              <Route path="/profile" element={<ComingSoonPage pageName="Profile" />} />
              <Route
                path="/tickets"
                element={<Table data={tickets} columnsMap={ticketColumnsMap} />}
              />
              <Route path="/change-catalog" element={<ComingSoonPage pageName="Change Catalog" />} />
              <Route path="/organization" element={<ComingSoonPage pageName="Organization" />} />
              <Route path="/users" element={<ComingSoonPage pageName="Users" />} />
              <Route path="/settings" element={<ComingSoonPage pageName="Settings" />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;