import Dexie, { Table } from 'dexie';
import VrmDbModel from '../vrmStore/db/vrmDbModel';
import CharacterDbModel from '../characters/db/characterDbModel';

export class AmicaDexie extends Dexie {
  vrms!: Table<VrmDbModel>;
  characters!: Table<CharacterDbModel>;

  constructor() {
    super('AmicaDatabase');
    this.version(1).stores({
      vrms: 'hash',
      characters: '++id'
    });
  }
}

export const db = new AmicaDexie();