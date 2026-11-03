export interface RawExercise {
  id: string;
  n: string; // name
  bp: string; // body part
  eq: string; // equipment
  tg: string; // target muscle
  mg?: string; // muscle group
  sm?: string[]; // secondary muscles
  img?: string; // still thumbnail (e.g. 0001.webp)
  gif?: string; // animation clip (e.g. 0001.mp4)
  cat?: string; // category (strength, calisthenics, plyometrics, etc.)
  fv?: string; // female variant id
  mv?: string; // male variant id
  hd?: number; // hold
}

export declare const EXDB: RawExercise[];
export declare const EXALIAS: Record<string, string>;
