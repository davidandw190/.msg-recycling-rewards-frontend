import {DataState} from "../enum/data-state.enum";

/**
 * Represents the state of user login, including data state, success status, error message, and other optional properties.
 */
export interface LoginState {
  dataState: DataState;
  loginSuccess?: boolean;
  error?: string;
  message?: string;
  isUsingMfa?: boolean;
  phone?: string;
}
