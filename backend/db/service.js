// service.js
const express = require('express');
const router = express.Router();
const db = require('./dbconfig');

// GET route to fetch all services
router.get('/', (req, res) => {
    db.all('SELECT * FROM service ORDER BY paivamaara DESC', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch services from database' });
        }
        res.json(rows);
    });
});

// POST route to add a new service
router.post('/', (req, res) => {
    const { rekisteritunnus, km, paivamaara, huollon_tyyppi, huollon_sisalto, huollon_suorittaja, muuta } = req.body;
    const sql = `INSERT INTO service (rekisteritunnus, km, paivamaara, huollon_tyyppi, huollon_sisalto, huollon_suorittaja, muuta) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [rekisteritunnus, km, paivamaara, huollon_tyyppi, huollon_sisalto, huollon_suorittaja, muuta], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to add new service' });
        }
        db.get("SELECT * FROM service WHERE id = ?", [this.lastID], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to retrieve added service' });
            }
            res.json({ message: 'Service added successfully', service: row });
        });
    });
});

// PUT route to update an existing service by ID
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { rekisteritunnus, km, paivamaara, huollon_tyyppi, huollon_sisalto, huollon_suorittaja, muuta } = req.body;
    const sql = `
        UPDATE service
        SET rekisteritunnus = ?,
            km = ?,
            paivamaara = ?,
            huollon_tyyppi = ?,
            huollon_sisalto = ?,
            huollon_suorittaja = ?,
            muuta = ?
        WHERE id = ?
    `;
    db.run(sql, [rekisteritunnus, km, paivamaara, huollon_tyyppi, huollon_sisalto, huollon_suorittaja, muuta, id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to update service' });
        }
        if (this.changes > 0) {
            db.get("SELECT * FROM service WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to retrieve updated service' });
                }
                res.json({ message: 'Service updated successfully', service: row });
            });
        } else {
            res.status(404).json({ error: 'Service not found' });
        }
    });
});

// DELETE route to remove a service by ID
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM service WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to delete service' });
        }
        if (this.changes > 0) {
            res.json({ message: 'Service deleted successfully', id: id });
        } else {
            res.status(404).json({ error: 'Service not found' });
        }
    });
});

module.exports = router;
