const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

(async () => {
  const db = await open({
    filename: 'database.db',
    driver: sqlite3.Database
  });

  const sql = fs.readFileSync('reset_db.sql', 'utf8');
  await db.exec(sql);
  console.log('БД очищена и создан админ tano77@mail.ru');
  await db.close();
})();
