const pg = require('pg');

console.log('Test 1: With password');
const pool1 = new pg.Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'kra_network',
  user: 'kra_user',
  password: 'secret'
});

pool1.connect((err, client, release) => {
  if (err) {
    console.log('  Error with password:', err.message);
    console.log('  Code:', err.code);
    pool1.end(() => {
      testWithoutPassword();
    });
  } else {
    console.log('  Connected with password!');
    release();
    pool1.end(() => {
      testWithoutPassword();
    });
  }
});

function testWithoutPassword() {
  console.log('\nTest 2: Without password');
  const pool2 = new pg.Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'kra_network',
    user: 'kra_user'
  });

  pool2.connect((err, client, release) => {
    if (err) {
      console.log('  Error without password:', err.message);
      console.log('  Code:', err.code);
      process.exit(1);
    } else {
      console.log('  Connected without password!');
      client.query('SELECT version()', (err, result) => {
        release();
        if (err) console.log('  Query error:', err.message);
        else console.log('  Query successful');
        process.exit(0);
      });
    }
  });
}
