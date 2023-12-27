import {Component, OnInit} from '@angular/core';
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {CentersPageResponse} from "../../interface/centers-page-response";
import {CenterNewResponse} from "../../interface/center-new-response";
import {DataState} from 'src/app/enum/data-state.enum';
import {CenterService} from "../../service/center.service";

@Component({
  selector: 'app-center-new',
  templateUrl: './center-new.component.html',
  styleUrls: ['./center-new.component.css']
})
export class CenterNewComponent implements OnInit {
  newCenterState$: Observable<AppState<CustomHttpResponse<CentersPageResponse>>>;
  private dataSubject  = new BehaviorSubject<CustomHttpResponse<CenterNewResponse>>(null);
  private isLoadingSubject: BehaviorSubject<Boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<Boolean> = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  constructor(private centerService: CenterService) {}

  ngOnInit(): void {
    this.newCenterState$ = this.centerService.centers$()
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next(response);
          return { dataState: DataState.LOADED, appData: response };
        }),

        startWith({ dataState: DataState.LOADING }),

        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, error: error })
        })
      )
  }

}
