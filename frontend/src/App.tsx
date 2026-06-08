import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HostLobbyPage from './pages/HostLobbyPage'
import HostWaitingPage from './pages/HostWaitingPage'
import HostGamePage from './pages/HostGamePage'
import HostAnswerRevealPage from './pages/HostAnswerRevealPage'
import HostResultsPage from './pages/HostResultsPage'
import PlayerJoinPage from './pages/PlayerJoinPage'
import PlayerWaitingPage from './pages/PlayerWaitingPage'
import PlayerAnswerPage from './pages/PlayerAnswerPage'
import PlayerAnswerRevealPage from './pages/PlayerAnswerRevealPage'
import PlayerResultsPage from './pages/PlayerResultsPage'
import TopicListPage from './pages/TopicListPage'
import EditorPage from './pages/EditorPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostLobbyPage />} />
        <Route path="/host/:code/waiting" element={<HostWaitingPage />} />
        <Route path="/host/:code/game" element={<HostGamePage />} />
        <Route path="/host/:code/answer-reveal" element={<HostAnswerRevealPage />} />
        <Route path="/host/:code/results" element={<HostResultsPage />} />
        <Route path="/player/join" element={<PlayerJoinPage />} />
        <Route path="/player/:code/waiting" element={<PlayerWaitingPage />} />
        <Route path="/player/:code/answer" element={<PlayerAnswerPage />} />
        <Route path="/player/:code/answer-reveal" element={<PlayerAnswerRevealPage />} />
        <Route path="/player/:code/results" element={<PlayerResultsPage />} />
        <Route path="/editor" element={<TopicListPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
