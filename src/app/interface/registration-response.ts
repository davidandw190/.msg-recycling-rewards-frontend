import {DataState} from "../enum/data-state.enum";

export interface RegistrationResponse {
  dataState: DataState;
  registerSuccess?: boolean;
  error?: string;
  message?: string;
}
