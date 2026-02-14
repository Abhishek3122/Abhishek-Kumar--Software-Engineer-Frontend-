import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incident-table',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule, // <-- provides HttpClient to your service
    FormsModule
  ],
  templateUrl: './incident-table.component.html',
  styleUrls: ['./incident-table.component.scss'],
})
export class IncidentTableComponent {
  incidents: Incident[] = [];
  loading = false;

  // Pagination
  page = 1;
  limit = 10;
  totalPages = 0;

  // Sorting
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Search & filter
  searchTerm: string = '';
  filters: { severity?: string; status?: string } = {};

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService
      .getIncidents(this.page, this.limit, this.searchTerm, this.filters, this.sortBy, this.sortOrder)
      .subscribe({
        next: (res) => {
          this.incidents = res.incidents;
          this.totalPages = res.pages;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading incidents', err);
          this.loading = false;
        },
      });
  }

  onSearchChange(term: string | Event): void {
    if (term instanceof Event) {
      const target = term.target as HTMLInputElement;
      this.searchTerm = target.value;
    } else {
      this.searchTerm = term;
    }
    this.page = 1;
    this.loadIncidents();
  }

  setFilter(filterKey: string, value: string): void {
    if (value) {
      this.filters[filterKey as keyof typeof this.filters] = value;
    } else {
      delete this.filters[filterKey as keyof typeof this.filters];
    }
    this.page = 1;
    this.loadIncidents();
  }

  setSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadIncidents();
  }

  // Rename method to match HTML template
  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.loadIncidents();
    }
  }
}
