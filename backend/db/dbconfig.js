//dbconfig.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the fuel database.');

  db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
    if (pragmaErr) {
      console.error('Failed to enable foreign keys:', pragmaErr.message);
    } else {
      console.log('Foreign keys enabled.');
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS fuel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rekisteritunnus TEXT NOT NULL,
    tankkauspva DATE,
    tankkausmaara DECIMAL(5,2) NOT NULL,
    tankkauskustannus DECIMAL(5,2) NOT NULL,
    kilometrit DECIMAL(5,1),
    huoltoasemaketju TEXT,
    huoltoasema TEXT,
    muuta TEXT,
    FOREIGN KEY (rekisteritunnus) REFERENCES car(rekisteritunnus)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS car (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merkki TEXT NOT NULL,
    malli TEXT NOT NULL,
    rekisteritunnus TEXT UNIQUE NOT NULL,
    polttoaine TEXT NOT NULL,
    huoltovali REAL NOT NULL,
    hankintapva DATE,
    moottorikoodi TEXT,
    valmistenumero TEXT,
    ensirekisterointipaiva DATE,
    muuta TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rekisteritunnus TEXT NOT NULL,
    km REAL,
    paivamaara DATE,
    huollon_tyyppi TEXT,
    huollon_sisalto TEXT,
    huollon_suorittaja TEXT,
    muuta TEXT,
    FOREIGN KEY (rekisteritunnus) REFERENCES car(rekisteritunnus)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS drivingdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rekisteritunnus TEXT NOT NULL,
    paivamaara DATE,
    lahtoaika TEXT,
    paluuaika TEXT,
    lahtokm REAL,
    paluukm REAL,
    reitti TEXT,
    muuta TEXT,
    FOREIGN KEY (rekisteritunnus) REFERENCES car(rekisteritunnus)
  )`);

});

module.exports = db;
