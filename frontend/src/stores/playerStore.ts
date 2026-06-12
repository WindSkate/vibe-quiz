import { create } from 'zustand';
import { GameEvent, GameResult, QuestionEvent } from '../types';
import { wsService } from '../services/websocket';
import { lobbyApi } from '../services/api';

const STORAGE_KEY = 'quiz-player-session';

interface PlayerSession {
  lobbyCode: string;
  playerId: string;
  playerName: string;
}

const saveSession = (session: PlayerSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

interface PlayerState {
  lobbyCode: string | null;
  playerId: string | null;
  playerName: string | null;
  phase: 'joining' | 'waiting' | 'answering' | 'timeout' | 'answer_reveal' | 'results';
  currentQuestion: QuestionEvent | null;
  correctAnswer: string | null;
  playerAnswers: Record<string, string>;
  results: GameResult[];
  myRank: number | null;
  myScore: number;
  error: string | null;

  joinLobby: (code: string, playerName: string) => Promise<string>;
  reconnectToLobby: (code: string, playerId: string, playerName: string) => Promise<void>;
  connectToGame: (code: string) => void;
  disconnectFromGame: () => void;
  handleGameEvent: (event: GameEvent) => void;
  submitAnswer: (answer: string) => void;
  sendNextQuestion: () => void;
  reset: () => void;
  setError: (error: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  lobbyCode: null,
  playerId: null,
  playerName: null,
  phase: 'joining',
  currentQuestion: null,
  correctAnswer: null,
  playerAnswers: {},
  results: [],
  myRank: null,
  myScore: 0,
  error: null,

  joinLobby: async (code: string, playerName: string) => {
    try {
      const response = await lobbyApi.join(code, { playerName });
      const { playerId } = response.data;

      saveSession({ lobbyCode: code, playerId, playerName });

      set({
        playerId,
        playerName,
        lobbyCode: code,
        phase: 'waiting',
        error: null,
      });

      try {
        await get().connectToGame(code);
      } catch {
        console.warn('WebSocket connection failed, will retry on reconnect');
      }

      return playerId;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Ошибка подключения';
      set({ error: message });
      throw new Error(message);
    }
  },

  reconnectToLobby: async (code: string, playerId: string, playerName: string) => {
    try {
      await lobbyApi.join(code, { playerName, playerId });

      set({
        playerId,
        playerName,
        lobbyCode: code,
        phase: 'waiting',
        error: null,
      });

      try {
        await get().connectToGame(code);
      } catch {
        console.warn('WebSocket connection failed on reconnect');
      }
    } catch (err: unknown) {
      clearSession();
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Ошибка переподключения';
      set({ error: message });
      throw new Error(message);
    }
  },

  connectToGame: async (code: string) => {
    await wsService.connect();

    wsService.subscribeToGame(code, (event: GameEvent) => {
      get().handleGameEvent(event);
    });

    const { playerId } = get();
    if (playerId) {
      wsService.subscribeToPersonalQueue(playerId, (event: GameEvent) => {
        get().handleGameEvent(event);
      });

      wsService.send(`/app/game/${code}/state`, { lobbyCode: code, playerId });
    }
  },

  disconnectFromGame: () => {
    wsService.disconnect();
    get().reset();
  },

  handleGameEvent: (event: GameEvent) => {
    if (event.type === 'QUESTION') {
      set({ phase: 'answering', currentQuestion: event as QuestionEvent });
    } else if (event.type === 'TIMEOUT') {
      set({ phase: 'timeout' });
    } else if (event.type === 'ANSWER_REVEAL') {
      const revealEvent = event as { type: 'ANSWER_REVEAL'; correctAnswer: string; playerAnswers: Record<string, string> };
      set({
        phase: 'answer_reveal',
        correctAnswer: revealEvent.correctAnswer,
        playerAnswers: revealEvent.playerAnswers,
      });
    } else if (event.type === 'RESULTS') {
      const resultsEvent = event as { type: 'RESULTS'; results: GameResult[] };
      const { playerName } = get();
      const myResult = resultsEvent.results.find((r) => r.name === playerName);
      set({
        phase: 'results',
        results: resultsEvent.results,
        myRank: myResult?.rank ?? null,
        myScore: myResult?.score ?? 0,
      });
    }
  },

  submitAnswer: (answer: string) => {
    const { lobbyCode, playerId } = get();
    if (!lobbyCode || !playerId) return;

    wsService.send(`/app/game/${lobbyCode}/answer`, {
      lobbyCode,
      playerId,
      answer,
    });
  },

  sendNextQuestion: () => {
    const { lobbyCode } = get();
    if (!lobbyCode) return;

    wsService.send(`/app/game/${lobbyCode}/next`, { lobbyCode });
  },

  reset: () => {
    clearSession();
    set({
      lobbyCode: null,
      playerId: null,
      playerName: null,
      phase: 'joining',
      currentQuestion: null,
      correctAnswer: null,
      playerAnswers: {},
      results: [],
      myRank: null,
      myScore: 0,
      error: null,
    });
  },

  setError: (error: string) => set({ error }),
}));
