import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {

  // ✅ IMPORTANT: Must include /api/incidents
  private baseUrl =
    'https://abhishek-kumar-software-engineer.onrender.com/api/incidents';

  constructor(private http: HttpClient) {}

  // ✅ GET with pagination, filter, sorting
  getIncidents(
    page: number,
    limit: number,
    search: string,
    filters: { severity?: string[]; status?: string },
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Observable<{ incidents: Incident[]; pages: number }> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search || '')
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    // Multiple severity filter support
    if (filters?.severity?.length) {
      filters.severity.forEach(sev => {
        params = params.append('severity', sev);
      });
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(response => ({
        ...response,
        incidents: response.incidents.map((incident: any) => ({
          ...incident,
          id: incident._id   // Map MongoDB _id → id
        }))
      }))
    );
  }

  // ✅ CREATE incident
  createIncident(payload: Partial<Incident>): Observable<Incident> {
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(incident => ({
        ...incident,
        id: incident._id
      }))
    );
  }

  // ✅ UPDATE incident
  updateIncident(id: string, payload: Partial<Incident>): Observable<Incident> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(incident => ({
        ...incident,
        id: incident._id
      }))
    );
  }
}
