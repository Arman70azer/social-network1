const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const http = require('http');
const net = require('net');

let mainWindow;

// Fonction pour vérifier si un port est disponible
function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer().listen(port, '127.0.0.1');
    server.on('listening', () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Fonction pour trouver un port libre
async function findFreePort(startingPort = 3000) {
  let port = startingPort;
  while (true) {
    const available = await isPortAvailable(port);
    if (available) return port;
    port++;
  }
}

app.on('ready', async () => {
  // Trouver un port libre à partir du port 3000
  const port = await findFreePort(3000);
  console.log(`Port libre trouvé: ${port}`);

  // Lancez le serveur Next.js sur le port libre trouvé
  const nextDevServer = exec(`npm run dev -p ${port}`, {
    cwd: __dirname, // Changez ce chemin si nécessaire
  });

  nextDevServer.stdout.on('data', (data) => {
    console.log(`NEXT: ${data}`);
  });

  nextDevServer.stderr.on('data', (data) => {
    console.error(`NEXT ERROR: ${data}`);
  });

  // Vérifiez si le serveur Next.js est en ligne avant de lancer Electron
  const checkIfServerIsUp = () => {
    http.get(`http://localhost:${port}`, (res) => {
      if (res.statusCode === 200) {
        // Le serveur Next.js est prêt, lancez la fenêtre Electron
        createWindow(port);
      } else {
        setTimeout(checkIfServerIsUp, 1000); // Essayez à nouveau après 1 seconde
      }
    }).on('error', () => {
      setTimeout(checkIfServerIsUp, 1000); // Essayez à nouveau si l'URL échoue
    });
  };

  // Attendez que le serveur soit prêt pour créer la fenêtre
  checkIfServerIsUp();
});

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Chargez l'URL locale du serveur Next.js avec le port dynamique
  mainWindow.loadURL(`http://localhost:${port}`);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
