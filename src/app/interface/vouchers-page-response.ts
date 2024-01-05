import {Page} from "./page";
import {User} from "./user";
import {Voucher} from "./voucher";

export interface VouchersPageResponse {
  page: Page<Voucher>;
  user: User;
}
