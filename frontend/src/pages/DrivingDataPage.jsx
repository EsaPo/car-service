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
    Alert,
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
    const [drivingDataData, setDrivingDataData] = useState([]); // Fixed variable name

    const columns = [
        { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
        { field: 'paivamaara', headerName: 'Päivämäärä', width: 110 },
        { field: 'lahtoaika', headerName: 'Lähtöaika', width: 75 },
        { field: 'paluuaika', headerName: 'Paluuaika', width: 75 },
        { field: 'lahtokm', headerName: 'Lähtö km', width: 80, type: 'number' },
        { field: 'paluukm', headerName: 'Paluu km', width: 80, type: 'number' },
        {
            field: 'ajomaara',
            headerName: 'Ajomäärä km',
            width: 80,
            type: 'number',
            renderCell: (params) => {
                if (params.value === null || params.value === undefined) {
                    return '';
                }
                return params.value.toFixed(1);
            }
        },
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
            const [drivingData, carsData] = await Promise.all([fetchDrivingData(), fetchCars()]);
            setRows(drivingData);
            setCars(carsData);
            setDrivingDataData(drivingData); // Set the driving data for export
        } catch (err) {
            console.error('Error loading driving data:', err);
            setError('Failed to load driving data');
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

        // Validate required fields
        if (!newDrivingData.rekisteritunnus || !newDrivingData.paivamaara) {
            setError('Rekisteritunnus ja päivämäärä ovat pakollisia kenttiä');
            return;
        }

        // Validate that at least some data is provided
        if (!newDrivingData.lahtoaika && !newDrivingData.lahtokm &&
            !newDrivingData.paluuaika && !newDrivingData.paluukm &&
            !newDrivingData.reitti && !newDrivingData.muuta) {
            setError('Vähintään yksi kenttä (lähtöaika, lähtö km, paluuaika, paluu km, reitti tai muuta) on täytettävä');
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

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
                reitti: '',
                muuta: '',
            });
            setOpen(false);
        } catch (err) {
            console.error('Error adding driving data:', err);
            setError(err.response?.data?.error || 'Failed to add driving data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Haluatko varmasti poistaa tämän ajomerkinnän?')) {
            return;
        }

        setLoading(true);
        try {
            await deleteDrivingData(id);
            loadData();
        } catch (err) {
            console.error('Error deleting driving data:', err);
            setError('Failed to delete driving data');
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

        // Validate required fields
        if (!editDrivingData.rekisteritunnus || !editDrivingData.paivamaara) {
            setError('Rekisteritunnus ja päivämäärä ovat pakollisia kenttiä');
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

        try {
            await updateDrivingData(editDrivingData.id, editDrivingData);
            loadData();
            setEditOpen(false);
        } catch (err) {
            console.error('Error updating driving data:', err);
            setError(err.response?.data?.error || 'Failed to update driving data');
        } finally {
            setLoading(false);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditDrivingData((prev) => ({ ...prev, [name]: value }));
    };

    const handleExportClick = () => {
        const csvData = generateCSVData(drivingDataData);
        downloadCSV(csvData, 'all_driving_data.csv');
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setError(null); // Clear error when closing
    };

    const handleCloseEditDialog = () => {
        setEditOpen(false);
        setError(null); // Clear error when closing
    };

    if (loading && rows.length === 0) return <div>Ladataan...</div>;

    return (
        <div style={{ height: 600, width: '100%' }}>
            <h2>Ajopäiväkirja</h2>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} style={{ marginBottom: 16 }}>
                    {error}
                </Alert>
            )}

            <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
                Lisää uusi ajomerkintä
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

            {/* Add Driving Data Dialog */}
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Lisää uusi ajomerkintä</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" style={{ marginBottom: 16 }}>
                            {error}
                        </Alert>
                    )}

                    <FormControl fullWidth margin="dense" required>
                        <InputLabel id="rekisteritunnus-label">Rekisteritunnus *</InputLabel>
                        <Select
                            labelId="rekisteritunnus-label"
                            name="rekisteritunnus"
                            value={newDrivingData.rekisteritunnus}
                            label="Rekisteritunnus *"
                            onChange={handleInputChange}
                        >
                            {cars.map((car) => (
                                <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>
                                    {car.rekisteritunnus}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Päivämäärä *"
                        type="date"
                        fullWidth
                        required
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
                    <Button onClick={handleCloseDialog}>Peruuta</Button>
                    <Button onClick={handleSubmit} color="primary">
                        Lisää
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Driving Data Dialog */}
            <Dialog open={editOpen} onClose={handleCloseEditDialog}>
                <DialogTitle>Muokkaa ajomerkintää</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" style={{ marginBottom: 16 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        margin="dense"
                        name="rekisteritunnus"
                        label="Rekisteritunnus *"
                        fullWidth
                        required
                        value={editDrivingData?.rekisteritunnus || ''}
                        onChange={handleEditInputChange}
                        disabled
                    />

                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Päivämäärä *"
                        type="date"
                        fullWidth
                        required
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
                        multiline
                        rows={2}
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
                    <Button onClick={handleCloseEditDialog}>Peruuta</Button>
                    <Button onClick={handleUpdate} color="primary">
                        Tallenna
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}


