/// <reference types="vite/client" />
interface Window {
  ethereum?: any;
  electronAPI?: {
    launchGame: (exePath: string, args: string) => Promise<string>;
  };
}