import {assertNotNull} from '@angular/compiler/src/output/output_ast';
import {Injectable} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';

const lower = 'abcdefghijklmnopqrstuvwxyz';
const tokens = lower + lower.toUpperCase() + '0123456789';
const tokenLen = tokens.length;
const rand = (amount = 20, min = 0) => Math.floor(Math.random() * amount) + min;

const token = () => tokens[rand(tokenLen)];
const genId = () => Array.from({length: 8}, () => token()).join('');

const createItem = (o: string, parentId = 'root') =>
  ({
    id: genId(),
    parentId,
    collapsed: Math.random() < 0.5 ? false : true,
    name: o,
  } as Item);

export interface Item {
  id: string;
  parentId: string;
  collapsed: boolean;
  active?:boolean
  name: string;
  description?: string;
  children?: Item[];
}

@Injectable({providedIn: 'root'})
export class BoardDataService {
  #boardSub = new BehaviorSubject(restoreFromLocalStorage());
  board$ = this.#boardSub.pipe(map(root => root.children));

  constructor() {}

  getItemById(id: string) {
    return this.#boardSub.pipe(
      map(root => this.#find(id, root)),
      distinctUntilChanged()
    );
  }

  #find = (id: string, findIn = this.#boardSub.value): Item => {
    const found = findIn.children?.find(child => child.id === id);
    if (found) {
      return found;
    }
    for (const child of findIn.children || []) {
      const subFound = this.#find(id, child);
      if (subFound) {
        return subFound;
      }
    }
  };

  addItem(parentId = 'root'): void {
    this.saveItem(createItem('new Item', parentId));
  }

  removeItem(item: Item) {
    if (item.id === 'root') {
      return;
    }
    const board = this.#boardSub.value;
    const parent = this.#find(item.parentId, board);
    parent.children = parent.children.filter(child => child.id !== item.id);
    this.updateBoard(board);
  }

  saveItem(item: Item): void {
    const board = this.#boardSub.value;
    const parent = this.#find(item.parentId, board);
    if (!parent) {
      throw new Error('no support for deeply nested items yet');
    }
    const index = parent.children.findIndex(i => i.id === item.id);
    if (index < 0) {
      /** put new items on top */
      parent.children.unshift(item);
    } else {
      /** just update */
      parent.children[index] = item;
    }
    this.updateBoard(board);
  }

  private updateBoard(board: Item) {
    this.#boardSub.next(board);
    localStorage.setItem('sampleData', JSON.stringify(board));
  }
}

function generateNewBoard() {
  const root = createItem('root');
  return {
    ...root,
    children: Array.from({length: rand(15, 3)}, (_, o) => {
      const parent = createItem(`type ${o}`, 'root');
      return {
        ...parent,
        children: Array.from({length: rand(60, 3)}, (_, i) => createItem(`card ${i} of ${o}`, parent.id)),
      } as Item;
    }),
  };
}

function restoreFromLocalStorage(): Item {
  try {
    const rawData = localStorage.getItem('sampleData');
    if (rawData) {
      return JSON.parse(rawData) as Item;
    }
  } catch (e) {
    console.log(e);
  }
  const newBoard = generateNewBoard();
  localStorage.setItem('sampleData', JSON.stringify(newBoard));
  return newBoard;
}

function flatten(item: Item): Set<Item> {
  const flat = new Set([item]);
  if (item.children) {
    for (const child of item.children) {
      const grandChildren = flatten(child);
      grandChildren.forEach(i => flat.add(i));
    }
  }
  return flat;
}
