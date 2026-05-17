import { create } from 'zustand';
import { GameEvent, GameResult, Player, QuestionEvent, Topic } from '../types';
import { wsService } from '../services/websocket';
import { lobbyApi, topicApi } from '../services/api';

interface HostState {
  topics: Topic[];
  lobbyCode: string | null;
  lobbyTopicName: string | null;
  players: Player[];
  phase: 'create' | 'waiting' | 'playing' | 'finished';
  currentQuestion: QuestionEvent | null;
  results: GameResult[];
  timeLeft: number;
  error: string | null;

  loadTopics: () => Promise<void>;
  createLobby: (topicId: number) => Promise<string>;
  startGame: () => void;
  handleGameEvent: (event: GameEvent) => void;
  sendNextQuestion: () => void;
  reset: () => void;
  setError: (error: string) => void;
}

export const useHostStore = create<HostState>((set, get) => ({
  topics: [],
  lobbyCode: null,
  lobbyTopicName: null,
  players: [],
  phase: 'create',
  currentQuestion: null,
  results: [],
  timeLeft: 30,
  error: null,

  loadTopics: async () => {
    try {
      const response = await topicApi.getAll();
      set({ topics: response.data });
    } catch {
      set({ error: 'Не удалось загрузить темы' });
    }
  },

  createLobby: async (topicId: number) => {
    try {
      const response = await lobbyApi.create(topicId);
      const { code, topicName } = response.data;
      set({ lobbyCode: code, lobbyTopicName: topicName, phase: 'waiting', players: [] });

      wsService.connect();
      wsService.subscribeToLobby(code, (event) => {
        if (event.type === 'LOBBY_UPDATE') {
          set({ players: event.players });
        }
      });
      wsService.subscribeToGame(code, (event) => {
        get().handleGameEvent(event);
      });

      return code;
    } catch {
      set({ error: 'Не удалось создать лобби' });
      throw new Error('Failed to create lobby');
    }
  },

  startGame: () => {
    const { lobbyCode } = get();
    if (!lobbyCode) return;

    wsService.send(`/app/lobby/${lobbyCode}/start`, { lobbyCode });
    set({ phase: 'playing' });
  },

  handleGameEvent: (event: GameEvent) => {
    if (event.type === 'QUESTION') {
      const qEvent = event as QuestionEvent;
      set({ currentQuestion: qEvent, timeLeft: qEvent.timeLeft });

      const interval = setInterval(() => {
        set((state) => {
          if (state.timeLeft <= 1) {
            clearInterval(interval);
            return { timeLeft: 0 };
          }
          return { timeLeft: state.timeLeft - 1 };
        });
      }, 1000);
    } else if (event.type === 'TIMEOUT') {
      set({ phase: 'finished' });
    } else if (event.type === 'RESULTS') {
      const resultsEvent = event as { type: 'RESULTS'; results: GameResult[] };
      set({ results: resultsEvent.results, phase: 'finished' });
    }
  },

  sendNextQuestion: () => {
    const { lobbyCode } = get();
    if (!lobbyCode) return;

    wsService.send(`/app/game/${lobbyCode}/next`, { lobbyCode });
  },

  reset: () => {
    wsService.disconnect();
    set({
      lobbyCode: null,
      lobbyTopicName: null,
      players: [],
      phase: 'create',
      currentQuestion: null,
      results: [],
      timeLeft: 30,
      error: null,
    });
  },

  setError: (error: string) => set({ error }),
}));
