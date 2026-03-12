export interface FinalJeopardyTeamRow {
  id: string;
  name: string;
  score: number;
  startingScore: number;
  maxWager: number;
  wager?: number;
  response: string;
  judgment?: boolean;
}
