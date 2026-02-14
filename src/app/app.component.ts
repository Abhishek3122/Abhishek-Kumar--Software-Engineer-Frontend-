import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentTableComponent } from './components/incident-table/incident-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    IncidentTableComponent
  ],
  // ⛔ DELETE the "providers: [ provideHttpClient() ]" line from here!
  template: `<app-incident-table></app-incident-table>`,
})
export class AppComponent {}