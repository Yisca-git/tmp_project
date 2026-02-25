import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CategoryService } from '../../services/category-service';
import { CategoryModel } from '../../models/category.model';
import { Router, ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [MultiSelectModule, SliderModule, FormsModule, ButtonModule],
  templateUrl: './filter-bar-component.html',
  styleUrls: ['./filter-bar-component.scss'],
})
export class FilterBarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  @Output() filterChange = new EventEmitter<any>(); 

  priceRange: number[] = [0, 1000];
  selectedColors: string[] = [];
  categories: CategoryModel[] = [];
  selectedCategories: number[] = [];

  colors = [
    { name: 'לבן', value: 'white' },
    { name: 'שחור', value: 'black' },
    { name: 'אדום', value: 'red' },
    { name: 'כחול', value: 'blue' },
    { name: 'ורוד', value: 'pink' },
    { name: 'זהב', value: 'gold' },
    { name: 'כסף', value: 'silver' }
  ];

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats || []),
      error: (err) => console.error('Error loading categories:', err)
    });

    this.route.queryParams.subscribe(params => {
      if (params['minPrice'] && params['maxPrice']) {
        this.priceRange = [+params['minPrice'], +params['maxPrice']];
      }
      if (params['colors']) {
        this.selectedColors = params['colors'].split(',');
      }
      if (params['categories']) {
        this.selectedCategories = params['categories'].split(',').map(Number);
      }
    });
  }

  applyFilters() {
    const queryParams = {
      minPrice: this.priceRange[0],
      maxPrice: this.priceRange[1],
      colors: this.selectedColors.length ? this.selectedColors.join(',') : null,
      categories: this.selectedCategories.length ? this.selectedCategories.join(',') : null,
      page: 1
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', 
    });

    this.filterChange.emit(queryParams);
  }

  resetFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { minPrice: null, maxPrice: null, colors: null, categories: null, page:1},
      queryParamsHandling: 'merge'
    });
    
    this.priceRange = [0, 1000];
    this.selectedColors = [];
    this.selectedCategories = [];
  }
}