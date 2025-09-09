import './App.css';
import Header from './lib/components/header/header.tsx';
import Sidebar from './lib/components/sidebar/sidebar.tsx';
import Footer from './lib/components/footer/footer.tsx';
import TicketForm from './lib/pages/ticket-form/form.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getEnvConfig } from './lib/utils/envUtils';
import TicketList from './lib/pages/ticket-list/list.tsx';

function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#144D5A' }}>
      {pageName} - Coming Soon
    </div>
  );
}

function App() {
  const { companyName, badgeText } = getEnvConfig();

 

  return (
    <Router>
      <div className="app-container">
        <Header companyName={companyName} badgeText={badgeText} />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<TicketList/>} />
              <Route path="/home" element={<ComingSoonPage pageName="Home" />} />
              <Route path="/ticket-form" element={<TicketForm />} />
              <Route path="/search" element={<ComingSoonPage pageName="Search" />} />
              <Route path="/notifications" element={<ComingSoonPage pageName="Notification" />} />
              <Route path="/profile" element={<ComingSoonPage pageName="Profile" />} />
              <Route path="/tickets" element={<TicketList/>} />
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
