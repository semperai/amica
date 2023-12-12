import sqlite3 from "sqlite3";
import { open } from "sqlite";
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.name) {
    return res.writeHead(400, 'Name missing!')
  }
  
  let db = await open({filename: path.resolve('amica.db'), driver: sqlite3.Database })

  let result = await db.run(
    req.body.id
      ? "UPDATE characters SET name = ?, prompt = ? WHERE id = ?"
      :"INSERT INTO characters (name, prompt) VALUES (?, ?)",
    [ req.body.name, req.body.prompt ].concat(req.body.id ? [ req.body.id ] : [])
  )
  
  !result.lastID && !result.changes
    ? res.writeHead(400, 'Error writing to DB!')
    : res.writeHead(200, 'OK')
}
