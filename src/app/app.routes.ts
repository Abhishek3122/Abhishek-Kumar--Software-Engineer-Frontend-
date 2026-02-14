import { Routes } from '@angular/router';
import { IncidentTableComponent } from './components/incident-table/incident-table.component';
// import IncidentDetailComponent when created
// import IncidentCreateComponent when created

export const routes: Routes = [
  { path: '', component: IncidentTableComponent },   // Home: incident list
  // { path: 'incident/:id', component: IncidentDetailComponent },  // Detail page
  // { path: 'create', component: IncidentCreateComponent }          // Create page
];
