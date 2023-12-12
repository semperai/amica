import sqlite3 from "sqlite3";
import { open } from "sqlite";
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse
) {
  let db = await open({filename: path.resolve('amica.db'), driver: sqlite3.Database })
  const characters = await db.all("SELECT * FROM characters");
  res.status(200).json(characters)
}
