// CarsPage.jsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { fetchCars, addCar, updateCarRecord, deleteCarRecord } from '../api/api';
import { format, parseISO } from 'date-fns';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const formatDateForInput = (dateString) => {
    if (dateString) {
        try {
            return format(parseISO(dateString), 'yyyy-MM-dd');
        } catch (error) {
            console.error('Error parsing date for input:', error, dateString);
            return dateString; // Return original if parsing fails
        }
    }
    return '';
};

const formatDateForBackend = (dateString) => {
    if (dateString) {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch (error) {
            console.error('Error formatting date for backend:', error, dateString);
            return dateString; // Return original if formatting fails
        }
    }
    return null; // Or '', depending on your backend preference
};

export default function CarsPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [newCar, setNewCar] = useState({
        rekisteritunnus: '',
        merkki: '',
        malli: '',
        polttoaine: '',
        huoltovali: '',
        hankintapva: format(new Date(), 'yyyy-MM-dd'),
        muuta: '',
        moottorikoodi: '',
        valmistenumero: '',
        ensirekisterointipaiva: format(new Date(), 'yyyy-MM-dd'),
    });
    const [editOpen, setEditOpen] = useState(false);
    const [editCar, setEditCar] = useState(null);

    const columns = [
        { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
        { field: 'merkki', headerName: 'Merkki', width: 110 },
        { field: 'malli', headerName: 'Malli', width: 110 },
        { field: 'polttoaine', headerName: 'Polttoaine', width: 80 },
        { field: 'huoltovali', headerName: 'Huoltoväli (km)', width: 90 },
        { field: 'hankintapva', headerName: 'Hankintapvm', width: 100 },
        { field: 'moottorikoodi', headerName: 'Moottorikoodi', width: 100 },
        { field: 'valmistenumero', headerName: 'Valmistenumero', width: 100 },
        { field: 'ensirekisterointipaiva', headerName: 'Ensirekisteröintipäivä', width: 100 },
        { field: 'muuta', headerName: 'Muuta', width: 190 },
        {
            field: 'actions',
            type: 'actions',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem icon={<EditIcon />} label="Muokkaa" onClick={() => handleEdit(params.row)} />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Poista"
                    onClick={() => handleDelete(params.row.rekisteritunnus)}
                />,
            ],
        },
    ];

    useEffect(() => {
        loadCars();
    }, []);

    const loadCars = async () => {
        setLoading(true);
        try {
            const data = await fetchCars();
            console.log('Data from fetchCars:', data);
            setRows(data.map(row => ({
                ...row,
                hankintapva: formatDateForInput(row.hankintapva),
                ensirekisterointipaiva: formatDateForInput(row.ensirekisterointipaiva),
            })));
        } catch (err) {
            console.error('Error loading cars:', err);
            setError('Failed to load cars');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCar((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formattedNewCar = {
            ...newCar,
            hankintapva: formatDateForBackend(newCar.hankintapva),
            ensirekisterointipaiva: formatDateForBackend(newCar.ensirekisterointipaiva),
        };
        console.log('Data sent for adding:', formattedNewCar);
        try {
            await addCar(formattedNewCar);
            loadCars();
            setNewCar({
                rekisteritunnus: '',
                merkki: '',
                malli: '',
                polttoaine: '',
                huoltovali: '',
                hankintapva: format(new Date(), 'yyyy-MM-dd'),
                muuta: '',
                moottorikoodi: '',
                valmistenumero: '',
                ensirekisterointipaiva: format(new Date(), 'yyyy-MM-dd'),
            });
            setOpen(false);
        } catch (err) {
            console.error('Error adding car:', err);
            setError('Failed to add car');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (rekisteritunnus) => {
        setLoading(true);
        try {
            await deleteCarRecord(rekisteritunnus);
            loadCars();
        } catch (err) {
            console.error('Error deleting car:', err);
            setError('Failed to delete car');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        console.log('Original row data for edit:', row);
        console.log('Original ensirekisterointipaiva for edit:', row.ensirekisterointipaiva);
        const formattedEnsirekisterointipaiva = formatDateForInput(row.ensirekisterointipaiva);
        const formattedHankintapva = formatDateForInput(row.hankintapva);
        console.log('Formatted ensirekisterointipaiva for input:', formattedEnsirekisterointipaiva);
        console.log('Formatted hankintapva for input:', formattedHankintapva);
        setEditCar({
            ...row,
            hankintapva: formattedHankintapva,
            ensirekisterointipaiva: formattedEnsirekisterointipaiva,
        });
        setEditOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('editCar state before update:', editCar);
        const formattedEditCar = {
            ...editCar,
            hankintapva: formatDateForBackend(editCar.hankintapva),
            ensirekisterointipaiva: formatDateForBackend(editCar.ensirekisterointipaiva),
        };
        console.log('Data sent for updating:', formattedEditCar);
        try {
            await updateCarRecord(formattedEditCar.rekisteritunnus, formattedEditCar);
            loadCars();
            setEditOpen(false);
        } catch (err) {
            console.error('Error updating car:', err);
            setError('Failed to update car');
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditCar((prev) => ({ ...prev, [name]: value }));
        console.log('editCar state after input change:', { ...editCar, [name]: value });
    };

    if (loading) return <div>Ladataan...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ height: 600, width: '100%' }}>
            <h2>Ajoneuvojen hallinta</h2>
            <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
                Lisää uusi ajoneuvo
            </Button>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
            />

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Lisää uusi ajoneuvo</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField fullWidth label="Rekisteritunnus" name="rekisteritunnus" value={newCar.rekisteritunnus} onChange={handleInputChange} margin="dense" required />
                        <TextField fullWidth label="Merkki" name="merkki" value={newCar.merkki} onChange={handleInputChange} margin="dense" required />
                        <TextField fullWidth label="Malli" name="malli" value={newCar.malli} onChange={handleInputChange} margin="dense" required />
                        <TextField fullWidth label="Polttoaine" name="polttoaine" value={newCar.polttoaine} onChange={handleInputChange} margin="dense" required />
                        <TextField fullWidth label="Huoltoväli (km)" type="number" name="huoltovali" value={newCar.huoltovali} onChange={handleInputChange} margin="dense" required />
                        <TextField fullWidth label="Hankintapvm" type="date" name="hankintapva" value={newCar.hankintapva} onChange={handleInputChange} margin="dense" />
                        <TextField fullWidth label="Moottorikoodi" name="Moottorikoodi" value={newCar.moottorikoodi} onChange={handleInputChange} margin="dense" />
                        <TextField fullWidth label="Valmistenumero" name="Valmistenumero" value={newCar.valmistenumero} onChange={handleInputChange} margin="dense" />
                        <TextField fullWidth label="Ensirekisteröintipäivä" type="date" name="Ensirekisteröintipäivä" value={newCar.ensirekisterointipaiva} onChange={handleInputChange} margin="dense" />
                        <TextField fullWidth label="Muuta" name="muuta" value={newCar.muuta} onChange={handleInputChange} margin="dense" multiline rows={2} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Peruuta</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Lisää...' : 'Lisää'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Muokkaa ajoneuvoa</DialogTitle>
                <form onSubmit={handleUpdate}>
                    <DialogContent>
                        <TextField fullWidth label="Rekisteritunnus" name="rekisteritunnus" value={editCar?.rekisteritunnus} onChange={handleEditInputChange} margin="dense" required />
                        <TextField fullWidth label="Merkki" name="merkki" value={editCar?.merkki} onChange={handleEditInputChange} margin="dense" required />
                        <TextField fullWidth label="Malli" name="malli" value={editCar?.malli} onChange={handleEditInputChange} margin="dense" required />
                        <TextField fullWidth label="Polttoaine" name="polttoaine" value={editCar?.polttoaine} onChange={handleEditInputChange} margin="dense" required />
                        <TextField fullWidth label="Huoltoväli (km)" type="number" name="huoltovali" value={editCar?.huoltovali} onChange={handleEditInputChange} margin="dense" required />
                        <TextField fullWidth label="Hankintapvm" type="date" name="hankintapva" value={editCar?.hankintapva} onChange={handleEditInputChange} margin="dense" />
                        <TextField fullWidth label="Moottorikoodi" name="Moottorikoodi" value={editCar?.moottorikoodi} onChange={handleEditInputChange} margin="dense" />
                        <TextField fullWidth label="Valmistenumero" name="Valmistenumero" value={editCar?.valmistenumero} onChange={handleEditInputChange} margin="dense" />
                        <TextField fullWidth label="Ensirekisteröintipäivä" type="date" name="ensirekisterointipaiva" value={editCar?.ensirekisterointipaiva} onChange={handleEditInputChange} margin="dense" />
                        <TextField fullWidth label="Muuta" name="muuta" value={editCar?.muuta} onChange={handleEditInputChange} margin="dense" multiline rows={2} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>Peruuta</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Päivitetään...' : 'Päivitä'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}
