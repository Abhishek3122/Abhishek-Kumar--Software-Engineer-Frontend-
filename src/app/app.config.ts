import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Added this
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(withFetch()) // Added this to enable HttpClient globally
  ]
};