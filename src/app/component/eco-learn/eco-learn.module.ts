import {NgModule} from "@angular/core";
import {NavbarModule} from "../navbar/navbar.module";
import {EcoLearnComponent} from "./eco-learn/eco-learn.component";
import {EcoLearnNewComponent} from "./eco-learn-new/eco-learn-new.component";
import {ShareResourceComponent} from "./share-resource/share-resource.component";
import {EcoLearnRoutingModule} from "./eco-learn-routing.module";
import {ClipboardModule} from "ngx-clipboard";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {VgCoreModule} from "@videogular/ngx-videogular/core";
import {VgOverlayPlayModule} from "@videogular/ngx-videogular/overlay-play";
import {VgBufferingModule} from "@videogular/ngx-videogular/buffering";
import {VgControlsModule} from "@videogular/ngx-videogular/controls";
import {MatLegacyChipsModule} from "@angular/material/legacy-chips";
import {SharedModule} from "../../shared/shared.module";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [
    EcoLearnComponent,
    EcoLearnNewComponent,
    ShareResourceComponent
  ],
  imports: [
    SharedModule,
    EcoLearnRoutingModule,
    NavbarModule,
    ClipboardModule,
    CKEditorModule,
    VgCoreModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgControlsModule,
    MatLegacyChipsModule,
    MatInputModule,
    MatSelectModule,]
})
export class EcoLearnModule {}
