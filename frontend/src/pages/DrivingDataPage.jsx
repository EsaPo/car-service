// DrivingDataPage.jsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { fetchCars, fetchDrivingData, addDrivingData, deleteDrivingData, updateDrivingData } from '../api/api';
import { format } from 'date-fns';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { generateCSVData, downloadCSV } from '../utils';

export default function DrivingDataPage() {
    const [rows, setRows] = useState([]);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [newDrivingData, setNewDrivingData] = useState({
        rekisteritunnus: '',
        paivamaara: format(new Date(), 'yyyy-MM-dd'),
        lahtoaika: '',
        lahtokm: '',
        paluuaika: '',
        paluukm: '',
        reitti: '',
        muuta: '',
    });
    const [editOpen, setEditOpen] = useState(false);
    const [editDrivingData, setEditDrivingData] = useState(null);
    const [servicesData, setDrivingDataData] = useState([]); // State for CSV export

    const columns = [
        { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
        { field: 'paivamaara', headerName: 'Päivämäärä', width: 110 },
        { field: 'lahtoaika', headerName: 'Lähtöaika', width: 75 },
        { field: 'paluuaika', headerName: 'Paluuaika', width: 75 },
        { field: 'lahtokm', headerName: 'Lähtö km', width: 80 },
        { field: 'paluukm', headerName: 'Paluu km', width: 80 },
        { field: 'ajomaara', headerName: 'Ajomäärä km', width: 80, type: 'number', valueFormatter: (params) => params.value?.toFixed(1) },
        { field: 'reitti', headerName: 'Ajoreitti', width: 330 },
        { field: 'muuta', headerName: 'Muuta', width: 150 },
        {
            field: 'actions',
            type: 'actions',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem icon={<EditIcon />} label="Muokkaa" onClick={() => handleEdit(params.row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Poista" onClick={() => handleDelete(params.id)} />,
            ],
        },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [servicesData, carsData] = await Promise.all([fetchDrivingData(), fetchCars()]);
            setRows(servicesData);
            setCars(carsData);
            setDrivingDataData(servicesData); // Set the services data for export
        } catch (err) {
            console.error('Error loading service data:', err);
            setError('Failed to load service data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDrivingData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDrivingData(newDrivingData);
            loadData();
            setNewDrivingData({
                rekisteritunnus: '',
                paivamaara: format(new Date(), 'yyyy-MM-dd'),
                lahtoaika: '',
                lahtokm: '',
                paluuaika: '',
                paluukm: '',
		ajomaara: '', // lisätty
                reitti: '',
                muuta: '',
            });
            setOpen(false);
        } catch (err) {
            console.error('Error adding service:', err);
            setError('Failed to add service');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteDrivingData(id);
            loadData();
        } catch (err) {
            console.error('Error deleting service:', err);
            setError('Failed to delete service');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setEditDrivingData({ ...row, paivamaara: format(new Date(row.paivamaara), 'yyyy-MM-dd') });
        setEditOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDrivingData(editDrivingData.id, editDrivingData);
            loadData();
            setEditOpen(false);
        } catch (err) {
            console.error('Error updating service:', err);
            setError('Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditDrivingData((prev) => ({ ...prev, [name]: value }));
    };

    const handleExportClick = () => {
        const csvData = generateCSVData(servicesData);
        downloadCSV(csvData, 'all_service_data.csv');
    };

    if (loading) return <div>Ladataan...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;


    return (
        <div style={{ height: 600, width: '100%' }}>
            <h2>Ajopäiväkirja</h2>
            <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
                Lisaa uusi ajomerkintä
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
            <Button variant="contained" onClick={handleExportClick} style={{ marginTop: '20px' }}>
                Vie ajotiedot CSV tiedostoon
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Lisaa uusi ajomerkintä</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="rekisteritunnus-label">Rekisteritunnus</InputLabel>
                        <Select
                            labelId="rekisteritunnus-label"
                            name="rekisteritunnus"
                            value={newDrivingData.rekisteritunnus}
                            label="Rekisteritunnus"
                            onChange={handleInputChange}
                        >
                            {cars.map((car) => (
                                <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>{car.rekisteritunnus}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Päivämäärä"
                        type="date"
                        fullWidth
                        value={newDrivingData.paivamaara}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        name="lahtoaika"
                        label="Lähtöaika"
                        fullWidth
                        value={newDrivingData.lahtoaika}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="lahtokm"
                        label="Lähtö km"
                        type="number"
                        fullWidth
                        value={newDrivingData.lahtokm}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="reitti"
                        label="Reitti"
                        fullWidth
                        multiline
                        rows={2}
                        value={newDrivingData.reitti}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paluuaika"
                        label="Paluuaika"
                        fullWidth
                        value={newDrivingData.paluuaika}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paluukm"
                        label="Paluu km"
                        type="number"
                        fullWidth
                        value={newDrivingData.paluukm}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="muuta"
                        label="Muuta"
                        fullWidth
                        multiline
                        rows={2}
                        value={newDrivingData.muuta}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Peruuta</Button>
                    <Button onClick={handleSubmit} color="primary">
                        Lisaa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit DrivingData Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Muokkaa huoltoa</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="rekisteritunnus"
                        label="Rekisteritunnus"
                        fullWidth
                        value={editDrivingData?.rekisteritunnus || ''}
                        onChange={handleEditInputChange}
                        disabled
                    />
                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Paivamaara"
                        type="date"
                        fullWidth
                        value={editDrivingData?.paivamaara || format(new Date(), 'yyyy-MM-dd')}
                        onChange={handleEditInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        name="lahtoaika"
                        label="Lähtöaika"
                        fullWidth
                        value={editDrivingData?.lahtoaika || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="lahtokm"
                        label="Lähtö km"
                        type="number"
                        fullWidth
                        value={editDrivingData?.lahtokm || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="reitti"
                        label="Reitti"
                        fullWidth
                        value={editDrivingData?.reitti || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paluuaika"
                        label="Paluuaika"
                        fullWidth
                        value={editDrivingData?.paluuaika || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paluukm"
                        label="Paluu km"
                        type="number"
                        fullWidth
                        value={editDrivingData?.paluukm || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="muuta"
                        label="Muuta"
                        fullWidth
                        multiline
                        rows={2}
                        value={editDrivingData?.muuta || ''}
                        onChange={handleEditInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Peruuta</Button>
                    <Button onClick={handleUpdate} color="primary">
                        Tallenna
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

