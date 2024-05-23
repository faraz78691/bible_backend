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
  deleteData: async (table, where) => {
    return db.query(`Delete from ${table} ${where}`);
  },
  fetchCount: async (table, where) => {
    return db.query(`select  count(*) as total from ${table} ${where}`);
  },
  getSelectedColumn: async (column, table, where, ) => {
    return db.query(`select ${column} from ${table} ${where}`);
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
