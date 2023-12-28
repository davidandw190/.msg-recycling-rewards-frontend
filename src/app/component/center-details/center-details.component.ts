import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {DataState} from "../../enum/data-state.enum";
import {CenterDetailsResponse} from "../../interface/center-details-response";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {CenterService} from "../../service/center.service";

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent implements OnInit {
  centerDetailsState$: Observable<AppState<CustomHttpResponse<CenterDetailsResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CenterDetailsResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  private readonly CENTER_ID: string = 'id';

  constructor(private activatedRoute: ActivatedRoute, private centerService: CenterService) {
  }

  ngOnInit(): void {
    this.centerDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.centerService.centerDetails$(+params.get(this.CENTER_ID))
          .pipe(
            map(response => {
              console.log(response);
              this.dataSubject.next(response);
              return { dataState: DataState.LOADED, appData: response };
            }),

            startWith({ dataState: DataState.LOADING }),

            catchError((error: string) => {
              return of({ dataState: DataState.ERROR, error })
            })
          )
      })
    );
  }
}
