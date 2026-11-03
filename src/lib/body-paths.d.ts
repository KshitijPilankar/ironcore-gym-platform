export interface BodyViewData {
  vb: string;
  p: Record<string, string[]>;
}

export interface GenderBodyData {
  front: BodyViewData;
  back: BodyViewData;
}

export interface BodyPathsCollection {
  male: GenderBodyData;
  female: GenderBodyData;
}

declare const bodyPaths: BodyPathsCollection;
export default bodyPaths;
