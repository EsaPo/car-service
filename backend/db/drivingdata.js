// drivingdata.js
const express = require('express');
const router = express.Router();
const db = require('./dbconfig');
const cors = require('cors');


router.get('/', (req, res) => {
    const query = `
        SELECT
            id,
            rekisteritunnus,
            paivamaara,
            lahtoaika,
            paluuaika,
            lahtokm,
            paluukm,
            reitti,
            muuta
        FROM drivingdata
        ORDER BY paivamaara DESC;
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch data" });
        }
        const formattedRows = rows.map(row => ({
            ...row,
            ajomaara: (row.paluukm && row.lahtokm) ? parseFloat((row.paluukm - row.lahtokm).toFixed(1)) : null,
        }));
        res.json(formattedRows);
    });
});

/*router.get('/', (req, res) => {
    const query = `
        SELECT
            id,
            rekisteritunnus,
            paivamaara,
            lahtoaika,
            paluuaika,
            lahtokm,
            paluukm,
            reitti,
            muuta,
            (paluukm * 1.0 - lahtokm * 1.0) AS ajomaara,
        FROM drivingdata
        ORDER BY paivamaara DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch data" });
        }

        const formattedRows = rows.map(row => ({
            ...row,
            ajomaara: row.paluukm ? parseFloat((row.paluukm - row.lahtokm).toFixed(1)) : null,
        }));

        res.json(formattedRows);
    });


/*    db.all('SELECT * FROM drivingdata', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });*/
//});

router.post('/', (req, res) => {
    const { rekisteritunnus, paivamaara, lahtoaika, paluuaika, lahtokm, paluukm, reitti, muuta } = req.body;

    if (!rekisteritunnus || !paivamaara || !lahtoaika || !lahtokm || !reitti ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO drivingdata (rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM drivingdata WHERE rekisteritunnus = ?", [rekisteritunnus], (err, row) => {
            res.json(row);
        });
    });
});

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const drivingData = req.body;
    const { rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta } = drivingData;
    const sql = `
        UPDATE drivingdata
        SET rekisteritunnus = ?,
	    paivamaara = ?,
            lahtoaika = ?,
            lahtokm = ?,
            paluuaika = ?,
            paluukm = ?,
	    reitti = ?,
            muuta = ?
        WHERE id = ?
    `;
    db.run(sql, [rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta, id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to update service' });
        }
        if (this.changes > 0) {
            db.get("SELECT * FROM drivingdata WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to retrieve updated service' });
                }
                res.json({ message: 'Service updated successfully', drivingdata: row });
            });
        } else {
            res.status(404).json({ error: 'Service not found' });
        }
    });
/*    db.run(
        sql,
        [rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta, id],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to update driving data' });
            }
            if (this.changes > 0) {
                res.json({ message: 'Driving data updated successfully' });
            } else {
                res.status(404).json({ error: 'Driving data not found' });
            }
        }
    );*/
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    console.log("Deleting driving data:", id);

    if (!id) {
        return res.status(400).json({ error: "ID number is required" });
    }

    const query = 'DELETE FROM drivingdata WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).json({ error: "Failed to delete driving data" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Driving data not found" });
        }

        res.status(200).json({ message: "Driving data deleted successfully", deleted: { id: id } });
    });
});

module.exports = router;
