import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HostLobbyPage from './pages/HostLobbyPage'
import HostWaitingPage from './pages/HostWaitingPage'
import HostGamePage from './pages/HostGamePage'
import HostResultsPage from './pages/HostResultsPage'
import PlayerJoinPage from './pages/PlayerJoinPage'
import PlayerWaitingPage from './pages/PlayerWaitingPage'
import PlayerAnswerPage from './pages/PlayerAnswerPage'
import PlayerResultsPage from './pages/PlayerResultsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostLobbyPage />} />
        <Route path="/host/:code/waiting" element={<HostWaitingPage />} />
        <Route path="/host/:code/game" element={<HostGamePage />} />
        <Route path="/host/:code/results" element={<HostResultsPage />} />
        <Route path="/player/join" element={<PlayerJoinPage />} />
        <Route path="/player/:code/waiting" element={<PlayerWaitingPage />} />
        <Route path="/player/:code/answer" element={<PlayerAnswerPage />} />
        <Route path="/player/:code/results" element={<PlayerResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
