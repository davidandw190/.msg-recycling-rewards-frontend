import {NotifierModule, NotifierOptions} from "angular-notifier";
import {NgModule} from "@angular/core";

const notificationConfig: NotifierOptions = {
  position: {
    horizontal: {
      position: 'left',
      distance: 130
    },
    vertical: {
      position: 'bottom',
      distance: 40,
      gap: 10
    }
  },
  theme: 'material',
  behaviour: {
    autoHide: 2000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};

@NgModule({
  imports: [ NotifierModule.withConfig(notificationConfig)],
  exports: [ NotifierModule ]
})
export class NotificationModule {}
