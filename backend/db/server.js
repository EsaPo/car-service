// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const fuelRoutes = require('./fuel');
const carRoutes = require('./car');
const drivingdataRoutes = require('./drivingdata');
const serviceRoutes = require('./service');

app.use(cors());
app.use(express.json());
app.use('/fuel', fuelRoutes);
app.use('/car', carRoutes);
app.use('/drivingdata', drivingdataRoutes);
app.use('/service', serviceRoutes);

const PORT = process.env.PORT || 2995;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
