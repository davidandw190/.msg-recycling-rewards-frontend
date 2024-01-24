import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'; // Import Validators
import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import {CustomHttpResponse} from '../../interface/custom-http-response';
import {AppState} from '../../interface/app-state';
import {DataState} from '../../enum/data-state.enum';
import {ResourceNewPageResponse} from "../../interface/resource-new-page-response";
import {EcoLearnService} from "../../service/eco-learn.service";


@Component({
  selector: 'app-eco-learn-new',
  templateUrl: './eco-learn-new.component.html',
  styleUrls: ['./eco-learn-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcoLearnNewComponent implements OnInit {
  newResourceState$: Observable<AppState<CustomHttpResponse<ResourceNewPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<ResourceNewPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  availableContentTypes: string[] = [];
  availableCategories: string[] = [];

  newResourceForm: FormGroup;

  selectedCategories: string[] = []

  constructor(
    private router: Router,
    private ecoLearnService: EcoLearnService,
    private formBuilder: FormBuilder
  ) {

    this.newResourceForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      contentType: ['', Validators.required],
      categories:  [''],
      media: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.newResourceState$ = this.ecoLearnService.fetchForCreate$().pipe(
      map((response) => {
        console.log(response);
        this.availableCategories = [...response.data.availableCategories] || [];
        this.availableContentTypes = [...response.data.availableContentTypes] || [];
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),

      startWith({ dataState: DataState.LOADING }),

      catchError((error: string) => of({ dataState: DataState.LOADED, error }))
    );


    this.newResourceForm
      .get('contentType')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      // tap(() => this.newResourceForm.get('').setValue('')),
      switchMap((value) => this.filterContentType(value)),
    )
      .subscribe();

    this.newResourceForm
      .get('categories').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap((category) => this.onSelectCategory(category)),
        filter(() => false)
      )
  }


  createResource(event: Event): void {
    event.preventDefault();

    this.isLoadingSubject.next(true);

    const formData = {
      ...this.newResourceForm.value,
      categories: this.selectedCategories
    };

    console.log('Form Data:', formData);

    this.ecoLearnService.create$(formData).pipe(
      map((response) => {
        console.log(response);
        this.newResourceForm.reset({ contentType: '', categories: '' });
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: this.dataSubject.value };
      }),
      startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({ dataState: DataState.LOADED, error });
      })
    ).subscribe((result) => {
      this.newResourceState$ = of(result);
    });
  }

  filterContentType(value: string): Observable<string[]> {
    const filterValue = value.toUpperCase();
    return of(this.availableContentTypes.filter((c) => c.toUpperCase().includes(filterValue)));
  }


  onSelectCategory(event: TypeaheadMatch): void {
    const selectedCategory = event.item;

    if (!this.selectedCategories.includes(selectedCategory)) {
      this.selectedCategories.push(selectedCategory);
    }

    this.newResourceForm.get("categories").reset()

    console.log(this.selectedCategories.length);
  }

  onRemoveCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.filter((c) => c !== category);
  }

  protected isCategoryChosen(): boolean {
    return this.selectedCategories.length >= 1;
  }

}
