import { createBrowserRouter, RouterProvider, useRoutes } from 'react-router-dom'
import routes from './routes'

import './App.css'

export default function App() {
  const router = createBrowserRouter(routes)

  return <RouterProvider router={router} />
}

// if (import.meta.hot) {
//   import.meta.hot.dispose(() => router.dispose())
// }
