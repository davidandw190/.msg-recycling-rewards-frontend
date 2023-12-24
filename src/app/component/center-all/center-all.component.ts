import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {AppState} from "../../interface/app-state";
import {DataState} from "../../enum/data-state.enum";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {CentersPageResponse} from "../../interface/centers-page-response";
import {Router} from "@angular/router";
import {CenterService} from "../../service/center.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-center-all',
  templateUrl: './center-all.component.html',
  styleUrls: ['./center-all.component.css']
})
export class CenterAllComponent implements OnInit{
  centersState$: Observable<AppState<CustomHttpResponse<CentersPageResponse>>>
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CentersPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  readonly DataState = DataState;

  constructor(
    private router: Router,
    private centerService: CenterService) {}

  ngOnInit(): void {
    this.centersState$ = this.centerService.searchCenters$()
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
  }

  searchCenters(searchForm: NgForm): void {
    this.centersState$ = this.centerService.searchCenters$()
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next(response);
          return {dataState: DataState.LOADED, appData: response};
        }),

        startWith({dataState: DataState.LOADING}),

        catchError((error: string) => {
          return of({dataState: DataState.ERROR, error})
        })
      )
  }

  goToPage($event: number) {

  }
}