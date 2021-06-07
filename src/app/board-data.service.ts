import { Injectable } from '@angular/core';
import { clear, del, entries, set } from 'idb-keyval';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

const lower = 'abcdefghijklmnopqrstuvwxyz';
const tokens = lower + lower.toUpperCase() + '0123456789';
const tokenLen = tokens.length;
const rand = (amount = 20, min = 0) => Math.floor(Math.random() * amount) + min;

const token = () => tokens[rand(tokenLen)];
const genId = () => Array.from({ length: 8 }, () => token()).join('');
let seed = 0
async function createItem(o: string, parentId = 'root'): Promise<StoreItem> {
  const faker = await import('faker');
  o = o ? o : faker.commerce.productName();
  return {
    id: genId(),
    parentId,
    collapsed: Math.random() < 0.5 ? false : true,
    name: o,
    pic: `https://picsum.photos/200/100.webp?seed=${++seed}`,
    description: faker.commerce.productDescription(),
    children: [],
  } as StoreItem;
}

interface BaseItem {
  id: string;
  parentId: string;
  collapsed: boolean;
  pic: string;
  active?: boolean;
  name: string;
  description?: string;
}
interface StoreItem extends BaseItem {
  children: string[];
}

export interface Item extends BaseItem {
  children: Item[];
}

interface DataStore {
  [id: string]: StoreItem;
}

@Injectable({ providedIn: 'root' })
export class BoardDataService {
  #boardSub = new BehaviorSubject<DataStore>({});
  board$ = this.#boardSub.pipe(
    map(ds => ds['root']?.children.map(childId => ds[childId])),
    filter(ds => ds !== undefined),
    distinctUntilChanged()
  );

  constructor() {
    restoreFromLocalStorage().then(ds => this.#boardSub.next(ds));
  }

  getItemById(id: string): Observable<Item> {
    return this.#boardSub.pipe(
      map(root => {
        const item = root[id];
        if (item !== undefined) {
          const children = item?.children?.map(childId => root[childId] as unknown as Item) || [];
          return {
            ...item,
            children,
          };
        }
        return undefined;
      }),
      distinctUntilChanged()
    );
  }

  // #find = (id: string, findIn = this.#boardSub.value): Item => {
  //   const found = findIn.children?.find(child => child.id === id);
  //   if (found) {
  //     return found;
  //   }
  //   for (const child of findIn.children || []) {
  //     const subFound = this.#find(id, child);
  //     if (subFound) {
  //       return subFound;
  //     }
  //   }
  // };

  async addItem(parentId = 'root') {
    const newItem = (await createItem('', parentId)) as unknown as Item;
    this.saveItem(newItem);
  }

  removeItem(item: Item) {
    if (item.id === 'root') {
      return;
    }
    const board = this.#boardSub.value;
    const parent = board[item.parentId];
    parent.children = parent.children.filter(child => child !== item.id);
    item.children.forEach(ch => {
      board[ch.id] = undefined;
      del(ch.id).catch();
    });
    board[item.id] = undefined;
    del(item.id).catch();
    this.updateBoard(board);
  }

  async addRandomItems(n: number, parent = 'root') {
    const board = this.#boardSub.value;
    this.updateBoard(await addItems(board, n, parent))
  }

  saveItem(item: Item): void {
    const board = this.#boardSub.value;
    const parent = board[item.parentId];
    if (!parent) {
      throw new Error('no support for deeply nested items yet');
    }
    const index = parent.children.findIndex(i => i === item.id);
    if (index < 0) {
      /** put new items on top */
      parent.children.unshift(item.id);
      set(parent.id, parent);
    }
    board[item.id] = {
      ...item,
      children: item.children.map(ch => ch.id),
    };
    set(item.id, board[item.id]);
    this.updateBoard(board);
  }

  private updateBoard(board: DataStore) {
    this.#boardSub.next(board);
    // localStorage.setItem('sampleData', JSON.stringify(board));
  }
}

async function generateNewBoard(): Promise<DataStore> {
  await clear();
  const ds: DataStore = {};
  const root = await createItem('root');
  const children = await Promise.all(Array.from({ length: rand(5, 3) }, (_, o) => createItem(`type ${o}`, 'root')));
  root.children = children.map(ch => ch.id);
  set('root', root);
  ds['root'] = root;
  await Promise.all(
    children.map(ch => {
      ds[ch.id] = ch;
      set(ch.id, ch);
    })
  );
  await addItems(ds);
  return ds;
}

async function addItems(ds: DataStore, n = 1000, parent = 'root') {
  const faker = await import('faker');

  const { children: master } = ds[parent];
  const max = master.length;
  const i = Object.keys(ds).length;
  console.log(`Adding ${n} items`);
  while (--n) {
    const parentId = master[Math.floor(Math.random() * max)];
    const newChild = await createItem(`${faker.commerce.productName()} ${i + n}`, parentId);
    ds[parentId].children.push(newChild.id);
    ds[newChild.id] = newChild;
    await set(parentId, ds[parentId]);
    await set(newChild.id, newChild);
    if (n % 100 === 0) {
      console.log(`${n} items to go`);
    }
  }
  console.log('Done adding items');
  return ds;
}

async function restoreFromLocalStorage(): Promise<DataStore> {
  try {
    const rawData = await entries();
    if (rawData && rawData.length > 0) {
      return rawData.reduce((ds, [key, val]: [string, StoreItem]) => {
        ds[key] = val;
        return ds;
      }, {});
    }
  } catch (e) {
    console.log(e);
  }
  const newBoard = generateNewBoard();

  return newBoard;
}
