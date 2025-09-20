import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { fetchCars, fetchServices, addService, deleteService, updateService } from '../api/api';
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

const serviceTypes = ['Määräaikaishuolto', 'Vuosihuolto', 'Öljyvaihtohuolto', 'Muu huolto', 'Renkaiden vaihto'];

export default function ServicePage() {
    const [rows, setRows] = useState([]);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [newService, setNewService] = useState({
        rekisteritunnus: '',
        km: '',
        paivamaara: format(new Date(), 'yyyy-MM-dd'),
        huollon_tyyppi: '',
        huollon_sisalto: '',
        huollon_suorittaja: '',
        muuta: '',
    });
    const [editOpen, setEditOpen] = useState(false);
    const [editService, setEditService] = useState(null);
    const [servicesData, setServicesData] = useState([]); // State for CSV export

    const columns = [
        { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
        { field: 'km', headerName: 'Kilometrit', width: 80, type: 'number' },
        { field: 'paivamaara', headerName: 'Päivämäärä', width: 110 },
        { field: 'huollon_tyyppi', headerName: 'Huollon Tyyppi', width: 150 },
        { field: 'huollon_sisalto', headerName: 'Huollon Sisältö', width: 300 },
        { field: 'huollon_suorittaja', headerName: 'Huollon Suorittaja', width: 150 },
        { field: 'muuta', headerName: 'Muuta', width: 190 },
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
            const [servicesData, carsData] = await Promise.all([fetchServices(), fetchCars()]);
            setRows(servicesData);
            setCars(carsData);
            setServicesData(servicesData); // Set the services data for export
        } catch (err) {
            console.error('Error loading service data:', err);
            setError('Failed to load service data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addService(newService);
            loadData();
            setNewService({
                rekisteritunnus: '',
                km: '',
                paivamaara: format(new Date(), 'yyyy-MM-dd'),
                huollon_tyyppi: '',
                huollon_sisalto: '',
                huollon_suorittaja: '',
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
            await deleteService(id);
            loadData();
        } catch (err) {
            console.error('Error deleting service:', err);
            setError('Failed to delete service');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setEditService({ ...row, paivamaara: format(new Date(row.paivamaara), 'yyyy-MM-dd') });
        setEditOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateService(editService.id, editService);
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
        setEditService((prev) => ({ ...prev, [name]: value }));
    };

    const handleExportClick = () => {
        const csvData = generateCSVData(servicesData);
        downloadCSV(csvData, 'all_service_data.csv');
    };

    if (loading) return <div>Ladataan...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ height: 600, width: '100%' }}>
            <h2>Huoltojen hallinta</h2>
            <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
                Lisaa uusi huolto
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
                Vie huoltotiedot CSV tiedostoon
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Lisaa uusi huolto</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="rekisteritunnus-label">Rekisteritunnus</InputLabel>
                        <Select
                            labelId="rekisteritunnus-label"
                            name="rekisteritunnus"
                            value={newService.rekisteritunnus}
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
                        name="km"
                        label="Kilometrit"
                        type="number"
                        fullWidth
                        value={newService.km}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Paivamaara"
                        type="date"
                        fullWidth
                        value={newService.paivamaara}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="huollon-tyyppi-label">Huollon Tyyppi</InputLabel>
                        <Select
                            labelId="huollon-tyyppi-label"
                            name="huollon_tyyppi"
                            value={newService.huollon_tyyppi}
                            label="Huollon Tyyppi"
                            onChange={handleInputChange}
                        >
                            {serviceTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="huollon_sisalto"
                        label="Huollon Sisalto"
                        fullWidth
                        multiline
                        rows={2}
                        value={newService.huollon_sisalto}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="huollon_suorittaja"
                        label="Huollon Suorittaja"
                        fullWidth
                        value={newService.huollon_suorittaja}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="muuta"
                        label="Muuta"
                        fullWidth
                        multiline
                        rows={2}
                        value={newService.muuta}
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

            {/* Edit Service Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Muokkaa huoltoa</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="rekisteritunnus"
                        label="Rekisteritunnus"
                        fullWidth
                        value={editService?.rekisteritunnus || ''}
                        onChange={handleEditInputChange}
                        disabled
                    />
                    <TextField
                        margin="dense"
                        name="km"
                        label="Kilometrit"
                        type="number"
                        fullWidth
                        value={editService?.km || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="paivamaara"
                        label="Paivamaara"
                        type="date"
                        fullWidth
                        value={editService?.paivamaara || format(new Date(), 'yyyy-MM-dd')}
                        onChange={handleEditInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="edit-huollon-tyyppi-label">Huollon Tyyppi</InputLabel>
                        <Select
                            labelId="edit-huollon-tyyppi-label"
                            name="huollon_tyyppi"
                            value={editService?.huollon_tyyppi || ''}
                            label="Huollon Tyyppi"
                            onChange={handleEditInputChange}
                        >
                            {serviceTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="huollon_sisalto"
                        label="Huollon Sisalto"
                        fullWidth
                        multiline
                        rows={2}
                        value={editService?.huollon_sisalto || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="huollon_suorittaja"
                        label="Huollon Suorittaja"
                        fullWidth
                        value={editService?.huollon_suorittaja || ''}
                        onChange={handleEditInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="muuta"
                        label="Muuta"
                        fullWidth
                        multiline
                        rows={2}
                        value={editService?.muuta || ''}
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
