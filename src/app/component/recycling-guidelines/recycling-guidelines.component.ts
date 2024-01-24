import {Component, Inject} from '@angular/core';
import {VoucherService} from "../../service/voucher.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-recycling-guidelines',
  templateUrl: './recycling-guidelines.component.html',
  styleUrls: ['./recycling-guidelines.component.css']
})
export class RecyclingGuidelinesComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}


