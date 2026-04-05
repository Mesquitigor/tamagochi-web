export type LeaderboardEntry = {
  rank: number;
  pet_name: string;
  nickname: string;
  stage: string;
  age_minutes: number;
  /** `null` = pet a jogar (idade actual). */
  died_at: string | null;
  user_id: string;
  is_alive: boolean;
};
