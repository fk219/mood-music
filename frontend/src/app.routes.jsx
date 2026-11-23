import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Home from './features/home/pages/Home'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Protected from './features/auth/components/Protected'

const Studio = lazy(() => import('./features/studio/pages/Studio'))

const studioFallback = (
  <div className="app-splash" role="status" aria-live="polite">
    <div className="app-splash__inner">
      <span className="app-splash__ring" aria-hidden="true" />
      <p>Opening the studio…</p>
    </div>
  </div>
)

const routes = createBrowserRouter([
  { path: '/', element: <Protected><Home /></Protected> },
  {
    path: '/studio',
    element: (
      <Protected>
        <Suspense fallback={studioFallback}>
          <Studio />
        </Suspense>
      </Protected>
    )
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> }
])

export default routes
