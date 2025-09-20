// car.js
const express = require('express');
const router = express.Router();
const db = require('./dbconfig');

router.get('/', (req, res) => {
    db.all('SELECT * FROM car', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { rekisteritunnus, merkki, malli, polttoaine, huoltovali, hankintapva, muuta, moottorikoodi, valmistenumero, ensirekisterointipaiva } = req.body;

    if (!rekisteritunnus || !merkki || !malli || !polttoaine || !huoltovali || !hankintapva) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO car (rekisteritunnus, merkki, malli, polttoaine, huoltovali, hankintapva, muuta, moottorikoodi, valmistenumero, ensirekisterointipaiva)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [rekisteritunnus, merkki, malli, polttoaine, huoltovali, hankintapva, muuta, moottorikoodi, valmistenumero, ensirekisterointipaiva], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM car WHERE rekisteritunnus = ?", [rekisteritunnus], (err, row) => {
            res.json(row);
        });
    });
});

router.put('/:rekisteritunnus', (req, res) => {
    const rekisteritunnus = req.params.rekisteritunnus;
    const carData = req.body;
    const { merkki, malli, polttoaine, huoltovali, hankintapva, muuta, moottorikoodi, valmistenumero, ensirekisterointipaiva } = carData;
    const sql = `
        UPDATE car
        SET merkki = ?,
            malli = ?,
            polttoaine = ?,
            huoltovali = ?,
            hankintapva = ?,
            muuta = ?,
            moottorikoodi = ?,
            valmistenumero = ?,
            ensirekisterointipaiva = ?
        WHERE rekisteritunnus = ?
    `;
    db.run(
        sql,
        [merkki, malli, polttoaine, huoltovali, hankintapva, muuta, moottorikoodi, valmistenumero, ensirekisterointipaiva, rekisteritunnus],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to update car record' });
            }
            if (this.changes > 0) {
                res.json({ message: 'Car record updated successfully' });
            } else {
                res.status(404).json({ error: 'Car record not found' });
            }
        }
    );
});

router.delete('/:rekisteritunnus', (req, res) => {
    const rekisteritunnus = req.params.rekisteritunnus;
    console.log("Deleting car:", rekisteritunnus);

    if (!rekisteritunnus) {
        return res.status(400).json({ error: "License plate is required" });
    }

    const query = 'DELETE FROM car WHERE rekisteritunnus = ?';

    db.run(query, [rekisteritunnus], function(err) {
        if (err) {
            console.error('Error executing query', err.stack);
            return res.status(500).json({ error: "Failed to delete car" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Car not found" });
        }

        res.status(200).json({ message: "Car deleted successfully", deleted: { rekisteritunnus: rekisteritunnus } });
    });
});

module.exports = router;
