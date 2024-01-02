import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {HomePageResponse} from "../../interface/home-page-response";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {DataState} from 'src/app/enum/data-state.enum';
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap, tap} from "rxjs";
import {Router} from "@angular/router";
import {CenterService} from "../../service/center.service";
import {NgbPaginationConfig} from "@ng-bootstrap/ng-bootstrap";
import {RecyclingCenter} from "../../interface/recycling-center";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  homeState$: Observable<AppState<CustomHttpResponse<HomePageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<HomePageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();
  currentPage: number = 0

  readonly DataState = DataState;

  constructor(
    private router: Router,
    private centerService: CenterService
  ) {}

  ngOnInit(): void {
    this.homeState$ = this.currentPage$
      .pipe(
        switchMap(pageNumber => this.centerService.centersNearUser$(pageNumber)),
        tap(response => {
          console.log(response);
          this.dataSubject.next(response);
        }),

        map(response => ({ dataState: DataState.LOADED, appData: response })),

        startWith({ dataState: DataState.LOADING }),

        catchError(error => of({ dataState: DataState.ERROR, error }))
      );
  }

  goToPage(pageNumber: number): void {
    this.currentPageSubject.next(pageNumber - 1);
  }

  getMaterialsTooltip(center: RecyclingCenter): string {
    if (center && center.acceptedMaterials && center.acceptedMaterials.length > 0) {
      const materialsList = center.acceptedMaterials.map((material) => material.name).join(', ');
      return `Accepted Materials: ${materialsList}`;
    } else {
      return 'No accepted materials available';
    }
  }

  navigateToCreateCenter() {
    this.router.navigate(['/centers/new'])
  }

  navigateToCentersView() {
    this.router.navigate(['/centers/all'])
  }

  isCenterOpen(center: RecyclingCenter): boolean {
    return this.centerService.isCenterOpen(center);
  }
}
