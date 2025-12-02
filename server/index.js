require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multerS3 = require('multer-s3');
const { ethers } = require('ethers');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. AWS S3 설정
// ---------------------------------------------------------
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
      cb(null, `games/${Date.now()}-${filename}`); 
    },
  }),
});

// ---------------------------------------------------------
// 2. 데이터베이스 (In-Memory, UUID 기반)
// ---------------------------------------------------------
// 구조: { "uuid-string": { name: "Title", ... } }
let games = {
    // 임시 초기 데이터 (서버 재시작 시 사라짐)
    "a870d0a2-23c3-42e7-9154-8c81e3a6f112": {
        name: "Test Game RPC",
        description: "Initial data for testing RPC calls.",
        image: "https://placehold.co/600x400/000000/FFFFFF?text=Initial",
        category: "RPG",
        external_url: "http://localhost:5173"
    }
}; 
const gameFiles = {}; // UUID => S3 Key

// [중요] 중고 매물 데이터 (Nested Map: {gameId: [listings...]})
let listings = {
    // 테스트용 중고 매물
    "a870d0a2-23c3-42e7-9154-8c81e3a6f112": [
        { id: 'u1', priceEth: '0.0042', sellerName: 'RetroGamer', sellerAddress: '0x456F26E6d63C7d34C2d8A92211C152763f3D2a3F', owners: 2, tokenId: '0042', createdAt: Date.now() - 3600000 },
        { id: 'u2', priceEth: '0.0035', sellerName: 'FastSeller', sellerAddress: '0x789253767BfD742B28b0304381C497D29fA03882', owners: 6, tokenId: '8821', createdAt: Date.now() - 7200000 },
    ],
};


// ---------------------------------------------------------
// 3. API 라우트
// ---------------------------------------------------------

// [GET] 전체 게임 목록 (StorePage용)
app.get('/api/games', (req, res) => {
    const gameList = Object.entries(games).map(([id, data]) => ({
        id: id,
        ...data
    }));
    res.json(gameList);
});

// [GET] 단일 메타데이터 조회 (NFT 표준)
app.get('/api/token/:id', (req, res) => {
    const id = req.params.id;
    const game = games[id];
    
    if(!game) return res.status(404).json({error: "Not found"});

    res.json({
        name: game.name,
        description: game.description,
        image: game.image,
        category: game.category,
        external_url: game.external_url
    });
});

// [GET] 중고 매물 리스트 조회 (PurchaseModal용)
app.get('/api/listings', (req, res) => {
    const { gameId } = req.query;
    
    if (!gameId) {
        return res.status(400).json({ error: "Game ID가 필요합니다." });
    }

    const gameListings = listings[gameId] || []; 
    
    res.json(gameListings);
});

// [POST] 리스팅 정보 저장 (SellModal에서 트랜잭션 성공 후 호출)
app.post('/api/list-item', (req, res) => {
    const { gameId, priceEth, sellerAddress, sellerName } = req.body;

    if (!gameId || !priceEth || !sellerAddress) {
        return res.status(400).json({ error: "필수 리스팅 정보가 누락되었습니다." });
    }

    const newListing = {
        id: randomUUID(), // 새 리스팅 ID
        priceEth: priceEth,
        sellerAddress: sellerAddress,
        sellerName: sellerName,
        owners: 1, // 최초 판매로 가정
        tokenId: `#${Math.floor(Math.random() * 9000) + 1000}`, // 임의의 토큰 ID
        createdAt: Date.now(),
        date: new Date().toLocaleDateString()
    };

    // 해당 게임의 리스팅 배열에 추가
    if (!listings[gameId]) {
        listings[gameId] = [];
    }
    listings[gameId].push(newListing);
    
    console.log(`[Listing Indexer] New listing added for Game ${gameId} by ${sellerAddress}`);
    res.json({ success: true, listingId: newListing.id });
});


// [POST] 게임 메타데이터 등록 (관리자 Step 1) -> UUID 생성
app.post('/api/games', (req, res) => {
    const { title, desc, image, category } = req.body;
    
    const newId = randomUUID(); 
    
    games[newId] = { 
        name: title, 
        description: desc, 
        image: image,
        category: category,
        external_url: "http://localhost:5173"
    };
    
    console.log(`[Metadata] Game Created. UUID: ${newId}`);
    res.json({ success: true, id: newId });
});

// [POST] 게임 파일 업로드 (관리자 Step 3)
app.post('/api/upload', (req, res) => {
  upload.single('gameFile')(req, res, (err) => {
    if (err) {
      console.error("🚨 S3 업로드 실패:", err);
      return res.status(500).json({ error: "S3 업로드 실패: " + err.message });
    }
    const { gameId } = req.body;
    if (!gameId) return res.status(400).json({ error: "Game ID가 없습니다." });

    gameFiles[gameId] = req.file.key; 
    console.log(`[S3 Upload] Game ${gameId} file uploaded. Key: ${req.file.key}`);
    res.json({ success: true, key: req.file.key });
  });
});

// [POST] 게임 다운로드 (유저)
app.post('/api/download', async (req, res) => {
  const { gameId, userAddress, signature } = req.body;

  try {
    const message = `Download Game #${gameId}`; 
    const recoveredAddr = ethers.verifyMessage(message, signature);

    if (recoveredAddr.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(401).json({ error: "지갑 서명이 일치하지 않습니다." });
    }

    const fileKey = gameFiles[gameId];
    if (!fileKey) return res.status(404).json({ error: "파일을 찾을 수 없습니다." });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });
    
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.json({ downloadUrl: url });

  } catch (err) {
    console.error("S3/Auth Error:", err);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Game Server running on port ${PORT} (UUID/S3/Listings Enabled)`);
});