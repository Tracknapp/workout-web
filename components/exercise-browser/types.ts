export interface Exercise {
  _id: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  bodyParts: string[];
}

export interface FilterOption {
  _id: string;
  name: string;
}

export const PAGE_SIZE = 20;
