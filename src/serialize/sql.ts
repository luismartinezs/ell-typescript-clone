
import * as fs from 'fs'
import * as path from 'path'

abstract class Store {
  protected blobStore
  constructor(blobStore) {
    this.blobStore = blobStore
  }
}

export class SQLiteStore extends Store {
  private db = null
  private dbPath

  constructor (dbDir) {
    if (dbDir === ":memory:") {
      const blobStore = new SQLBlobStore(dbDir)
      super(blobStore)
      this.dbPath = ':memory:'
    } else {
      if (dbDir.endsWith('.db')) {
        throw new Error('Create store with a directory not a db.')
      }
      fs.mkdirSync(dbDir, { recursive: true })
      const blobStore = new SQLBlobStore(dbDir)
      super(blobStore)
      this.dbPath = path.join(dbDir, 'ell.db')
    }
  }
}

export class SQLBlobStore {
  private dbDir

  constructor(dbDir) {
    this.dbDir = dbDir
  }
}