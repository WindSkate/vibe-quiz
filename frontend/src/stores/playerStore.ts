import { create } from 'zustand';
import { GameEvent, GameResult, QuestionEvent } from '../types';
import { wsService } from '../services/websocket';
import { lobbyApi } from '../services/api';

interface PlayerState {
  lobbyCode: string | null;
  playerId: string | null;
  playerName: string | null;
  phase: 'joining' | 'waiting' | 'answering' | 'timeout' | 'results';
  currentQuestion: QuestionEvent | null;
  results: GameResult[];
  myRank: number | null;
  myScore: number;
  error: string | null;

  joinLobby: (code: string, playerName: string) => Promise<string>;
  connectToGame: (code: string) => void;
  disconnectFromGame: () => void;
  handleGameEvent: (event: GameEvent) => void;
  submitAnswer: (answer: string) => void;
  reset: () => void;
  setError: (error: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  lobbyCode: null,
  playerId: null,
  playerName: null,
  phase: 'joining',
  currentQuestion: null,
  results: [],
  myRank: null,
  myScore: 0,
  error: null,

  joinLobby: async (code: string, playerName: string) => {
    try {
      const response = await lobbyApi.join(code, { playerName });
      const { playerId } = response.data;

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
        // WS connection failed, but player is still in the lobby
        // They can still see the waiting page
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

  connectToGame: async (code: string) => {
    await wsService.connect();

    wsService.subscribeToGame(code, (event: GameEvent) => {
      get().handleGameEvent(event);
    });
  },

  disconnectFromGame: () => {
    wsService.disconnect();
    get().reset();
  },

  handleGameEvent: (event: GameEvent) => {
    if (event.type === 'QUESTION') {
      set({ phase: 'answering', currentQuestion: event as QuestionEvent });
    } else if (event.type === 'TIMEOUT') {
      set({ currentQuestion: null });
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

  reset: () =>
    set({
      lobbyCode: null,
      playerId: null,
      playerName: null,
      phase: 'joining',
      currentQuestion: null,
      results: [],
      myRank: null,
      myScore: 0,
      error: null,
    }),

  setError: (error: string) => set({ error }),
}));
