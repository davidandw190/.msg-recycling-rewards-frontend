import {Component, Inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ClipboardService} from "ngx-clipboard";

@Component({
  selector: 'app-share-resource',
  templateUrl: './share-resource.component.html',
  styleUrls: ['./share-resource.component.css']
})
export class ShareResourceComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {resourceLink: string },
    private clipboardService: ClipboardService) {
  }

  shareOnSocialMedia(platform: string) {}

  copyToClipboard(resourceLink: string | undefined) {
    this.clipboardService.copyFromContent(resourceLink);
  }
}
