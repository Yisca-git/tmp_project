import { Component, OnInit, AfterViewInit, inject, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { ModelService } from '../../services/model-service';
import { ModelCardComponent } from '../model-card-component/model-card-component';
import { ModelModel } from '../../models/model.model';
import { FilterBarComponent } from '../filter-bar-component/filter-bar-component';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-list-models-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ModelCardComponent, ProgressSpinnerModule, FilterBarComponent, PaginatorModule],
  templateUrl: './list-models-component.html',
  styleUrl: './list-models-component.scss',
})
export class ListModelsComponent implements OnInit, AfterViewInit {
  private elementRef = inject(ElementRef);
  private modelService = inject(ModelService);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);   

  models = signal<ModelModel[]>([]);
  loading = signal(true);
  totalRecords = signal(0);
  hasPrev = signal(false);
  hasNext = signal(false); 
  currentPage = signal(1);
  pageSize = 16;
  
  description?: string;
  minPrice: number = 0;
  maxPrice: number = 1000;
  categories: number[] = [];
  colors: string[] = [];
    
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.loading.set(true);
      
      this.description = params['search'] || undefined;
      this.minPrice = params['minPrice'] ? +params['minPrice'] : 0;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : 1000;
      this.currentPage.set(params['page'] ? +params['page'] : 1);
      this.categories = params['categories'] ? params['categories'].split(',').map(Number) : [];
      this.colors = params['colors'] ? params['colors'].split(',') : [];
      
      this.loadModels();
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimation();
  }

  setupScrollAnimation(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      const items = this.elementRef.nativeElement.querySelectorAll('.model-item');
      items.forEach((item: Element) => observer.observe(item));
    }, 100);
  }

  loadModels() {
    const colorsParam = this.colors.length > 0 ? this.colors.join(',') : undefined;
    this.modelService.getModels(
      this.description,
      this.minPrice,
      this.maxPrice,
      this.categories,
      colorsParam,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.models.set(data?.items || []);
        this.totalRecords.set(data?.totalCaunt || 0);
        this.hasPrev.set(data?.hasPrev || false);
        this.hasNext.set(data?.hasNext || false);
        this.loading.set(false);
        setTimeout(() => this.setupScrollAnimation(), 100);
      },
      error: (err) => {
        console.error('Error loading models:', err);
        this.models.set([]);
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: event.page + 1 },
      queryParamsHandling: 'merge'
    });
    this.scrollToTop();
  }

  goToPrevPage() {
    if (this.hasPrev()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage() - 1 },
        queryParamsHandling: 'merge'
      });
    }
  }

  goToFirstPage() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  goToNextPage() {
    if (this.hasNext()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage() + 1 },
        queryParamsHandling: 'merge'
      });
    }
  }

  goToLastPage() {
    const lastPage = Math.ceil(this.totalRecords() / this.pageSize);
    if (lastPage > 0) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: lastPage },
        queryParamsHandling: 'merge'
      });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}