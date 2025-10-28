// drivingdata.js
const express = require('express');
const router = express.Router();
const db = require('./dbconfig');
const cors = require('cors');

// GET all driving data
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

// POST new driving data
router.post('/', (req, res) => {
    const { rekisteritunnus, paivamaara, lahtoaika, paluuaika, lahtokm, paluukm, reitti, muuta } = req.body;
    
    // Validate required fields
    if (!rekisteritunnus || !paivamaara) {
        return res.status(400).json({ error: "Rekisteritunnus ja päivämäärä ovat pakollisia kenttiä" });
    }
    
    // Validate that at least some meaningful data is provided
    if (!lahtoaika && !lahtokm && !paluuaika && !paluukm && !reitti && !muuta) {
        return res.status(400).json({ error: "Vähintään yksi kenttä (lähtöaika, lähtö km, paluuaika, paluu km, reitti tai muuta) on täytettävä" });
    }
    
    const query = `
        INSERT INTO drivingdata (rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        rekisteritunnus, 
        paivamaara, 
        lahtoaika || null, 
        lahtokm || null, 
        paluuaika || null, 
        paluukm || null, 
        reitti || null, 
        muuta || null
    ], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM drivingdata WHERE id = ?", [this.lastID], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to retrieve new record' });
            }
            res.json(row);
        });
    });
});

// PUT update driving data
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { rekisteritunnus, paivamaara, lahtoaika, lahtokm, paluuaika, paluukm, reitti, muuta } = req.body;
    
    // Validate required fields
    if (!rekisteritunnus || !paivamaara) {
        return res.status(400).json({ error: "Rekisteritunnus ja päivämäärä ovat pakollisia kenttiä" });
    }
    
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
    
    db.run(sql, [
        rekisteritunnus, 
        paivamaara, 
        lahtoaika || null, 
        lahtokm || null, 
        paluuaika || null, 
        paluukm || null, 
        reitti || null, 
        muuta || null, 
        id
    ], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to update driving data' });
        }
        if (this.changes > 0) {
            db.get("SELECT * FROM drivingdata WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to retrieve updated driving data' });
                }
                res.json({ message: 'Driving data updated successfully', drivingdata: row });
            });
        } else {
            res.status(404).json({ error: 'Driving data not found' });
        }
    });
});

// DELETE driving data
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

