import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import os from 'os';

const app = express();
app.use(cors());

// Pour obtenir __dirname dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'downloads' folder
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.get('/api/grib-data', async (req, res) => {
  const filename = req.query.filename;
  const date = req.query.date;
  const local = req.query.local === 'true';

  let url;

  if (!local) {
    // ugrd & vgrd 10 m above ground
   // url = `https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?dir=%2Fgfs.${date}%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f${filename}&var_UGRD=on&var_VGRD=on&lev_10_m_above_ground=on`;
    // ugrd & vgrd 10 m above ground , wind gust surface
    url = `https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.${date}%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f${filename}&var_GUST=on&var_UGRD=on&var_VGRD=on&lev_10_m_above_ground=on&lev_surface=on`;
  } else {
    url = `http://localhost:3000/downloads/gfs.t00z.pgrb2.0p25.f${filename}`;
  }

  console.log('get', url);

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
    });

    if (!local) {
      const filePath = path.join(__dirname, 'downloads', `gfs.t00z.pgrb2.0p25.f${filename}`);
      fs.writeFileSync(filePath, response.data);
    }

    res.set('Content-Type', 'application/octet-stream');
    res.send(response.data);
  } catch (error) {
    console.error('server error', filename, 'error download');
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});