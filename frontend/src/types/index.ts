export interface Topic {
  id: number;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  topicId: number;
  text: string;
  imagePath: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
}

export interface Lobby {
  code: string;
  topicId: number;
  topicName: string;
  hostId: string;
  state: 'WAITING' | 'PLAYING' | 'FINISHED';
  playerCount: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameResult {
  rank: number;
  name: string;
  score: number;
}

export interface QuestionEvent {
  type: 'QUESTION';
  questionNumber: number;
  totalQuestions: number;
  text: string;
  imagePath: string;
  options: string[];
  timeLeft: number;
}

export interface TimeoutEvent {
  type: 'TIMEOUT';
  message: string;
}

export interface ResultsEvent {
  type: 'RESULTS';
  results: GameResult[];
}

export interface LobbyUpdateEvent {
  type: 'LOBBY_UPDATE';
  players: Player[];
  playerCount: number;
}

export interface AnswerRevealEvent {
  type: 'ANSWER_REVEAL';
  correctAnswer: string;
  playerAnswers: Record<string, string>;
}

export type GameEvent = QuestionEvent | TimeoutEvent | AnswerRevealEvent | ResultsEvent | LobbyUpdateEvent;
