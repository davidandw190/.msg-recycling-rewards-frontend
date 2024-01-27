import {NgModule} from "@angular/core";
import {StatsComponent} from "./stats/stats.component";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [ StatsComponent ],
  imports: [ SharedModule ],
  exports: [ StatsComponent ]
})
export class StatsModule {}
