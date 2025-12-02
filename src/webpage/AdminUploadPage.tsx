
import { useState, ChangeEvent, FormEvent } from 'react';

import { ethers } from 'ethers';

import axios from 'axios';

import { Upload, DollarSign, Layers, Percent, Loader2, FileText, HardDrive, CheckCircle } from 'lucide-react';



import ContractABI from '../abis/GameMarketplace.json';



// 주소 문자열 안전 처리

const rawAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;

const CONTRACT_ADDRESS = rawAddress ? rawAddress.replace(/["';\s]/g, "") : "";

const SERVER_URL = 'http://localhost:3001';



interface GameFormData {

  title: string;

  price: string;

  supply: string;

  royalty: string;

  category: string;

  image: string;

  desc: string;

}



export default function AdminUploadPage() {

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [status, setStatus] = useState<string>("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);



  const [formData, setFormData] = useState<GameFormData>({

    title: "", price: "", supply: "1000", royalty: "5", category: "RPG", image: "", desc: ""

  });



  const categories = ["액션", "RPG", "전략", "스포츠", "인디", "시뮬레이션", "공포"];



  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

  };



  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);

  };



  const handleUpload = async (e: FormEvent) => {

    e.preventDefault();



    if (!window.ethereum) return alert("지갑(메타마스크 등)이 필요합니다.");

    if (!CONTRACT_ADDRESS) return alert("컨트랙트 주소 오류 (.env 확인)");

    if (!selectedFile) return alert("게임 실행 파일을 선택해주세요.");



    try {

      setIsLoading(true);

     

      // 1. [Server] 메타데이터 등록 -> UUID 발급

      setStatus("1/3. 메타데이터 서버 등록 중...");

      const metaResponse = await axios.post(`${SERVER_URL}/api/games`, {

        title: formData.title,

        desc: formData.desc,

        image: formData.image,

        category: formData.category

      });



      if (!metaResponse.data.success) throw new Error("메타데이터 등록 실패");

      const newGameUUID = metaResponse.data.id; // UUID (String)

      console.log(`Step 1 Done. UUID: ${newGameUUID}`);



      // 2. [Blockchain] 스마트 컨트랙트 등록

      setStatus("2/3. 지갑 서명 요청 중...");

      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);



      const priceInWei = ethers.parseEther(formData.price);

      const royaltyBasisPoints = Number(formData.royalty) * 100;

     

      // UUID String -> BigInt 변환 (0x + 하이픈 제거)

      const gameIdBigInt = BigInt("0x" + newGameUUID.replace(/-/g, ""));



      const tx = await contract.registerGame(

        gameIdBigInt,

        priceInWei,

        Number(formData.supply),

        royaltyBasisPoints

      );



      setStatus("블록체인 승인 대기 중...");

      await tx.wait();

      console.log("Step 2 Done. Blockchain Confirmed.");



      // 3. [Server] 파일 업로드

      setStatus("3/3. 게임 파일 서버 전송 중...");

      const fileData = new FormData();

      fileData.append('gameId', newGameUUID);

      fileData.append('gameFile', selectedFile);



      await axios.post(`${SERVER_URL}/api/upload`, fileData, {

        headers: { 'Content-Type': 'multipart/form-data' }

      });



      alert(`성공적으로 등록되었습니다!\nID: ${newGameUUID}`);

     

      // 초기화

      setFormData({ title: "", price: "", supply: "1000", royalty: "5", category: "RPG", image: "", desc: "" });

      setSelectedFile(null);



    } catch (error: any) {

      console.error(error);

      alert(`업로드 실패: ${error.message}`);

    } finally {

      setIsLoading(false);

      setStatus("");

    }

  };



  return (

    <div className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">

      <div className="max-w-4xl w-full bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row">

       

        {/* 왼쪽 Preview */}

        <div className="md:w-1/3 bg-[#181818] p-8 flex flex-col items-center justify-center border-r border-white/5">

          <h3 className="text-gray-400 text-sm font-bold mb-4 tracking-wider">PREVIEW</h3>

          <div className="w-full aspect-[3/4] rounded-lg bg-[#121212] border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden relative group">

            {formData.image ? (

              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />

            ) : (

              <div className="text-center text-gray-600">

                <Upload className="mx-auto mb-2" size={32} />

                <span className="text-xs">이미지 URL을 입력하세요</span>

              </div>

            )}

          </div>

          <div className="mt-6 w-full space-y-2">

            <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" style={{ display: formData.title ? 'none' : 'block' }}></div>

            {formData.title && <h2 className="text-white font-bold text-lg text-center">{formData.title}</h2>}

            <div className="flex justify-between text-sm pt-2 border-t border-gray-700">

              <span className="text-gray-400">Price</span>

              <span className="text-[#ff3f3f] font-bold">{formData.price || 0} ETH</span>

            </div>

          </div>

        </div>



        {/* 오른쪽 Form */}

        <div className="md:w-2/3 p-8">

          <div className="flex justify-between items-center mb-6">

            <h1 className="text-2xl font-bold text-white">게임 등록 (UUID)</h1>

            <span className="bg-[#ff3f3f]/20 text-[#ff3f3f] text-xs font-bold px-2 py-1 rounded">MANAGER MODE</span>

          </div>



          <form onSubmit={handleUpload} className="space-y-5">

            <div className="grid grid-cols-3 gap-4">

              <div className="col-span-2 space-y-1">

                <label className="text-gray-400 text-xs ml-1">게임 제목</label>

                <input required name="title" value={formData.title} onChange={handleChange}

                  className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none" />

              </div>

              <div className="space-y-1">

                <label className="text-gray-400 text-xs ml-1">카테고리</label>

                <select name="category" value={formData.category} onChange={handleChange}

                  className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none">

                  {categories.map(c => <option key={c} value={c}>{c}</option>)}

                </select>

              </div>

            </div>



            <div className="grid grid-cols-3 gap-4">

              <div className="space-y-1">

                <label className="text-gray-400 text-xs ml-1 flex items-center gap-1"><DollarSign size={10}/> 가격 (ETH)</label>

                <input required type="number" step="0.0001" name="price" value={formData.price} onChange={handleChange}

                  className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none" />

              </div>

              <div className="space-y-1">

                <label className="text-gray-400 text-xs ml-1 flex items-center gap-1"><Layers size={10}/> 수량</label>

                <input required type="number" name="supply" value={formData.supply} onChange={handleChange}

                  className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none" />

              </div>

              <div className="space-y-1">

                <label className="text-gray-400 text-xs ml-1 flex items-center gap-1"><Percent size={10}/> 로열티 (%)</label>

                <input required type="number" max="30" name="royalty" value={formData.royalty} onChange={handleChange}

                  className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none" />

              </div>

            </div>



            <div className="space-y-1">

              <label className="text-gray-400 text-xs ml-1">이미지 URL</label>

              <input required type="url" name="image" value={formData.image} onChange={handleChange}

                className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none text-sm" />

            </div>



            {/* 파일 업로드 */}

            <div className="space-y-1 bg-[#252525] p-4 rounded border border-gray-700/50">

              <label className="text-gray-300 text-xs font-bold mb-2 flex items-center gap-2">

                <HardDrive size={14} className="text-[#ff3f3f]" /> 실행 파일 (.exe, .zip)

              </label>

              <div className="relative">

                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:bg-[#333] file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 hover:file:bg-[#444] cursor-pointer"/>

                {selectedFile && <div className="absolute right-0 top-2 text-xs text-green-500 font-bold flex gap-1"><CheckCircle size={12}/> {selectedFile.name}</div>}

              </div>

            </div>



            <div className="space-y-1">

              <label className="text-gray-400 text-xs ml-1">설명</label>

              <textarea required name="desc" value={formData.desc} onChange={handleChange} rows={3}

                className="w-full bg-[#121212] text-white border border-gray-700 rounded p-3 focus:border-[#ff3f3f] outline-none text-sm resize-none" />

            </div>



            <button type="submit" disabled={isLoading}

              className={`w-full py-4 rounded font-bold text-white flex items-center justify-center gap-2 transition-all ${isLoading ? 'bg-gray-600' : 'bg-[#ff3f3f] hover:bg-red-600'}`}>

              {isLoading ? <><Loader2 className="animate-spin" /> {status}</> : <><FileText size={20} /> 게임 발행 및 파일 업로드</>}

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}