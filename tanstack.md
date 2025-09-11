Routing with TanStack Router
🚀 Introduction
TanStack Router (formerly React Router) is a powerful, type-safe routing solution for React applications. It provides a modern approach to client-side routing with features like file-based routing, nested routes, and built-in data loading. This guide will help you understand and implement routing in your React applications using TanStack Router.

Why Use TanStack Router?
Type Safety: Ensures your routes and parameters are type-checked.
Nested Routes: Simplifies complex layouts with nested routing.
Data Loading: Built-in support for fetching data before rendering.
File-Based Routing: Automatically generates routes based on file structure.
SSR Support: Optimized for server-side rendering and hydration.
TanStack Router is ideal for modern React applications that require robust routing capabilities with minimal boilerplate.

📦 Installation
To get started with TanStack Router, install it using pnpm:


# Using pnpm
pnpm install @tanstack/react-router
 
 
 
 
---
 
## 🛠 Basic Concepts
 
### Router
 
The router is the central piece of TanStack Router. It manages all routes, navigation, and history.
 
```jsx
import { Router, RouterProvider } from '@tanstack/react-router'
 
// Create a new router instance
const router = new Router({
  routeTree,
  defaultPreload: 'intent',
})
 
function App() {
  return <RouterProvider router={router} />
}
Route Tree
TanStack Router uses a route tree structure to define your application's routing. Routes can be nested, and each route can have its own layout, data loaders, and components.


import { RootRoute, Route, createRootRoute } from '@tanstack/react-router'
 
const rootRoute = createRootRoute()
 
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
})
 
const usersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'users',
  component: UsersComponent,
})
 
// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
])
📂 File-Based Routing
TanStack Router supports file-based routing, which automatically creates routes based on your file structure. This approach simplifies route management and follows conventions that many developers are familiar with.

Directory Structure Example

src/
  routes/
    _root.tsx         # Root layout
    index.tsx         # Home page (/)
    about.tsx         # About page (/about)
    users/
      index.tsx       # Users list page (/users)
      $userId.tsx     # User detail page (/users/:userId)
    settings.tsx      # Settings page (/settings)
Route File Example

// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'
 
export const Route = createFileRoute('/users/$userId')({
  component: UserComponent,
  loader: async ({ params }) => {
    // Load user data
    const response = await fetch(`/api/users/${params.userId}`)
    return response.json()
  },
})
 
function UserComponent() {
  const { userId } = Route.useParams()
  const userData = Route.useLoaderData()
 
  return (
    <div>
      <h1>User: {userId}</h1>
      <pre>{JSON.stringify(userData, null, 2)}</pre>
    </div>
  )
}
🔄 Route Parameters
TanStack Router makes it easy to work with dynamic route parameters, which are denoted by a $ prefix in the route path.

Defining Parameters

// Define a route with parameters
const userRoute = new Route({
  getParentRoute: () => usersRoute,
  path: '$userId',
  component: UserComponent,
})
Accessing Parameters

function UserComponent() {
  // Access the userId parameter
  const { userId } = Route.useParams()
 
  return <div>User ID: {userId}</div>
}
🧭 Navigation
TanStack Router provides several methods for navigating between routes in your application.

Link Component

import { Link } from '@tanstack/react-router'
 
function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>
      <Link to="/about">About</Link>
 
      {/* With parameters */}
      <Link to="/users/$userId" params={{ userId: '123' }}>
        View User 123
      </Link>
    </nav>
  )
}
Programmatic Navigation

import { useNavigate } from '@tanstack/react-router'
 
function UserActions() {
  const navigate = useNavigate()
 
  const handleCreate = async (userData) => {
    const newUser = await createUser(userData)
    // Navigate to the new user's page
    navigate({ to: '/users/$userId', params: { userId: newUser.id } })
  }
 
  return <button onClick={handleCreate}>Create User</button>
}
📊 Data Loading and Mutations
TanStack Router integrates seamlessly with data fetching through route loaders and actions.

Loaders
Loaders are functions that fetch data before a route is rendered:


const usersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'users',
  component: UsersComponent,
  loader: async () => {
    const response = await fetch('/api/users')
    return response.json()
  }
})
 
function UsersComponent() {
  const users = usersRoute.useLoaderData()
 
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
Actions
Actions handle form submissions and other mutations:


const newUserRoute = new Route({
  getParentRoute: () => usersRoute,
  path: 'new',
  component: NewUserComponent,
  action: async ({ formData }) => {
    const name = formData.get('name')
    const email = formData.get('email')
 
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
 
    return response.json()
  }
})
 
function NewUserComponent() {
  const actionData = newUserRoute.useActionData()
 
  return (
    <div>
      <h1>Create New User</h1>
      <Form action="/users/new">
        <input name="name" placeholder="Name" />
        <input name="email" placeholder="Email" />
        <button type="submit">Create</button>
      </Form>
 
      {actionData && <div>User created: {actionData.name}</div>}
    </div>
  )
}
Route Guards and Authorization
You can protect routes by implementing guards in your route definitions:


const adminRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: AdminComponent,
  beforeLoad: async () => {
    // Check if user is authenticated and has admin privileges
    const user = await getCurrentUser()
 
    if (!user || !user.isAdmin) {
      // Redirect to login
      throw redirect({
        to: '/login',
        search: {
          returnTo: '/admin',
        }
      })
    }
 
    return { user }
  }
})
Nested Routes and Layouts
TanStack Router excels at nested routing, allowing you to create layouts that wrap child routes:


const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardLayout,
})
 
const dashboardHomeRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardHome,
})
 
const dashboardAnalyticsRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'analytics',
  component: DashboardAnalytics,
})
 
function DashboardLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <nav>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/analytics">Analytics</Link>
      </nav>
 
      {/* Outlet renders the matching child route */}
      <Outlet />
 
      <footer>Dashboard Footer</footer>
    </div>
  )
}
Error Handling
TanStack Router provides built-in error handling for routes:


const userRoute = new Route({
  getParentRoute: () => usersRoute,
  path: '$userId',
  component: UserComponent,
  loader: async ({ params }) => {
    const response = await fetch(`/api/users/${params.userId}`)
 
    if (!response.ok) {
      // This will render the errorComponent
      throw new Error(`Failed to load user ${params.userId}`)
    }
 
    return response.json()
  },
  errorComponent: ({ error }) => {
    return (
      <div className="error-container">
        <h1>Error Loading User</h1>
        <p>{error.message}</p>
        <Link to="/users">Back to Users</Link>
      </div>
    )
  }
})
Route Meta Data
You can attach metadata to your routes for additional context:


const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: AboutComponent,
  meta: {
    title: 'About Us',
    requiresAuth: false,
    breadcrumb: () => <span>About</span>
  }
})
Code Splitting
TanStack Router supports code splitting with lazy loading:


import { lazy } from 'react'
import { Route } from '@tanstack/react-router'
 
const LazySettings = lazy(() => import('./SettingsComponent'))
 
const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'settings',
  component: () => (
    <Suspense fallback={<div>Loading Settings...</div>}>
      <LazySettings />
    </Suspense>
  )
})
Search Parameters
TanStack Router provides utilities for working with search parameters:


function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.category || 'all'
  const page = Number(searchParams.page || '1')
 
  return (
    <div>
      <div>
        <button
          onClick={() => setSearchParams({ category: 'electronics', page: '1' })}
        >
          Electronics
        </button>
        <button
          onClick={() => setSearchParams({ category: 'clothing', page: '1' })}
        >
          Clothing
        </button>
      </div>
 
      <div>
        Showing {category} products, page {page}
      </div>
 
      <button
        onClick={() => setSearchParams({ category, page: String(page + 1) })}
      >
        Next Page
      </button>
    </div>
  )
}
Server-Side Rendering
TanStack Router supports server-side rendering (SSR) for improved performance and SEO:


// server.js
import { createMemoryHistory } from '@tanstack/react-router'
import { renderToString } from 'react-dom/server'
 
// Create a memory history for SSR
const memoryHistory = createMemoryHistory({
  initialEntries: [req.url],
})
 
// Create router with memory history
const router = new Router({
  routeTree,
  history: memoryHistory,
})
 
// Wait for router to load all necessary data
await router.load()
 
// Render the app to string
const html = renderToString(
  <RouterProvider router={router} />
)
 
// Send the rendered HTML to the client
res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>My App</title>
    </head>
    <body>
      <div id="root">${html}</div>
      <script>
        window.__INITIAL_ROUTER_STATE__ = ${JSON.stringify(router.dehydrate())}
      </script>
      <script src="/client.js"></script>
    </body>
  </html>
`)

// client.js
import { Router, RouterProvider } from '@tanstack/react-router'
import { createBrowserHistory } from '@tanstack/react-router'
 
const browserHistory = createBrowserHistory()
 
const router = new Router({
  routeTree,
  history: browserHistory,
  // Hydrate the router with the data from SSR
  hydrate: window.__INITIAL_ROUTER_STATE__,
})
 
hydrate(
  <RouterProvider router={router} />,
  document.getElementById('root')
)
Best Practices
Organize routes by feature or section of your application
Keep components and routes separate for better maintainability
Implement proper error handling for all routes
Use loaders for data fetching to improve user experience
Implement route guards for protected routes
Utilize code splitting for better performance
Add meaningful metadata to routes for documentation
Test your routes with different scenarios