import {DataState} from "../enum/data-state.enum";
import {AccountType} from "./account-type";

export interface VerifySate {
  dataState: DataState;
  verifySuccess?: boolean;
  error?: string;
  message?: string;
  title?: string;
  type?: AccountType;
}
