import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListViewComponent } from './list-view/list-view.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';

const routes: Routes = [
  {path: '', component: ListViewComponent, },
  { path: 'calendar', component: CalendarViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
