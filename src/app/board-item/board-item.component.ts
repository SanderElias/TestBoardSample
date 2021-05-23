import {Input} from '@angular/core';
import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {pluck, switchMap} from 'rxjs/operators';
import {BoardDataService, Item} from '../board-data.service';

@Component({
  selector: 'app-board-item',
  template: ` <app-panel *ngIf="item$ | async as item" [collapsed]="item.collapsed" draggable="true">
    <h3 (click)="toggleCollapse(item)">{{ item.name }}</h3>
    <pre>{{ item | json }}</pre>
    <button (click)="remove(item)">🗑</button>
  </app-panel>`,
})
export class BoardItemComponent implements OnInit {
  localState = new BehaviorSubject({
    id: '',
  });
  @Input() set itemId(id: string) {
    if (id) {
      this.localState.next({...this.localState.value, id});
    }
  }
  item$ = this.localState.pipe(
    pluck('id'),
    switchMap(id => this.data.getItemById(id))
  );

  constructor(private data: BoardDataService) {}

  save(item: Item) {
    this.data.saveItem(item);
  }

  remove(item) {
    this.data.removeItem(item);
  }

  toggleCollapse(item: Item) {
    item.collapsed = !item.collapsed;
    this.save(item);
  }

  ngOnInit() {}
}
