Web3Auth & Wagmi React Integration Guide이 프로젝트는 Web3Auth를 사용한 간편한 소셜 로그인 인증과 Wagmi를 이용한 블록체인 상호작용(지갑 연결, 잔액 조회, 트랜잭션 전송 등)을 구현한 React 애플리케이션 예제입니다.이 문서는 App.tsx에 구현된 주요 기능들의 사용법과 동작 원리를 설명합니다.📦 주요 라이브러리 및 훅(Hooks)이 프로젝트는 다음과 같은 핵심 라이브러리와 훅을 사용합니다.라이브러리훅 (Hook)설명@web3auth/modal-reactuseWeb3AuthConnect로그인 모달 연결 및 상태 관리useWeb3AuthDisconnect로그아웃 처리useWeb3AuthUser로그인한 사용자의 소셜 정보 조회wagmiuseAccount현재 연결된 지갑 주소 및 연결 상태 조회🚀 기능별 사용 가이드1. 로그인 (Connect)Web3Auth 모달을 띄워 사용자가 소셜 계정(Google, Twitter 등)이나 이메일로 로그인하게 합니다.사용 방법:useWeb3AuthConnect 훅에서 connect 함수를 가져와 버튼 클릭 시 실행합니다.JavaScriptimport { useWeb3AuthConnect } from "@web3auth/modal-react";

const { 
  connect,      // 로그인 함수
  isConnected,  // 로그인 여부 (boolean)
  connectLoading, // 로딩 상태
  connectError    // 에러 객체
} = useWeb3AuthConnect();

// 사용 예시
<button onClick={() => connect()}>Login</button>
2. 로그아웃 (Disconnect)현재 세션을 종료하고 지갑 연결을 해제합니다.사용 방법:useWeb3AuthDisconnect 훅에서 disconnect 함수를 사용합니다.JavaScriptimport { useWeb3AuthDisconnect } from "@web3auth/modal-react";

const { 
  disconnect,       // 로그아웃 함수
  disconnectLoading // 로딩 상태
} = useWeb3AuthDisconnect();

// 사용 예시
<button onClick={() => disconnect()}>Log Out</button>
3. 사용자 정보 가져오기 (User Info)로그인한 사용자의 이름, 이메일, 프로필 사진 등의 정보를 가져옵니다. (Web3Auth가 제공하는 소셜 정보)사용 방법:useWeb3AuthUser 훅의 userInfo 객체를 확인합니다.JavaScriptimport { useWeb3AuthUser } from "@web3auth/modal-react";

const { userInfo } = useWeb3AuthUser();

// 데이터 예시
/*
{
  "email": "user@example.com",
  "name": "홍길동",
  "profileImage": "...",
  "verifier": "google",
  ...
}
*/

// 사용 예시
console.log(userInfo);
4. 지갑 주소 확인 (Blockchain Address)Web3Auth를 통해 생성되거나 연결된 이더리움 지갑 주소를 가져옵니다. 이는 wagmi 라이브러리를 통해 관리됩니다.사용 방법:wagmi의 useAccount 훅을 사용합니다.JavaScriptimport { useAccount } from "wagmi";

const { address } = useAccount();

// 사용 예시
<div>My Wallet Address: {address}</div>
5. 블록체인 기능 (Transaction, Balance, Chain)블록체인 관련 기능은 컴포넌트 단위로 모듈화되어 있습니다. 각 컴포넌트는 내부적으로 wagmi 훅을 사용합니다.<SendTransaction />: ETH 또는 토큰을 전송하는 기능을 수행합니다.<Balance />: 현재 연결된 지갑의 잔액을 조회합니다.<SwitchChain />: 연결된 네트워크(예: Mainnet ↔ Sepolia)를 변경합니다.JavaScript// App.tsx 내 사용
{isConnected && (
  <>
    <SendTransaction />
    <Balance />
    <SwitchChain />
  </>
)}
🛠 유틸리티 함수UI Console (uiConsole)디버깅을 위해 화면 하단에 로그를 출력하는 헬퍼 함수입니다.TypeScriptfunction uiConsole(...args: any[]): void {
  const el = document.querySelector("#console>p");
  if (el) {
    el.innerHTML = JSON.stringify(args || {}, null, 2);
    console.log(...args);
  }
}
사용법: uiConsole(userInfo)와 같이 호출하면 화면의 #console 영역에 JSON 데이터를 예쁘게 출력합니다.📂 프로젝트 구조 참고이 코드가 정상 작동하기 위해서는 Context Provider 설정이 상위(예: index.tsx 또는 main.tsx)에 반드시 필요합니다.Web3AuthProvider: Web3Auth 인스턴스 주입WagmiProvider: Wagmi 설정 주입QueryClientProvider: React Query 사용 (Wagmi 의존성)JavaScript// (참고) index.tsx 구조 예시
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <Web3AuthProvider config={web3AuthContextConfig}>
      <App />
    </Web3AuthProvider>
  </QueryClientProvider>
</WagmiProvider>