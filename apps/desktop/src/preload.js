const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('trixelator', {
  environment: process.env.NODE_ENV || 'production',
});
