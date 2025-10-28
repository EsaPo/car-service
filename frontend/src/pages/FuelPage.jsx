// FuelPage.jsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { fetchFuelData, fetchCars, addFuelRecord, deleteFuelRecord, updateFuelRecord } from '../api/api';
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

export default function FuelPage() {
  const [rows, setRows] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [newFuel, setNewFuel] = useState({
    rekisteritunnus: '',
    tankkauspva: format(new Date(), 'yyyy-MM-dd'),
    tankkausmaara: '',
    tankkauskustannus: '',
    kilometrit: '',
    huoltoasemaketju: '',
    huoltoasema: '',
    muuta: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editFuel, setEditFuel] = useState(null);
  const [fuelData, setFuelData] = useState([]);

  const gasStationChains = ['ABC', 'Neste', 'NesteExpress', 'SEO', 'ST1', 'Teboil'];

  const columns = [
      { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
      { field: 'tankkauspva', headerName: 'Tankkauspvm', width: 110 },
      { field: 'tankkausmaara', headerName: 'Määrä', width: 80, type: 'number' },
      { field: 'tankkauskustannus', headerName: 'Kustannus', width: 80, type: 'number' },
      { field: 'kilometrit', headerName: 'Kilometrit', width: 80, type: 'number' },
      { 
        field: 'kulutus', 
        headerName: 'Kulutus (l/100km)', 
        width: 80, 
        type: 'number',
        renderCell: (params) => {
          if (params.value === null || params.value === undefined) {
            return '';
          }
          return params.value.toFixed(1);
        }
      },
      { 
        field: 'litrahinta', 
        headerName: 'Hinta', 
        width: 80, 
        type: 'number',
        renderCell: (params) => {
          if (params.value === null || params.value === undefined) {
            return '';
          }
          return params.value.toFixed(3);
        }
      },
      { field: 'huoltoasemaketju', headerName: 'Huoltoasemaketju', width: 120 },
      { field: 'huoltoasema', headerName: 'Huoltoasema', width: 120 },
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
      const [fuelData, carData] = await Promise.all([fetchFuelData(), fetchCars()]);
      const mergedData = fuelData.map((fuel) => {
        const car = carData.find((c) => c.rekisteritunnus === fuel.rekisteritunnus);
        return {
          ...fuel,
          rekisteritunnus: car ? car.rekisteritunnus : 'Unknown',
        };
      });
      setRows(mergedData);
      setCars(carData);
      setFuelData(fuelData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFuel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newFuel.rekisteritunnus || !newFuel.tankkauspva || !newFuel.tankkausmaara || !newFuel.tankkauskustannus) {
      setError('Rekisteritunnus, tankkauspäivä, tankkaausmäärä ja kustannus ovat pakollisia kenttiä');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addFuelRecord(newFuel);
      await loadData();
      setNewFuel({
        rekisteritunnus: '',
        tankkauspva: format(new Date(), 'yyyy-MM-dd'),
        tankkausmaara: '',
        tankkauskustannus: '',
        kilometrit: '',
        huoltoasemaketju: '',
        huoltoasema: '',
        muuta: '',
      });
      setOpen(false);
    } catch (err) {
      console.error('Error adding fuel record:', err);
      setError(err.response?.data?.error || 'Failed to add fuel record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Haluatko varmasti poistaa tämän tankkausmerkinnän?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteFuelRecord(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting fuel record:', err);
      setError('Failed to delete fuel record');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditFuel({ ...row, tankkauspva: format(new Date(row.tankkauspva), 'yyyy-MM-dd') });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editFuel.rekisteritunnus || !editFuel.tankkauspva || !editFuel.tankkausmaara || !editFuel.tankkauskustannus) {
      setError('Rekisteritunnus, tankkauspäivä, tankkaausmäärä ja kustannus ovat pakollisia kenttiä');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await updateFuelRecord(editFuel.id, editFuel);
      await loadData();
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating fuel record:', err);
      setError(err.response?.data?.error || 'Failed to update fuel record');
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = () => {
    const csvData = generateCSVData(fuelData);
    downloadCSV(csvData, 'all_fuel_data.csv');
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setError(null);
  };

  const handleCloseEditDialog = () => {
    setEditOpen(false);
    setError(null);
  };

  if (loading && rows.length === 0) {
    return <div>Loading fuel data...</div>;
  }

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h2>Tankkaustietojen hallinta</h2>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Lisää uusi tankkaus
      </Button>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection={false}
          disableSelectionOnClick
        />
        <Button variant="contained" onClick={handleExportClick} style={{ marginTop: '20px' }}>
          Vie tankkaustiedot CSV tiedostoon
        </Button>
      </div>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Lisää uusi tankkaus</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" style={{ marginBottom: 16 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth variant="standard" margin="dense" required>
              <InputLabel>Rekisteritunnus *</InputLabel>
              <Select name="rekisteritunnus" value={newFuel.rekisteritunnus} onChange={handleInputChange} required>
                {cars.map((car) => (
                  <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>
                    {car.rekisteritunnus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="tankkauspva" label="Pvm *" type="date" fullWidth variant="standard" value={newFuel.tankkauspva} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" name="tankkausmaara" label="Tankkaausmäärä *" type="number" fullWidth variant="standard" value={newFuel.tankkausmaara} onChange={handleInputChange} required inputProps={{ step: "0.01" }} />
            <TextField margin="dense" name="tankkauskustannus" label="Kustannus *" type="number" fullWidth variant="standard" value={newFuel.tankkauskustannus} onChange={handleInputChange} required inputProps={{ step: "0.01" }} />
            <TextField margin="dense" name="kilometrit" label="Kilometrit" type="number" fullWidth variant="standard" value={newFuel.kilometrit} onChange={handleInputChange} inputProps={{ step: "0.1" }} />
            <FormControl fullWidth variant="standard" margin="dense">
              <InputLabel>Huoltoasemaketju</InputLabel>
              <Select name="huoltoasemaketju" value={newFuel.huoltoasemaketju} onChange={handleInputChange}>
                <MenuItem value=""><em>Ei valittu</em></MenuItem>
                {gasStationChains.map((chain) => (
                  <MenuItem key={chain} value={chain}>
                    {chain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="huoltoasema" label="Huoltoasema" type="text" fullWidth variant="standard" value={newFuel.huoltoasema} onChange={handleInputChange} />
            <TextField margin="dense" name="muuta" label="Muuta" type="text" fullWidth variant="standard" value={newFuel.muuta} onChange={handleInputChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Peruuta</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Lisätään...' : 'Lisää'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Päivitä tankkaus</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            {error && (
              <Alert severity="error" style={{ marginBottom: 16 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth variant="standard" margin="dense" required>
              <InputLabel>Rekisteritunnus *</InputLabel>
              <Select name="rekisteritunnus" value={editFuel?.rekisteritunnus} onChange={(e) => setEditFuel({ ...editFuel, rekisteritunnus: e.target.value })} required>
                {cars.map((car) => (
                  <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>
                    {car.rekisteritunnus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="tankkauspva" label="Pvm *" type="date" fullWidth variant="standard" value={editFuel?.tankkauspva} onChange={(e) => setEditFuel({ ...editFuel, tankkauspva: e.target.value })} required InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" name="tankkausmaara" label="Tankkaausmäärä *" type="number" fullWidth variant="standard" value={editFuel?.tankkausmaara} onChange={(e) => setEditFuel({ ...editFuel, tankkausmaara: e.target.value })} required inputProps={{ step: "0.01" }} />
            <TextField margin="dense" name="tankkauskustannus" label="Kustannus *" type="number" fullWidth variant="standard" value={editFuel?.tankkauskustannus} onChange={(e) => setEditFuel({ ...editFuel, tankkauskustannus: e.target.value })} required inputProps={{ step: "0.01" }} />
            <TextField margin="dense" name="kilometrit" label="Kilometrit" type="number" fullWidth variant="standard" value={editFuel?.kilometrit || ''} onChange={(e) => setEditFuel({ ...editFuel, kilometrit: e.target.value })} inputProps={{ step: "0.1" }} />
            <FormControl fullWidth variant="standard" margin="dense">
              <InputLabel>Huoltoasemaketju</InputLabel>
              <Select name="huoltoasemaketju" value={editFuel?.huoltoasemaketju || ''} onChange={(e) => setEditFuel({ ...editFuel, huoltoasemaketju: e.target.value })}>
                <MenuItem value=""><em>Ei valittu</em></MenuItem>
                {gasStationChains.map((chain) => (
                  <MenuItem key={chain} value={chain}>
                    {chain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="huoltoasema" label="Huoltoasema" type="text" fullWidth variant="standard" value={editFuel?.huoltoasema || ''} onChange={(e) => setEditFuel({ ...editFuel, huoltoasema: e.target.value })} />
            <TextField margin="dense" name="muuta" label="Muuta" type="text" fullWidth variant="standard" value={editFuel?.muuta || ''} onChange={(e) => setEditFuel({ ...editFuel, muuta: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Peruuta</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Päivitetään...' : 'Päivitä'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
