import { Component } from '@angular/core';
import {HomePageResponse} from "../../interface/home-page-response";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {DataState} from 'src/app/enum/data-state.enum';
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap, tap} from "rxjs";
import {Router} from "@angular/router";
import {CenterService} from "../../service/center.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  homeState$: Observable<AppState<CustomHttpResponse<HomePageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<HomePageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  readonly DataState = DataState;

  constructor(
    private router: Router,
    private centerService: CenterService
  ) {}

  ngOnInit(): void {
    this.homeState$ = this.currentPage$
      .pipe(
        switchMap(pageNumber => this.centerService.centers$(pageNumber)),
        tap(response => {
          console.log(response);
          this.dataSubject.next(response);
        }),

        map(response => ({ dataState: DataState.LOADED, appData: response })),

        startWith({ dataState: DataState.LOADING }),

        catchError(error => of({ dataState: DataState.ERROR, error }))
      );
  }

}
