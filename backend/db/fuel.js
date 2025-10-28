const express = require('express');
const router = express.Router();
const db = require('./dbconfig');
const cors = require('cors');

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
            muuta
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
            kulutus: (row.kilometrit && row.tankkausmaara) ? parseFloat((row.tankkausmaara / row.kilometrit * 100).toFixed(1)) : null,
            litrahinta: (row.tankkausmaara && row.tankkauskustannus) ? parseFloat((row.tankkauskustannus / row.tankkausmaara).toFixed(3)) : null,
        }));

        res.json(formattedRows);
    });
});

// Lisää tankkauksia
router.post('/', (req, res) => {
    const { rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta } = req.body;

    // Validate required fields
    if (!rekisteritunnus || !tankkauspva || !tankkausmaara || !tankkauskustannus) {
        return res.status(400).json({ error: "Rekisteritunnus, tankkauspäivä, tankkaausmäärä ja kustannus ovat pakollisia kenttiä" });
    }

    // Tarkista, onko rekisteritunnus olemassa car-taulussa
    db.get('SELECT rekisteritunnus FROM car WHERE rekisteritunnus = ?', [rekisteritunnus], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!row) {
            return res.status(400).json({ error: "Rekisteritunnus not found in car table" });
        }

        // Lisää polttoainetiedot
        const query = `
            INSERT INTO fuel (rekisteritunnus, tankkauspva, tankkausmaara, tankkauskustannus, kilometrit, huoltoasemaketju, huoltoasema, muuta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [
            rekisteritunnus, 
            tankkauspva, 
            tankkausmaara, 
            tankkauskustannus, 
            kilometrit || null, 
            huoltoasemaketju || null, 
            huoltoasema || null, 
            muuta || null
        ], function(insertErr) {
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
    console.log("Received ID for deletion:", id);

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

    console.log("Updating ID:", id, "with data:", req.body);

    // Validate required fields
    if (!rekisteritunnus || !tankkauspva || !tankkausmaara || !tankkauskustannus) {
        return res.status(400).json({ error: "Rekisteritunnus, tankkauspäivä, tankkaausmäärä ja kustannus ovat pakollisia kenttiä" });
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

    db.run(query, [
        rekisteritunnus, 
        tankkauspva, 
        tankkausmaara, 
        tankkauskustannus, 
        kilometrit || null, 
        huoltoasemaketju || null, 
        huoltoasema || null, 
        muuta || null, 
        id
    ], function(err) {
        if (err) {
            console.error('Error executing update query:', err.stack);
            return res.status(500).json({ error: "Database update failed" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Record not found" });
        }
        db.get("SELECT * FROM fuel WHERE id = ?", [id], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to retrieve updated record" });
            }
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

