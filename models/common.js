const db = require("../utils/database");
module.exports = {
  insertData: async (table,data, where) => {
    return db.query(`insert into ${table} set ? ${where}`,[data]);
  },
  updateData: async (table, data, where) => {
    return db.query(`update ${table} SET ? ${where}`, [data]);
  },
  getData: async (table, where) => {
    return db.query(`select * from ${table} ${where}`);
  },
  getUnionData: async (short_url) => {
    return db.query(`SELECT full_url,short_url FROM random_verse WHERE short_url = '${short_url}' UNION SELECT full_url,short_url FROM editedurl WHERE short_url = '${short_url}'`);
  },
  deleteData: async (table, where) => {
    return db.query(`Delete from ${table} ${where}`);
  },
  fetchCount: async (table, where) => {
    return db.query(`select  count(*) as total from ${table} ${where}`);
  },
  getSelectedColumn: async (column, table, where, ) => {
    return db.query(`select ${column} from ${table} ${where}`);
  },
  getBookName: async (table ) => {
    return db.query(`SELECT book_name FROM ( SELECT book_name, MIN(id) AS min_id FROM ${table} WHERE id != 0 GROUP BY book_name ) AS grouped_books ORDER BY min_id ASC;`);
  },
  getChaptersNo: async (table, book_name ) => {
    return db.query(`SELECT chapter FROM ( SELECT chapter, MIN(id) AS min_id FROM ${table} WHERE book_name = '${book_name}' GROUP BY chapter ) AS grouped_chapters ORDER BY min_id ASC;`);
  },
  filtertags: async (search) => {
    let where = ` WHERE tag_name  LIKE '%${search}%'`;
    const query = `SELECT * FROM tags ${where} ORDER BY id DESC`;
    return db.query(query);
 },
 updateADToken: async (token, email) => {
  return db.query(`update admin set token = '${token}' where email = '${email}'`);
},

};
