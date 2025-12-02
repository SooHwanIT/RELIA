const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process'); // spawn 사용을 위해 둘 다 유지
const fs = require('fs/promises'); // fs promise API 사용
const fsSync = require('fs'); // stream 사용을 위해 sync도 필요
const axios = require('axios'); // 다운로드를 위해 추가
const AdmZip = require('adm-zip'); // 압축 해제를 위해 추가

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // 보안상 false 권장
      contextIsolation: true, // 보안상 true 권장
      preload: path.join(__dirname, 'preload.cjs'),
    },
    
    frame: false
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 1. 외부 URL(https)로 시작하는 팝업 요청은 모두 허용 (Web3Auth, Google 등)
    if (url.startsWith('https:')) {
      return { action: 'allow' };
    }
    // 2. 그 외(file:// 등)는 차단
    return { action: 'deny' };
  });
  mainWindow.webContents.openDevTools();
  // 개발 모드: Vite 서버 주소 로드
  // 배포 모드: 빌드된 HTML 파일 로드
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);
}

// ---------------------------------------------------------
// [핵심 수정] IPC 통신 핸들러를 하나의 함수에 묶어 등록 오류 방지
// ---------------------------------------------------------
function registerIpcHandlers() {
    
    // 다운로드/설치 요청 처리
    ipcMain.handle('start-download-install', async (event, gameId, downloadUrl, installDir) => {
        // 렌더러에서 전달받은 최종 설치 경로 (예: C:\electron-game-launcher\games\UUID)
        const targetDir = installDir; 
        const zipFilePath = path.join(targetDir, `${gameId}.zip`);

        console.log(`[Main] Download/Install for Game ${gameId} started. Target: ${targetDir}`);

        try {
            // 1. 설치 디렉토리 생성 (recursive: 상위 폴더가 없으면 함께 생성)
            await fs.mkdir(targetDir, { recursive: true });
            console.log(`[Main] Target directory created/exists: ${targetDir}`);

            // 2. 파일 다운로드 (Stream을 사용하여 대용량 파일 처리 및 저장 경로 지정)
            const writer = fsSync.createWriteStream(zipFilePath); 
            const response = await axios({
                method: 'get',
                url: downloadUrl,
                responseType: 'stream',
            });

            // 다운로드 스트림을 로컬 파일 쓰기 스트림에 연결
            response.data.pipe(writer);

            // 다운로드가 완료될 때까지 대기
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', (err) => {
                    fs.unlink(zipFilePath).catch(() => {}); // 오류 시 부분 다운로드된 파일 정리
                    reject(new Error(`Download failed: ${err.message}`));
                });
            });
            
            console.log(`[Main] Download finished: ${zipFilePath}`);
            
            // 3. 압축 해제 (AdmZip의 extractAllTo 대신 수동으로 파일 쓰기)
            const zip = new AdmZip(zipFilePath);
            const zipEntries = zip.getEntries();
            
            let extractedCount = 0;
            
            for (const entry of zipEntries) {
                const fullPath = path.join(targetDir, entry.entryName);
                
                if (entry.isDirectory) {
                    // 폴더 생성
                    await fs.mkdir(fullPath, { recursive: true }).catch(err => {
                        if (err.code !== 'EEXIST') throw err; // 이미 존재하면 무시
                    });
                } else {
                    // 파일인 경우 데이터 직접 쓰기
                    const data = entry.getData();
                    await fs.writeFile(fullPath, data);
                    extractedCount++;
                }
            }

            console.log(`[Main] Extraction finished. Total files extracted: ${extractedCount}`);

            // 5. ZIP 파일 정리
            await fs.unlink(zipFilePath);
            console.log(`[Main] ZIP file cleanup complete.`);

            return { success: true, message: "설치가 완료되었습니다." };

        } catch (error) {
            // [참고] 오류를 렌더러로 전달
            console.error(`[Main] Installation failed for ${gameId}:`, error);
            // 오류를 렌더러로 전달
            return { success: false, message: `설치 중 오류 발생: ${error.message || String(error)}` };
        }
    });

      // [Launch Game] - spawn을 사용하여 Electron 프로세스와 분리 실행 (exec 대신 spawn 권장)
      ipcMain.handle('launch-game', async (event, exePath, args) => {
      return new Promise((resolve, reject) => {
          
          // --- [성공적인 인증을 위한 유효 파라미터 상수 정의] ---
          const FAKE_ID = '1234'; // ID != 기본값
          const FAKE_NAME = 'TestUser_123'; // Name != 기본값
          const FAKE_GAME_ID = '00000000-0000-0000-0000-000000000001'; // GameId != 기본값
          const FAKE_KEY = 'ValidAuthKey1234'; // Key != 기본값

          // *****************************************************************
          // [핵심] 인자 문자열 대신 인자 배열을 직접 구성 (가장 안정적인 방식)
          // *****************************************************************
          const argsArray = [
              '-id', FAKE_ID,
          ];

          console.log(`[Main] Launching: ${exePath}`);
          console.log(`[Main] Arguments: ${argsArray.join(' ')}`);

          // spawn 사용: 프로세스를 완전히 분리하여 Electron 종료 후에도 게임이 유지되게 함
          const gameProcess = spawn(exePath, argsArray, { // FAKE_args.split(...) 대신 argsArray 사용
              cwd: path.dirname(exePath), // 실행 파일이 있는 디렉토리를 작업 디렉토리로 설정
              detached: true, // Electron 프로세스와 분리
              stdio: 'ignore' // 자식 프로세스의 입출력을 무시
          });

          gameProcess.on('error', (err) => {
              console.error(`[Main] Spawn error: ${err.message}`);
              // 실행 실패 시 reject
              reject(new Error(`게임 실행 실패: ${err.message}`));
          });

          // 프로세스를 분리하여 메인 프로세스가 종료를 기다리지 않게 함
          // 이것은 게임 프로세스를 백그라운드에서 실행하고 즉시 메인 프로세스가 다음 작업을 하도록 합니다.
          gameProcess.unref(); 
          
          // 실행 시도 성공으로 간주
          resolve("Game launch attempt successful.");
      });
    });
}
// ---------------------------------------------------------


app.whenReady().then(() => {
    // 1. IPC 핸들러 등록 (앱 준비 시 오직 1회)
    registerIpcHandlers(); 
    
    // 2. 윈도우 생성
    createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('check-installation-status', async (event, gameId) => {
    // 1. 예상되는 최종 실행 파일 경로
    const INSTALL_DIR = `C:\\electron-game-launcher\\games\\${gameId}`;
    const FINAL_EXE_PATH = path.join(INSTALL_DIR, 'game.exe');

    try {
        // 2. 파일 존재 여부 확인
        const isInstalled = fs.existsSync(FINAL_EXE_PATH);
        return { isInstalled };
    } catch (e) {
        // 파일 시스템 접근 오류 발생 시 (권한 등)
        console.error(`[Main] Error checking installation status for ${gameId}:`, e);
        return { isInstalled: false };
    }
});