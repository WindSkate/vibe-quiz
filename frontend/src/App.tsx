import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HostLobbyPage from './pages/HostLobbyPage'
import HostWaitingPage from './pages/HostWaitingPage'
import HostGamePage from './pages/HostGamePage'
import HostResultsPage from './pages/HostResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostLobbyPage />} />
        <Route path="/host/:code/waiting" element={<HostWaitingPage />} />
        <Route path="/host/:code/game" element={<HostGamePage />} />
        <Route path="/host/:code/results" element={<HostResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
