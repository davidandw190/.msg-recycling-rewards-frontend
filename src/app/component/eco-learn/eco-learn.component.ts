import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter, forkJoin,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap
} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {DataState} from '../../enum/data-state.enum';
import {ClipboardService} from "ngx-clipboard";
import {EcoLearnPageResponse} from "../../interface/eco-learn-page-response";
import {EcoLearnService} from "../../service/eco-learn.service";
import {TypeaheadMatch} from "ngx-bootstrap/typeahead";
import {MatDialog} from "@angular/material/dialog";
import {EcoLearnResourceNewComponent} from "../eco-learn-resource-new/eco-learn-resource-new.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-eco-learn',
  templateUrl: './eco-learn.component.html',
  styleUrls: ['./eco-learn.component.css']
})
export class EcoLearnComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  ecoLearnState$: Observable<AppState<CustomHttpResponse<EcoLearnPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<EcoLearnPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  private currentPageSubject = new BehaviorSubject<number>(0);
  currentPage$ = this.currentPageSubject.asObservable();

  currentPage: number = 0;

  readonly DataState = DataState;

  searchForm: FormGroup;

  resourceForm: FormGroup;

  availableCategories: string[] = [];

  selectedCategories: string[] = [];

  availableContentTypes: string[] = [];

  selectedContentTypes: string[] = [];

  private readonly collapseThreshold: number = 100; // Example threshold

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ecoLearnService: EcoLearnService,
    private formBuilder: FormBuilder,
    private clipboardService: ClipboardService,
    public dialog: MatDialog,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.fetchAuxiliaryData();
    this.initializeSearch();
    this.searchVouchers();
    this.setupSearchObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateActiveTab(activeTab: string): void {
    let redeemed: boolean | null = null;
    let expired: boolean | null = null;

    switch (activeTab) {
      case 'Redeemed':
        redeemed = true;
        break;
      case 'Expired':
        expired = true;
        break;
      case 'Available':
        redeemed = false;
        expired = false;
        break;
      case 'All Vouchers':
        break;

      default:
        break;
    }

    this.searchForm.get('redeemed').setValue(redeemed);
    this.searchForm.get('expired').setValue(expired);

    this.searchVouchers();
  }

  searchVouchers(): void {

    const { title, sortBy, sortOrder } = this.searchForm.value;
    const page = this.currentPageSubject.value;

    this.isLoadingSubject.next(true);

    this.ecoLearnService
      .searchEducationalResources$(title, sortBy, sortOrder, page)
      .pipe(
        tap((response) => this.dataSubject.next(response)),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  searchEducationalResourcesSubmit(event: Event): void {

    event.preventDefault();
    const { code, sortBy, sortOrder } = this.searchForm.value;
    const page = this.currentPageSubject.value;
    const { redeemed, expired } = this.searchForm.value;

    this.isLoadingSubject.next(true);

    // this.voucherService
    //   .searchVouchers$(code, sortBy, sortOrder, page, redeemed, expired)
    //   .pipe(
    //     tap((response) => this.dataSubject.next(response)),
    //     catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    //   )
    //   .subscribe();
  }

  goToPage(pageNumber?: number): void {
    const { code, sortBy, sortOrder, redeemed, expired } = this.searchForm.value;

    this.isLoadingSubject.next(true);
    //
    // this.voucherService
    //   .searchVouchers$(code, sortBy, sortOrder, pageNumber - 1, redeemed, expired)
    //   .pipe(
    //     tap((response) => {
    //       this.dataSubject.next(response);
    //       this.currentPageSubject.next(pageNumber - 1);
    //     }),
    //     catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    //   )
    //   .subscribe();
  }

  redirectNewCenter() {
    this.router.navigate(["/centers/new"])
  }

  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      title: [''],
      categories: [''],
      contentTypes: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
    });
  }

  private initializeSearch(): void {
    this.ecoLearnState$ = this.dataSubject.pipe(
      map((response) => ({ dataState: DataState.LOADED, appData: response })),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );
  }

  private fetchAuxiliaryData(): void {
    forkJoin({
      availableCategories: this.ecoLearnService.fetchAvailableCategories$(),
      availableContentTypes: this.ecoLearnService.fetchAvailableContentTypes$()
    })
      .pipe(
        takeUntil(this.destroy$),
        tap(({ availableCategories, availableContentTypes }) => {
          this.availableCategories = availableCategories;
          this.availableContentTypes = availableContentTypes;
        })
      )
      .subscribe();
  }

  private setupSearchObservable(): void {

    this.searchForm.get('title').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(() =>
          this.ecoLearnService.searchEducationalResources$(
            this.searchForm.get('title').value,
            this.searchForm.get('sortBy').value,
            this.searchForm.get('sortOrder').value,
            0,
          )
        ),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        tap((response) => this.handleSearch(response)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.searchForm.get('categories').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(selectedCategory => this.onSelectCategory(selectedCategory)),
        filter(() => false)
      )

    combineLatest([
      this.searchForm.valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('title').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortBy').valueChanges.pipe(debounceTime(100), distinctUntilChanged()),
      this.searchForm.get('sortOrder').valueChanges.pipe(debounceTime(100), distinctUntilChanged())
    ])
      .pipe(
        tap(() => this.isLoadingSubject.next(true)),
        switchMap(([title, sortBy, sortOrder]) =>
          this.ecoLearnService.searchEducationalResources$(title, sortBy, sortOrder, 0)
        ),
        catchError((error: string) => {
          console.error(error);
          return of({ dataState: DataState.ERROR, error });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => this.handleSearch(response));
  }


  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.availableCategories = [...response.appData.data.availableCategories];
    this.availableContentTypes = [...response.appData.data.availableContentTypes];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        code: this.searchForm.get('title').value
      },
      queryParamsHandling: 'merge',
    });
  }


  copyToClipboard(code: string) {
    this.clipboardService.copyFromContent(code);
  }

  private onSelectCategory(event: TypeaheadMatch): void {
    const selectedCategory = event.item;
    this.searchForm.get("categories").setValue("")

    // Check if the category is not already in the list
    if (!this.selectedCategories.includes(selectedCategory)) {
      this.selectedCategories.push(selectedCategory);
      this.searchVouchers();
    }
  }

  shouldCollapse(summary: string): boolean {
    return summary.length > this.collapseThreshold;
  }

  onCategoryChange(event: any, category: string): void {
    const categories = this.resourceForm.get('categories') as FormArray;
    if (event.target.checked) {
      categories.push(this.formBuilder.control(category));
    } else {
      const index = categories.controls.findIndex(x => x.value === category);
      categories.removeAt(index);
    }
  }

  // Method to submit the new resource
  submitResource(): void {
    if (this.resourceForm.valid) {
    }
  }

  openCreateResourceDialog() {
    const modalRef = this.modalService.open(EcoLearnResourceNewComponent, {
      size: 'sm', // Large size
    });

    // modalRef.componentInstance.availableCategories = this.availableCategories;
    // modalRef.componentInstance.availableContentTypes = this.availableContentTypes;

    modalRef.result.then((result) => {
      console.log(result);
      // Handle the modal close result
    }, (reason) => {
      // Handle modal dismissal
    });
  }
}
