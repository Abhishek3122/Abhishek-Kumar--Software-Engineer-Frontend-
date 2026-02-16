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
    HttpClientModule,
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
  filters: { severity?: string[]; status?: string } = {};

  // helper severity list
  severities = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];

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

  // Toggle severity in filter (multi-select)
  toggleSeverityFilter(sev: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.filters.severity) this.filters.severity = [];
    if (checked) {
      if (!this.filters.severity.includes(sev)) this.filters.severity.push(sev);
    } else {
      this.filters.severity = this.filters.severity.filter(s => s !== sev);
      if (this.filters.severity.length === 0) delete this.filters.severity;
    }
    this.page = 1;
    this.loadIncidents();
  }

  // Detail: checkboxes behave single-select visually
  setSeverityForSelected(sev: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.selectedIncident) return;
    if (checked) {
      this.selectedIncident.severity = sev as Incident['severity'];
    } else {
      delete this.selectedIncident.severity;
    }
  }

  // Create: checkboxes behave single-select visually
  setSeverityForCreating(sev: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.creating.severity = sev as Incident['severity'];
    } else {
      delete this.creating.severity;
    }
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

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.page = 1;
    this.loadIncidents();
  }

  setFilter(filterKey: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
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

  setPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.loadIncidents();
    }
  }
}