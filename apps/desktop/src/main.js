const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

const WEB_PORT = process.env.PORT || 3001;

const createMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', visible: isDev },
        { role: 'toggleDevTools', visible: isDev },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Project README',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://github.com/scanton/trixelator');
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL || `http://localhost:${WEB_PORT}`);
  } else {
    const staticIndex = path.join(process.resourcesPath, 'web', 'index.html');
    const fileUrl = url.pathToFileURL(staticIndex).toString();
    win.loadURL(fileUrl);
  }
};

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
