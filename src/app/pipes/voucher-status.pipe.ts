import { Pipe, PipeTransform } from '@angular/core';
import {Voucher} from "../interface/voucher";

@Pipe({
  standalone: true,
  pure: false,
  name: 'voucherStatus'
})
export class VoucherStatusPipe implements PipeTransform {
  transform(voucher: Voucher, actionButton: boolean = false, textOnly: boolean = false,): string {
    if (actionButton) {
      return this.getActionButtonMarkup(voucher);
    }

    if (textOnly) {
      return this.getStatusText(voucher)
    }

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

  private getActionButtonMarkup(voucher: Voucher): string {
    if (!voucher.redeemed && (!voucher.expiresAt || new Date(voucher.expiresAt) >= new Date())) {
      return '<button type="button" class="btn btn-redeem">REDEEM</button>';
    } else {
      return '<button type="button" class="btn btn-details">DETAILS</button>';
    }
  }
}
