import {Component, OnInit} from '@angular/core';
import {tap} from 'rxjs/operators';
import {BoardDataService, Item} from '../board-data.service';

@Component({
  selector: 'app-board',
  template: `
  <app-board-col 
     *ngFor="let item of board$ | async; trackBy: byId" 
     [itemId]="item.id">
  </app-board-col> `,
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  board$ = this.data.board$;
  constructor(private data: BoardDataService) {}

  byId = (_, item: Item) => item.id;

  ngOnInit() {}
}
