import {RecyclableMaterial} from "./recyclable-material";

export interface RecyclingActivity {
  activityId: number;
  recycledMaterial: RecyclableMaterial;
  amount: number;
  createdAt: Date;
}
