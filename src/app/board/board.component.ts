import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BoardDataService, Item } from '../board-data.service';

@Component({
  selector: 'app-board',
  template: `
  <app-side-bar>
    <button (click)="add(1000)">+<br>1000</button>
    <button (click)="add(5000)">+<br>5000</button>
  </app-side-bar>
  <app-board-col 
     *ngFor="let item of board$ | async; trackBy: byId" 
     [itemId]="item.id">
  </app-board-col> `,
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  board$ = this.data.board$;
  constructor(private data: BoardDataService) { }

  byId = (_, item: Item) => item.id;

  add(n) { this.data.addRandomItems(n) }

  ngOnInit() { }
}
