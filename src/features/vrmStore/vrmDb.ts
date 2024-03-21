import Dexie, { Table } from 'dexie';
import VrmDbModel from './vrmDbModel';

export class VrmDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  vrms!: Table<VrmDbModel>;

  constructor() {
    super('AmicaVrmDatabase');
    this.version(1).stores({
      vrms: 'hash' // Primary key and indexed props
    });
  }
}

export const db = new VrmDexie();