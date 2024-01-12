import {Component, Inject} from '@angular/core';
import {VoucherService} from "../../service/voucher.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-voucher-guidelines',
  templateUrl: './voucher-guidelines.component.html',
  styleUrls: ['./voucher-guidelines.component.css']
})
export class VoucherGuidelinesComponent{
  constructor(private voucherService: VoucherService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
