import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {AcceptedMaterialsPipe} from "../pipes/accepted-materials.pipe";
import {RewardPointsPipe} from "../pipes/reward-points.pipe";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SustainabilityIndexPipe} from "../pipes/sustainability-index.pipe";
import {UnitConversionPipe} from "../pipes/unit-converter.pipe";
import {MatButtonModule} from "@angular/material/button";
import {MatSortModule} from "@angular/material/sort";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatBadgeModule} from "@angular/material/badge";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatMenuModule} from "@angular/material/menu";
import {VoucherStatusPipe} from "../pipes/voucher-status.pipe";
import {TypeaheadModule} from "ngx-bootstrap/typeahead";

@NgModule({
  declarations: [],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgOptimizedImage,
    NgbModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSortModule,
    MatChipsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    RewardPointsPipe,
    SustainabilityIndexPipe,
    UnitConversionPipe,
    AcceptedMaterialsPipe,
  ],
  exports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgbModule,
    TypeaheadModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSortModule,
    MatChipsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    RewardPointsPipe,
    SustainabilityIndexPipe,
    UnitConversionPipe,
    AcceptedMaterialsPipe
  ],
  providers:[

    RewardPointsPipe,
    SustainabilityIndexPipe,
    VoucherStatusPipe
  ]
})
export class SharedModule {}
