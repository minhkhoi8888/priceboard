import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeProvider.tsx'
import { SocketProvider } from './contexts/SocketProvider.tsx'
import { store } from './store/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
