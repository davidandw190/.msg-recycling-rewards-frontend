import {VoucherType} from "./voucher-type";

export interface Voucher {
  voucherId: number;
  userId: number;
  voucherType: VoucherType;
  uniqueCode: string;
  redeemed: boolean;
  createdAt: Date;
  expiresAt: Date;

}
