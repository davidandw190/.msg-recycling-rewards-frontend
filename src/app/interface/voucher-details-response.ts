import {User} from "./user";
import {Voucher} from "./voucher";

export interface VoucherDetailsResponse {
  user: User;
  voucher: Voucher
}
