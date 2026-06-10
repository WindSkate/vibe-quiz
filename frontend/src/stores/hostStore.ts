import { create } from 'zustand';
import { GameEvent, GameResult, Player, QuestionEvent, Topic } from '../types';
import { wsService } from '../services/websocket';
import { lobbyApi, topicApi } from '../services/api';

interface HostState {
  topics: Topic[];
  lobbyCode: string | null;
  lobbyTopicName: string | null;
  players: Player[];
  phase: 'create' | 'waiting' | 'playing' | 'answer_reveal' | 'finished';
  currentQuestion: QuestionEvent | null;
  correctAnswer: string | null;
  playerAnswers: Record<string, string>;
  results: GameResult[];
  timeLeft: number;
  error: string | null;
  timerIntervalId: ReturnType<typeof setInterval> | null;

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
  correctAnswer: null,
  playerAnswers: {},
  results: [],
  timeLeft: 30,
  error: null,
  timerIntervalId: null,

  loadTopics: async () => {
    try {
      const response = await topicApi.getAll();
      set({ topics: response.data, error: null });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Не удалось загрузить темы';
      set({ error: message });
    }
  },

  createLobby: async (topicId: number) => {
    try {
      const response = await lobbyApi.create(topicId);
      const { code, topicName } = response.data;
      set({ lobbyCode: code, lobbyTopicName: topicName, phase: 'waiting', players: [], error: null });

      await wsService.connect();
      wsService.subscribeToLobby(code, (event) => {
        if (event.type === 'LOBBY_UPDATE') {
          set({ players: event.players });
        }
      });
      wsService.subscribeToGame(code, (event) => {
        get().handleGameEvent(event);
      });

      return code;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Не удалось создать лобби';
      set({ error: message });
      throw new Error(message);
    }
  },

  startGame: () => {
    const { lobbyCode } = get();
    if (!lobbyCode) return;
    if (!wsService.isConnected()) return;

    wsService.send(`/app/lobby/${lobbyCode}/start`, { lobbyCode });
    set({ phase: 'playing' });
  },

  handleGameEvent: (event: GameEvent) => {
    if (event.type === 'QUESTION') {
      const qEvent = event as QuestionEvent;
      
      const prevIntervalId = get().timerIntervalId;
      if (prevIntervalId) {
        clearInterval(prevIntervalId);
      }
      
      set({ currentQuestion: qEvent, timeLeft: qEvent.timeLeft, phase: 'playing' });

      const interval = setInterval(() => {
        set((state) => {
          if (state.timeLeft <= 1) {
            clearInterval(interval);
            return { timeLeft: 0, timerIntervalId: null };
          }
          return { timeLeft: state.timeLeft - 1 };
        });
      }, 1000);
      
      set({ timerIntervalId: interval });
    } else if (event.type === 'TIMEOUT') {
      // Stay in playing phase, wait for ANSWER_REVEAL
    } else if (event.type === 'ANSWER_REVEAL') {
      const prevIntervalId = get().timerIntervalId;
      if (prevIntervalId) {
        clearInterval(prevIntervalId);
      }
      
      const revealEvent = event as { type: 'ANSWER_REVEAL'; correctAnswer: string; playerAnswers: Record<string, string> };
      set({
        phase: 'answer_reveal',
        correctAnswer: revealEvent.correctAnswer,
        playerAnswers: revealEvent.playerAnswers,
        timerIntervalId: null,
      });
    } else if (event.type === 'RESULTS') {
      const prevIntervalId = get().timerIntervalId;
      if (prevIntervalId) {
        clearInterval(prevIntervalId);
      }
      
      const resultsEvent = event as { type: 'RESULTS'; results: GameResult[] };
      set({ results: resultsEvent.results, phase: 'finished', timerIntervalId: null });
    }
  },

  sendNextQuestion: () => {
    const { lobbyCode } = get();
    if (!lobbyCode) return;

    wsService.send(`/app/game/${lobbyCode}/next`, { lobbyCode });
  },

  reset: () => {
    const prevIntervalId = get().timerIntervalId;
    if (prevIntervalId) {
      clearInterval(prevIntervalId);
    }
    
    wsService.disconnect();
    set({
      lobbyCode: null,
      lobbyTopicName: null,
      players: [],
      phase: 'create',
      currentQuestion: null,
      correctAnswer: null,
      playerAnswers: {},
      results: [],
      timeLeft: 30,
      error: null,
      timerIntervalId: null,
    });
  },

  setError: (error: string) => set({ error }),
}));
