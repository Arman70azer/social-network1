const { app, BrowserWindow, session } = require('electron');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Fonction pour trouver un port libre
const findFreePort = (startPort) => {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const checkPort = () => {
      const server = http.createServer();
      server.listen(port, '127.0.0.1', () => {
        server.close(() => {
          resolve(port);  // Retourner le port libre
        });
      });
      server.on('error', () => {
        port += 1; // Essayer le port suivant si celui-ci est déjà pris
        checkPort();
      });
    };
    checkPort();
  });
};

// Fonction pour charger les cookies depuis un fichier
async function loadCookies() {
  const cookiesFilePath = path.join(__dirname, 'cookies.json');
  if (fs.existsSync(cookiesFilePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf-8'));
    for (const cookie of cookies) {
      await session.defaultSession.cookies.set(cookie);
    }
    console.log('Cookies restaurés.');
  } else {
    console.log('Aucun fichier de cookies trouvé.');
  }
}

// Fonction pour créer la fenêtre de l'application Electron
function createWindow(port, cookiesList) {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Chargez l'URL du serveur Next.js
  if (cookiesList && cookiesList.length > 0) {
    mainWindow.loadURL(`http://localhost:${port}/home`);
  } else {
    mainWindow.loadURL(`http://localhost:${port}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  try {
    // Trouver un port libre à partir du port 3000
    const port = await findFreePort(3000);
    console.log(`Port libre trouvé: ${port}`);

    // Lancer le serveur Next.js sur le port trouvé
    const nextDevServer = exec(`npm run dev -p ${port}`, {
      cwd: __dirname, // Changez ce chemin si nécessaire
    });

    nextDevServer.stdout.on('data', (data) => {
      console.log(`NEXT: ${data}`);
    });

    nextDevServer.stderr.on('data', (data) => {
      console.error(`NEXT ERROR: ${data}`);
    });

    // Restaurer les cookies au démarrage
    await loadCookies();

    // Récupérer les cookies après les avoir restaurés
    const cookiesList = await session.defaultSession.cookies.get({});
    console.log('Cookies récupérés:', cookiesList);

    // Vérifiez si le serveur Next.js est en ligne avant de lancer Electron
    const checkIfServerIsUp = () => {
      http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode === 200) {
          // Le serveur Next.js est prêt, lancez la fenêtre Electron
          createWindow(port, cookiesList);
        } else {
          setTimeout(checkIfServerIsUp, 1000); // Essayez à nouveau après 1 seconde
        }
      }).on('error', () => {
        setTimeout(checkIfServerIsUp, 1000); // Essayez à nouveau si l'URL échoue
      });
    };

    // Attendez que le serveur soit prêt pour créer la fenêtre
    checkIfServerIsUp();
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'application:', error);
  }
});
