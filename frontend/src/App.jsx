import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import routes from './app.routes'
import { AuthProvider } from './features/auth/auth.context'
import { SongContextProvider } from './features/home/song.context'

function App() {
  return(
    <AuthProvider>
      <SongContextProvider>
        <RouterProvider router={routes} />
        <Analytics />
      </SongContextProvider>
    </AuthProvider>
  ) 
}

export default App
