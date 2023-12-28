import {RecyclableMaterial} from "./recyclable-material";

export interface RecyclingCenter {
  centerId: number;
  name: string;
  contact: string;
  county: string;
  city: string;
  address?: string;
  createdAt?: string;
  openingHour?: string;
  closingHour?: string;
  alwaysOpen: boolean,
  imageUrl: string,
  acceptedMaterials?: RecyclableMaterial[];
}
