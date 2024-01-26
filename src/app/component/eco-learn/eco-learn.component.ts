import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter, forkJoin,
  map,
  Observable,
  of, pipe,
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
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {EducationalResource} from "../../interface/educational-resource";
import {ShareResourceComponent} from "../share-resource/share-resource.component";

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

  activeTab: string = 'all';

  resourceForm: FormGroup;

  availableCategories: string[] = [];

  selectedCategories: string[] = [];

  availableContentTypes: string[] = [];

  selectedContentTypes: string[] = [];

  private readonly collapseThreshold: number = 100;

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
    this.initializeSearch();
    this.fetchAuxiliaryData();
    this.searchEducationalResources();
    this.setupReactiveSearch()

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateActiveTab(activeTab: string): void {
    let likedOnly: boolean | null = null;
    let savedOnly: boolean | null = null;

    switch (activeTab) {
      case 'all':
        likedOnly = false;
        savedOnly = false;
        break;
      case 'liked':
        likedOnly = true;
        savedOnly = false;
        break;
      case 'saved':
        likedOnly = false;
        savedOnly = true;
        break;
      default:
        break;
    }

    this.searchForm.get('likedOnly').setValue(likedOnly);
    this.searchForm.get('savedOnly').setValue(savedOnly);

    this.searchEducationalResources();
  }

  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      title: [''],
      contentType: [''],
      categories: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
      likedOnly: [false],
      savedOnly: [false],
    });
  }

  searchEducationalResources(): void {

    const { title, contentType, likedOnly, savedOnly, sortBy, sortOrder } = this.searchForm.value;
    const selectedCategories = this.selectedCategories.join(',');
    const page = this.currentPageSubject.value;

    this.isLoadingSubject.next(true);

    this.ecoLearnService
      .search$(title, contentType, selectedCategories, likedOnly, savedOnly, sortBy, sortOrder, page)
      .pipe(
        tap((response) =>  {
          console.log(response)
          this.availableCategories = [...response.data.availableCategories] || []
          this.availableContentTypes = [...response.data.availableContentTypes] || []
          this.dataSubject.next(response)
        }),
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
  }

  goToPage(pageNumber?: number): void {
    const { title, contentType, likedOnly, savedOnly, sortBy, sortOrder} = this.searchForm.value;
    const selectedCategories: string[] = this.selectedCategories;

    this.isLoadingSubject.next(true);


    this.ecoLearnService
      .search$(title, contentType, selectedCategories.join(','), likedOnly, savedOnly, sortBy, sortOrder, pageNumber - 1)
      .pipe(
        tap((response) => {
          this.isLoadingSubject.next(false);
          this.dataSubject.next(response);
          this.currentPageSubject.next(pageNumber - 1);
        }),
        catchError((error: string) => of({ dataState: DataState.ERROR, error }))
      )
      .subscribe();
  }

  redirectNewCenter() {
    this.router.navigate(["/centers/new"])
  }

  private initializeSearch(): void {
    this.ecoLearnState$ = this.dataSubject.pipe(
      map((response) => {
        // this.availableCategories = [...response.data.availableCategories] || [];
        // this.availableContentTypes = [...response.data.availableContentTypes] || [];
        // this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response }
      }
      ),
      startWith({ dataState: DataState.LOADING }),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    );

    console.log("LOADED")
  }

  private fetchAuxiliaryData(): void {
    forkJoin({
      availableCategories: this.ecoLearnService.fetchAvailableCategories$(),
      availableContentTypes: this.ecoLearnService.fetchAvailableContentTypes$()
    })
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.availableCategories = [...response.availableCategories] || [];
          this.availableContentTypes = [...response.availableContentTypes] || [];

          console.log(" >>>>>>>>>>>>" + this.availableCategories)
        })
      )
      .subscribe();
  }

  private performSearch(): Observable<CustomHttpResponse<EcoLearnPageResponse>> {

    return this.ecoLearnService.search$(
      this.searchForm.get('title').value,
      this.searchForm.get('contentType').value,
      this.selectedCategories.join(','),
      this.searchForm.get('likedOnly').value,
      this.searchForm.get('savedOnly').value,
      this.searchForm.get('sortBy').value,
      this.searchForm.get('sortOrder').value,
      0
    ).pipe(
      catchError(error => {
        console.error(error);
        return of(null);
      })
    );
  }

  private setupReactiveSearch(): void {

    this.searchForm.get('title').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(title => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));

    this.searchForm.get('contentType').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(contentType => this.availableContentTypes.includes(contentType)),
      switchMap(contentType => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));

    this.searchForm.get('likedOnly').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(likedOnly => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));

    this.searchForm.get('savedOnly').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(savedOnly => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));

    this.searchForm.get('sortOrder').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(savedOnly => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));


    this.searchForm.get('sortBy').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(savedOnly => this.performSearch()),
      takeUntil(this.destroy$)
    ).subscribe(response => this.handleSearch(response));

  }


  private handleSearch(response: any): void {
    this.dataSubject.next(response);
    this.availableCategories = [...response.appData.data.availableCategories];
    this.availableContentTypes = [...response.appData.data.availableContentTypes];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        title: this.searchForm.get('title').value,
        contentType: this.searchForm.get('contentType').value,
        categories: this.selectedCategories.join(','),
        likedOnly: this.searchForm.get('likedOnly').value,
        savedOnly: this.searchForm.get('savedOnly').value,
        sortBy: this.searchForm.get('sortBy').value,
        sortOrder: this.searchForm.get('sortOrder').value,
      },
      queryParamsHandling: 'merge',
    });
  }

  copyToClipboard(code: string) {
    this.clipboardService.copyFromContent(code);
  }

  protected onSelectCategory(event: TypeaheadMatch): void {
    const selectedCategory = event.item;
    this.searchForm.get("categories").setValue("")

    this.addCategoryIfNotExists(selectedCategory);
  }

  addCategoryIfNotExists(category: string): void {
    if (!this.selectedCategories.includes(category)) {
      this.selectedCategories.push(category);
      this.searchEducationalResources();
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

  resetFilters(): void {
    this.isLoadingSubject.next(true)
    this.searchForm.reset()
    this.searchEducationalResources();
    this.selectedCategories = [];
    this.initializeForm()
    this.initializeSearch();
    this.setupReactiveSearch();
  }
  submitResource(): void {
    if (this.resourceForm.valid) {
    }
  }

  onRemoveCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.filter((c) => c !== category);
  }

  likeResource(resource: EducationalResource) {
    resource.likedByUser = !resource.likedByUser;

    resource.likedByUser
      ? resource.likesCount = resource.likesCount++
      : resource.likesCount = resource.likesCount--;

    this.ecoLearnService.engage$(resource.resourceId, 'LIKE').pipe(
      takeUntil(this.destroy$),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    ).subscribe()
  }

  saveResource(resource: EducationalResource) {
    resource.savedByUser = !resource.savedByUser

    resource.savedByUser
      ? resource.savesCount = resource.savesCount++
      : resource.savesCount = resource.savesCount--;

    this.ecoLearnService.engage$(resource.resourceId, 'SAVE').pipe(
      takeUntil(this.destroy$),
      catchError((error: string) => of({ dataState: DataState.ERROR, error }))
    ).subscribe()
  }

  shareResource(resource: EducationalResource) {
    const dialogRef = this.dialog.open(ShareResourceComponent, {
      width: '600px',
      data: { resourceLink: resource.media
      }
    });
  }
}
