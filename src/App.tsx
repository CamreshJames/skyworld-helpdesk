import './App.css';
import Header from './lib/components/header/header.tsx';
import Sidebar from './lib/components/sidebar/sidebar.tsx';
import Footer from './lib/components/footer/footer.tsx';
import TicketForm from './lib/pages/ticket-form/form.tsx';
import TicketList from './lib/pages/ticket-list/list.tsx'; // Corrected import path based on your structure
import { getEnvConfig } from './lib/utils/envUtils';
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#144D5A' }}>
      {pageName} - Coming Soon
    </div>
  );
}

// Define the root route with the layout
const rootRoute = createRootRoute({
  component: () => {
    const { companyName, badgeText } = getEnvConfig();
    return (
      <div className="app-container">
        <Header companyName={companyName} badgeText={badgeText} />
        <div className="main-content">
          <Sidebar />
          <main className="content-area">
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
    );
  },
});

// Define child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TicketList,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: () => <ComingSoonPage pageName="Home" />,
});

const ticketFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ticket-form',
  component: TicketForm,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: () => <ComingSoonPage pageName="Search" />,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => <ComingSoonPage pageName="Notification" />,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <ComingSoonPage pageName="Profile" />,
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets',
  component: TicketList,
});

const changeCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/change-catalog',
  component: () => <ComingSoonPage pageName="Change Catalog" />,
});

const organizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organization',
  component: () => <ComingSoonPage pageName="Organization" />,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: () => <ComingSoonPage pageName="Users" />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <ComingSoonPage pageName="Settings" />,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  ticketFormRoute,
  searchRoute,
  notificationsRoute,
  profileRoute,
  ticketsRoute,
  changeCatalogRoute,
  organizationRoute,
  usersRoute,
  settingsRoute,
]);

// Create the router instance
const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;