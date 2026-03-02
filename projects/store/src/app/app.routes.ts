import { Routes } from '@angular/router';
import { StoreLayout } from './layout/store-layout/store-layout';

export const routes: Routes = [
  {
    path: 'home',
    component: StoreLayout,
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: '',
    redirectTo: 'home',
  },
];
