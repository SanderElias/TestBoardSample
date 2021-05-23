import { Component, OnInit, VERSION } from '@angular/core';
import { BoardDataService } from './board-data.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit  {
  ngOnInit() {
    /** preload popmotion */
    import('popmotion')
  }
}
