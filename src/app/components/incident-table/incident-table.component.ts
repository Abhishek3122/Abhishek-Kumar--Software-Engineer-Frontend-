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

  // View state: 'list' | 'detail' | 'create'
  view: 'list' | 'detail' | 'create' = 'list';

  // Currently selected incident for detail/edit
  selectedIncident: Incident | null = null;

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

  // Temp model for create form
  creating: Partial<Incident> = {};

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  openDetail(incident: Incident): void {
    this.selectedIncident = { ...incident };
    this.view = 'detail';
  }

  showCreate(): void {
    this.creating = {
      title: '',
      service: '',
      severity: 'SEV1',
      status: 'OPEN',
      owner: '',
      summary: ''
    };
    this.view = 'create';
  }

  cancelView(): void {
    this.view = 'list';
    this.selectedIncident = null;
  }

  saveChanges(): void {
    if (!this.selectedIncident) return;
    const id = this.selectedIncident.id;
    const payload: Partial<Incident> = { ...this.selectedIncident };
    this.incidentService.updateIncident(id, payload).subscribe({
      next: (updated) => {
        this.view = 'list';
        this.selectedIncident = null;
        this.loadIncidents();
      },
      error: (err) => console.error('Error updating incident', err),
    });
  }

  createIncident(): void {
    this.incidentService.createIncident(this.creating).subscribe({
      next: (created) => {
        this.view = 'list';
        this.creating = {};
        this.loadIncidents();
      },
      error: (err) => console.error('Error creating incident', err),
    });
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
