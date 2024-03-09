const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const socketIO = require('socket.io')
const http = require('http');

const app = express();
const port = 3000;
const server = http.createServer(app)
app.set('view engine', 'ejs')

app.use(express.static('public/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const io = socketIO(server);

let consecutivo = 1;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'plates/');
  },
  filename: (req, file, cb) => {
    const imageFilename = `${pad(consecutivo, 5)}.jpg`;
    consecutivo++;
    cb(null, imageFilename);
  }
});

const upload = multer({ storage: storage });

function pad(number, length) {
  let str = String(number);
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/upload', upload.single('image'), (req, res) => {
  const imageFilename = req.file.filename;
  const textContent = req.body.text;

  const textFilename = imageFilename.replace('.jpg', '.txt');
  const textPath = path.join('plate_numbers/', textFilename);
  fs.writeFileSync(textPath, textContent);

  res.send('Imagen y texto guardados correctamente.');
});

app.get('/images/:imageName', (req, res) => {
    res.render("index2", {
      imageName: req.params.imageName
    })
  });

  app.post('/upload/:imageName', upload.single('text'), (req, res) => {
    const imageName = req.params.imageName;
    const textContent = req.body.text;

    const textFilename = `${imageName.replace('.jpg', '.txt')}`;
    const textPath = path.join('plate_numbers/', textFilename);
    fs.writeFileSync(textPath, textContent || '');

    io.emit('alert', '¡Archivo .txt guardado correctamente!');

  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado');
  })
  
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
