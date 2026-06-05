const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

// When ELECTRON_START_URL is set (electron:dev) we load the Vite dev server.
// Otherwise — both the packaged app and `npm run app` — we load the built files.
const DEV_SERVER_URL = process.env.ELECTRON_START_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f5f5f4',
    title: 'Invoice Studio',
    autoHideMenuBar: true,
    show: false, // avoid a white flash; reveal once ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Start maximized so the editor + preview show side-by-side, but keep a
  // sensible 1280x860 restore size for when the user un-maximizes.
  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });

  // Open external links in the system browser, not inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// ---------------------------------------------------------------------------
// Offline OCR: the renderer sends an image data URL, we run Tesseract here in
// the Node main process (no network, no CORS issues) and return the raw text.
// The English model is bundled at electron/tessdata/eng.traineddata.gz.
// ---------------------------------------------------------------------------
let ocrWorkerPromise = null;

function getOcrWorker() {
  if (!ocrWorkerPromise) {
    const { createWorker } = require('tesseract.js');
    const langPath = path.join(__dirname, 'tessdata');
    ocrWorkerPromise = createWorker('eng', 1, {
      langPath,
      gzip: true,
      cacheMethod: 'none',
      logger: () => {},
    }).catch((err) => {
      ocrWorkerPromise = null; // allow a retry on the next call
      throw err;
    });
  }
  return ocrWorkerPromise;
}

ipcMain.handle('ocr:scan', async (_event, dataUrl) => {
  try {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return { ok: false, error: 'Not an image.' };
    }
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const buffer = Buffer.from(base64, 'base64');
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(buffer);
    return { ok: true, text: data.text || '' };
  } catch (err) {
    return { ok: false, error: (err && err.message) || String(err) };
  }
});

app.whenReady().then(() => {
  // Minimal native menu; Print stays available via Ctrl+P inside the app.
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [{ role: 'quit' }],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ])
  );

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
