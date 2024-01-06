import { Pipe, PipeTransform } from '@angular/core';
import {Voucher} from "../interface/voucher";

@Pipe({
  standalone: true,
  name: 'voucherStatus'
})
export class VoucherStatusPipe implements PipeTransform {
  transform(voucher: Voucher): string {
    const badgeClass = this.getBadgeClass(voucher);
    return `<span class="badge ${badgeClass}">${this.getStatusText(voucher)}</span>`;
  }

  private getBadgeClass(voucher: Voucher): string {
    if (voucher.redeemed) {
      return 'badge-redeemed';
    } else if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return 'badge-expired';
    } else {
      return 'badge-available';
    }
  }

  private getStatusText(voucher: Voucher): string {
    if (voucher.redeemed) {
      return 'REDEEMED';
    } else if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return 'EXPIRED';
    } else {
      return 'AVAILABLE';
    }
  }
}
