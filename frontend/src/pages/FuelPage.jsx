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

  const gasStationChains = ['ABC', 'Neste', 'NesteExpress', 'SEO', 'ST1', 'Teboil']; // Predefined gas station chains

  const columns = [
    { field: 'rekisteritunnus', headerName: 'Rekisteritunnus', width: 90 },
    { field: 'tankkauspva', headerName: 'Tankkauspvm', width: 110 },
    { field: 'tankkausmaara', headerName: 'Määrä', width: 80, type: 'number', valueFormatter: (params) => params.value?.toFixed(1) },
    { field: 'tankkauskustannus', headerName: 'Kustannus', width: 80, type: 'number' },
    { field: 'kilometrit', headerName: 'Kilometrit', width: 80, type: 'number' },
    { field: 'kulutus', headerName: 'Kulutus (l/100km)', width: 80, type: 'number', valueFormatter: (params) => params.value?.toFixed(1) },
    { field: 'litrahinta', headerName: 'Hinta', width: 80, type: 'number', valueFormatter: (params) => params.value?.toFixed(3) },
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
    const loadData = async () => {
      setLoading(true);
      try {
        const [fuelData, carData] = await Promise.all([fetchFuelData(), fetchCars()]);
        const mergedData = fuelData.map((fuel) => {
          const car = carData.find((c) => c.rekisteritunnus === fuel.rekisteritunnus);
          return {
            ...fuel,
            rekisteritunnus: car ? car.rekisteritunnus : 'Unknown',
            // Format numbers as strings with decimals
            tankkausmaara: Number(fuel.tankkausmaara).toFixed(2),
            tankkauskustannus: Number(fuel.tankkauskustannus).toFixed(2),
            kilometrit: Number(fuel.kilometrit).toFixed(1),
            kulutus: fuel.kulutus ? Number(fuel.kulutus).toFixed(1) : null,
            litrahinta: fuel.litrahinta ? Number(fuel.litrahinta).toFixed(3) : null
          };
        });
//        console.log("Current rows data:", mergedData);
        setRows(mergedData);
        setCars(carData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFuel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addFuelRecord(newFuel);
      const updatedData = await fetchFuelData();
      const mergedData = updatedData.map((fuel) => {
        const car = cars.find((c) => c.rekisteritunnus === fuel.rekisteritunnus);
        return { ...fuel, rekisteritunnus: car ? car.rekisteritunnus : 'Unknown' };
      });
      setRows(mergedData);
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
      setError('Failed to add fuel record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteFuelRecord(id);
      const updatedData = await fetchFuelData();
      const mergedData = updatedData.map((fuel) => {
        const car = cars.find((c) => c.rekisteritunnus === fuel.rekisteritunnus);
        return { ...fuel, rekisteritunnus: car ? car.rekisteritunnus : 'Unknown' };
      });
      setRows(mergedData);
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
    setLoading(true);
    try {
      await updateFuelRecord(editFuel.id, editFuel);
      const updatedData = await fetchFuelData();
      const mergedData = updatedData.map((fuel) => {
        const car = cars.find((c) => c.rekisteritunnus === fuel.rekisteritunnus);
        return { ...fuel, rekisteritunnus: car ? car.rekisteritunnus : 'Unknown' };
      });
      setRows(mergedData);
      setEditOpen(false);
    } catch (err) {
      console.error('Error updating fuel record:', err);
      setError('Failed to update fuel record');
    } finally {
      setLoading(false);
    }
  };

//
  useEffect(() => {
    const loadFuel = async () => {
      setLoading(true);
      try {
        const data = await fetchFuelData();
        setFuelData(data);
      } catch (err) {
        setError('Failed to load fuel data');
      } finally {
        setLoading(false);
      }
    };

    loadFuel();
  }, []);

  const handleExportClick = () => {
    const csvData = generateCSVData(fuelData);
    downloadCSV(csvData, 'all_fuel_data.csv');
  };

  if (loading) {
    return <div>Loading fuel data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
//

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h2>Tankkaustietojen hallinta</h2>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Lisää uusi tankkaus</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth variant="standard" margin="dense">
              <InputLabel>Rekisteritunnus</InputLabel>
              <Select name="rekisteritunnus" value={newFuel.rekisteritunnus} onChange={handleInputChange} required>
                {cars.map((car) => (
                  <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>
                    {car.rekisteritunnus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="tankkauspva" label="Pvm" type="date" fullWidth variant="standard" value={newFuel.tankkauspva} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" name="tankkausmaara" label="Tankkausmäärä" type="number" fullWidth variant="standard" value={newFuel.tankkausmaara} onChange={handleInputChange} required />
            <TextField margin="dense" name="tankkauskustannus" label="Kustannus" type="number" fullWidth variant="standard" value={newFuel.tankkauskustannus} onChange={handleInputChange} required />
            <TextField margin="dense" name="kilometrit" label="Kilometrit" type="number" fullWidth variant="standard" value={newFuel.kilometrit} onChange={handleInputChange} required />
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
            <Button onClick={() => setOpen(false)}>Peruuta</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Lisää'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Päivitä</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <FormControl fullWidth variant="standard" margin="dense">
              <InputLabel>Rekisteritunnus</InputLabel>
              <Select name="rekisteritunnus" value={editFuel?.rekisteritunnus} onChange={(e) => setEditFuel({ ...editFuel, rekisteritunnus: e.target.value })} required>
                {cars.map((car) => (
                  <MenuItem key={car.rekisteritunnus} value={car.rekisteritunnus}>
                    {car.rekisteritunnus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="tankkauspva" label="Pvm." type="date" fullWidth variant="standard" value={editFuel?.tankkauspva} onChange={(e) => setEditFuel({ ...editFuel, tankkauspva: e.target.value })} required InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" name="tankkausmaara" label="Tankkausmäärä" type="number" fullWidth variant="standard" value={editFuel?.tankkausmaara} onChange={(e) => setEditFuel({ ...editFuel, tankkausmaara: e.target.value })} required />
            <TextField margin="dense" name="tankkauskustannus" label="Kustannus" type="number" fullWidth variant="standard" value={editFuel?.tankkauskustannus} onChange={(e) => setEditFuel({ ...editFuel, tankkauskustannus: e.target.value })} required />
            <TextField margin="dense" name="kilometrit" label="Kilometrit" type="number" fullWidth variant="standard" value={editFuel?.kilometrit} onChange={(e) => setEditFuel({ ...editFuel, kilometrit: e.target.value })} required />
            <FormControl fullWidth variant="standard" margin="dense">
              <InputLabel>Huoltoasemaketju</InputLabel>
              <Select name="huoltoasemaketju" value={editFuel?.huoltoasemaketju} onChange={(e) => setEditFuel({ ...editFuel, huoltoasemaketju: e.target.value })}>
                <MenuItem value=""><em>Ei valittu</em></MenuItem>
                {gasStationChains.map((chain) => (
                  <MenuItem key={chain} value={chain}>
                    {chain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" name="huoltoasema" label="Huoltoasema" type="text" fullWidth variant="standard" value={editFuel?.huoltoasema} onChange={(e) => setEditFuel({ ...editFuel, huoltoasema: e.target.value })} />
            <TextField margin="dense" name="muuta" label="Muuta" type="text" fullWidth variant="standard" value={editFuel?.muuta} onChange={(e) => setEditFuel({ ...editFuel, muuta: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Peruuta</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Päivitä'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
