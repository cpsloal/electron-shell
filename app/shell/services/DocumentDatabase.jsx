// @flow
import PouchDB from 'pouchdb-browser'
import uuid from 'uuid'

PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-quick-search'))

/**
 * Provides access to a document-style database
 * that stores JSON docs and allows to index and query for them.
 *
 * @class DocumentDatabase
 */
class DocumentDatabase {

  /**
   *
   *
   * @type {PouchDB}
   */
  _db: PouchDB

  /**
   * Creates an instance of DocumentDatabase.
   *
   * @param {string} dbName
   * @param {number} [dbVersion=1]
   */
  constructor (dbName:string, dbVersion:number = 1) {
    this._db = new PouchDB(`${dbName}.${dbVersion}`, {
      adapter: 'idb',
      storage: 'persistent'
    })
  }

  /**
   *
   *
   * @param {JSON} doc
   * @returns {Promise}
   */
  save (doc:JSON) : Promise {

    if (!doc._id) {
      doc._id = uuid.v4()
    }

    if (!doc.timestamp) {
      doc.timestamp = new Date()
    }

    var promise = Promise.resolve(this._db.get(doc._id).then((result) => {
      if ((result.version === undefined) || (result.version !== doc.version)) {
        doc._rev = result._rev
        return this._db.put(doc)
      }
      return true
    }).catch((err) => {
      if (err.status == 404) {
        return this._db.put(doc)
      } else {
        throw err
      }
    }))

    return promise
  }

  /**
   *
   *
   * @param {string} id
   * @returns {Promise}
   */
  get (id:string) : Promise {
    return this._db.get(id)
  }

  /**
   *
   *
   * @param {string} view
   * @param {Object} options
   * @returns {Promise}
   */
  query(view:string, options:Object) : Promise {
    return this._db.query(view, options)
  }
}

export default DocumentDatabase
