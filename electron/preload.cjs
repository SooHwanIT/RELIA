// electron/preload.cjs

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchGame: (exePath, args) => ipcRenderer.invoke('launch-game', exePath, args),
  
  // [추가] 다운로드/설치 통합 API 노출
  startDownloadInstall: (gameId, downloadUrl, installDir) => 
    ipcRenderer.invoke('start-download-install', gameId, downloadUrl, installDir),

  checkInstallationStatus: (gameId) => ipcRenderer.invoke('check-installation-status', gameId)

});