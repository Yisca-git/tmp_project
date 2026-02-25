import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ModelService } from '../../services/model-service';
import { CategoryService } from '../../services/category-service'; // ייבוא שירות הקטגוריות
import { ModelModel } from '../../models/model.model';
import { CategoryModel } from '../../models/category.model'; // ייבוא המודל
import { ModelCardComponent } from '../model-card-component/model-card-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ModelCardComponent],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private modelService = inject(ModelService);
  private categoryService = inject(CategoryService); // הזרקת שירות הקטגוריות

  categoryImages: { [key: number]: string } = {
    1: '/cat1.png', // נניח ש-1 זה שמלות כלה
    2: '/cat2.png', // נניח ש-2 זה שמלות קוקטייל
    3: '/cat3.png'  // נניח ש-3 זה שמלות ערב
  };

  ngOnInit() {
    this.loadCategories();
    this.loadRandomModels();
  }
  categories = signal<CategoryModel[]>([]); 
  popularDresses = signal<ModelModel[]>([]);
 

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data || []);
      },
      error: (err) => console.error('שגיאה בטעינת קטגוריות', err)
    });
  }

  loadRandomModels() {
      this.modelService.getModels().subscribe({
        next: (data) => {
          if (data && data.items) {
            // ערבוב ובחירת 3 דגמים, ואז עדכון הסיגנל
            const randomItems = data.items
              .sort(() => 0.5 - Math.random()) 
              .slice(0, 3);
            this.popularDresses.set(randomItems);
          }
        },
        error: (err) => console.error('שגיאה בטעינת השמלות', err)
      });
    }

  navigateToCategory(categoryId: number) {
    this.router.navigate(['/collection'], {
      queryParams: { 
        categories: categoryId,
        page: 1 
      }
    });
  }
}