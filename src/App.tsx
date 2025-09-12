import './App.css';
import Header from './lib/components/header/header.tsx';
import Sidebar from './lib/components/sidebar/sidebar.tsx';
import Footer from './lib/components/footer/footer.tsx';
import TicketForm from './lib/pages/ticket-form/form.tsx';
import TicketList from './lib/pages/ticket-list/list.tsx';
import TicketView from './lib/pages/ticket-list/ticket-view.tsx';
import Login from './lib/pages/auth/login.tsx';
import Register from './lib/pages/auth/register.tsx';
import ForgotPassword from './lib/pages/auth/forgot-password.tsx';
import { getEnvConfig } from './lib/utils/envUtils';
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { useState } from 'react';

function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#144D5A' }}>
      {pageName} - Coming Soon
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => {
    const isAuthenticated = !!localStorage.getItem('currentUser');
    const { companyName, badgeText } = getEnvConfig();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return isAuthenticated ? (
      <div className="app-container">
        <Header companyName={companyName} badgeText={badgeText} />
        <div className="main-content">
          <Sidebar onToggle={setIsSidebarExpanded} />
          <main className={`content-area ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
    ) : (
      <Outlet />
    );
  },
});

const authRedirect = () => {
  const isAuthenticated = !!localStorage.getItem('currentUser');
  if (isAuthenticated) {
    throw redirect({
      to: '/',
      replace: true,
    });
  }
};

const protectedRedirect = () => {
  const isAuthenticated = !!localStorage.getItem('currentUser');
  if (!isAuthenticated) {
    throw redirect({
      to: '/auth/login',
      replace: true,
    });
  }
};

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'login',
  beforeLoad: authRedirect,
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'register',
  beforeLoad: authRedirect,
  component: Register,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'forgot-password',
  beforeLoad: authRedirect,
  component: ForgotPassword,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: protectedRedirect,
  component: TicketList,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Home" />,
});

const ticketFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ticket-form',
  beforeLoad: protectedRedirect,
  component: TicketForm,
});

const ticketViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ticket/$id',
  beforeLoad: protectedRedirect,
  component: TicketView,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Search" />,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Notification" />,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Profile" />,
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets',
  beforeLoad: protectedRedirect,
  component: TicketList,
});

const changeCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/change-catalog',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Change Catalog" />,
});

const organizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organization',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Organization" />,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Users" />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: protectedRedirect,
  component: () => <ComingSoonPage pageName="Settings" />,
});

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute, forgotPasswordRoute]),
  indexRoute,
  homeRoute,
  ticketFormRoute,
  ticketViewRoute,
  searchRoute,
  notificationsRoute,
  profileRoute,
  ticketsRoute,
  changeCatalogRoute,
  organizationRoute,
  usersRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;