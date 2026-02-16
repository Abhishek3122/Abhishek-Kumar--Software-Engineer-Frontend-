import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  // 1. Updated to match your Express route (/api/incidents)
  // 2. Used 127.0.0.1 to avoid potential IPv6 'localhost' resolution issues
  private baseUrl = 'http://127.0.0.1:5000/api/incidents';

  constructor(private http: HttpClient) {}

  getIncidents(
    page: number,
    limit: number,
    search: string,
    filters: { severity?: string[]; status?: string },
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Observable<{ incidents: Incident[]; pages: number }> {
    
    // Ensure numeric values are converted to strings for HttpParams
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search || '')
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    // Apply optional filters
    // support multiple severity values (append each)
    if (filters.severity && Array.isArray(filters.severity) && filters.severity.length) {
      filters.severity.forEach(s => {
        params = params.append('severity', s);
      });
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(response => ({
        ...response,
        incidents: response.incidents.map((incident: any) => ({
          ...incident,
          id: incident._id
        }))
      }))
    );
  }

  createIncident(payload: Partial<Incident>) {
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(incident => ({
        ...incident,
        id: incident._id
      }))
    );
  }

  updateIncident(id: string, payload: Partial<Incident>) {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(incident => ({
        ...incident,
        id: incident._id
      }))
    );
  }
}