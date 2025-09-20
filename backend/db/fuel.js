const express = require('express');
const router = express.Router();
const db = require('./dbconfig');
const cors = require('cors');

// Enable CORS for all routes
//router.use(cors());

// Hae kaikki tankkaukset
router.get('/', (req, res) => {
    const query = `
        SELECT
            id,
            rekisteritunnus,
            tankkauspva,
            tankkausmaara,
            tankkauskustannus,
            kilometrit,
            huoltoasemaketju,
            huoltoasema,
            muuta,
            (tankkausmaara * 1.0 / kilometrit * 100) AS kulutus,
            (tankkauskustannus * 1.0 / tankkausmaara) AS litrahinta
        FROM fuel
        ORDER BY tankkauspva DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch data" });
        }

        const formattedRows = rows.map(row => ({
            ...row,
            kulutus: row.kilometrit ? parseFloat((row.tankkausmaara / row.kilometrit * 100).toFixed(1)) : null,
            litrahinta: row.tankkausmaara ? parseFloat((row.tankkauskustannus / row.tankkausmaara).toFixed(3)) : null,
        }));

        res.json(formattedRows);
    });
});

/*router.get('/', (req, res) => {
    const query = `
        SELECT
            id,
            rekisteritunnus,
            tankkauspva,
            tankkausmaara,
            tankkauskustannus,
            kilometrit,
            huoltoasemaketju,
            huoltoasema,
            muuta,
            (tankkausmaara * 1.0 / kilometrit * 100) AS kulutus,
            (tankkauskustannus * 1.0 / tankkausmaara) AS litrahinta
        FROM fuel
        ORDER BY tankkauspva DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch data" });
        }

        const formattedRows = rows.map(row => ({
            ...row,
            kulutus: row.kulutus !== null && row.kulutus !== undefined ? parseFloat(parseFloat(row.kulutus).toFixed(1)) : null,
            litrahinta: row.litrahinta !== null && row.litrahinta !== undefined ? parseFloat(parseFloat(row.litrahinta).toFixed(3)) : null,
        }));

        res.json(formattedRows);
    });
});*/

// Lisää tankkauksia
router.post('/', (req, res) => {
    const { rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta } = req.body;

    // Tarkista, onko rekisteritunnus olemassa car-taulussa
    db.get('SELECT rekisteritunnus FROM car WHERE rekisteritunnus = ?', [rekisteritunnus], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!row) {
            return res.status(400).json({ error: "Rekisteritunnus not found in car table" });
        }

        // Lisää polttoainetiedot, koska rekisteritunnus on olemassa
        const query = `
            INSERT INTO fuel (rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta], function(insertErr) {
            if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({ error: "Failed to add data" });
            }
            db.get("SELECT * FROM fuel WHERE id = ?", [this.lastID], (getErr, insertedRow) => {
                if (getErr) {
                    console.error(getErr);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json(insertedRow);
            });
        });
    });
});

// Poista tankkaustietoja
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    console.log("Received ID for deletion:", id); // Debugging

    if (!id) {
        return res.status(400).json({ error: "ID is required" });
    }

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    const query = 'DELETE FROM fuel WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).json({ error: "Failed to delete data" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Deleted successfully", deleted: { id: id } });
    });
});

// Päivitä tankkaustietoja
router.put('/:id', (req, res) => {
    const { rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta } = req.body;
    const id = req.params.id;

    console.log("Updating ID:", id, "with data:", req.body); // Debugging

    if (!id || !rekisteritunnus || !tankkauspva || !tankkausmaara || !tankkauskustannus || !kilometrit || !huoltoasemaketju || !huoltoasema) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        UPDATE fuel
        SET rekisteritunnus = ?,
            tankkauspva = ?,
            tankkausmaara = ?,
            tankkauskustannus = ?,
            kilometrit = ?,
            huoltoasemaketju = ?,
            huoltoasema = ?,
            muuta = ?
        WHERE id = ?
    `;

    db.run(query, [rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta, id], function(err) {
        if (err) {
            console.error('Error executing update query:', err.stack);
            return res.status(500).json({ error: "Database update failed" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Record not found" });
        }
        db.get("SELECT * FROM fuel WHERE id = ?", [id], (err, row) => {
            res.json(row);
        });
    });
});

// Hae tankkaustiedot tunnisteen mukaan
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM fuel WHERE id = ?';

    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).json({ error: "Failed to fetch data" });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).end();
        }
    });
});

module.exports = router;
