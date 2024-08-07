import { RouterProvider, createBrowserRouter } from 'react-router-dom'

// Import the layouts
import RootLayout from './layouts/root-layout'
import DashboardLayout from './layouts/dashboard-layout'

// Import the components
import IndexPage from './routes'

import SignInPage from './routes/sign-in'
import SignUpPage from './routes/sign-up'
import DashboardPage from './routes/dashboard'


function App() {
  const router = createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        { path: "/", element: <IndexPage /> },
        { path: "/sign-in/*", element: <SignInPage /> },
        { path: "/sign-up/*", element: <SignUpPage /> },
        {
          element: <DashboardLayout />,
          path: "dashboard",
          children: [
            { path: "/dashboard", element: <DashboardPage /> },
          ]
        }
      ]
    }
  ])
  return (
    <>
       <RouterProvider router={router} />
      
    </>
  )
}

export default App