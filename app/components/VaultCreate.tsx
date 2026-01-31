import React, { useState, useEffect } from 'react';
import { generateMasterKey, encryptData, splitKey } from '@/utils/crypto';
import { embedDataInImage } from '@/utils/steganography';
import { generateCoverImage, generateArtPrompt } from '@/services/geminiService';
import { storageService } from '@/services/storageService';
import { GeneratedImage, VaultData, SecretPayload, DecryptedFile } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onBack: () => void;
}

const VaultCreate: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  
  // Data State
  const [secretText, setSecretText] = useState('');
  const [secretFiles, setSecretFiles] = useState<DecryptedFile[]>([]);
  const [vaultName, setVaultName] = useState('');
  
  // Guardians State
  const [extraGuardians, setExtraGuardians] = useState<string[]>(['']); 
  const [threshold, setThreshold] = useState<number>(2);
  
  // Processing State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [myImage, setMyImage] = useState<GeneratedImage | null>(null);
  
  const totalShares = 1 + extraGuardians.length;

  useEffect(() => {
    if (threshold > totalShares) setThreshold(totalShares);
    if (threshold < 2) setThreshold(2);
  }, [totalShares]);

  const handleGuardianChange = (index: number, value: string) => {
    const newArr = [...extraGuardians];
    newArr[index] = value;
    setExtraGuardians(newArr);
  };

  const addGuardianSlot = () => setExtraGuardians([...extraGuardians, '']);
  const removeGuardianSlot = (index: number) => setExtraGuardians(extraGuardians.filter((_, i) => i !== index));

  const increaseThreshold = () => { if (threshold < totalShares) setThreshold(threshold + 1); };
  const decreaseThreshold = () => { if (threshold > 2) setThreshold(threshold - 1); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = e instanceof FileList ? e : e.target.files;
    if (!files) return;

    const processedFiles: DecryptedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue;
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      processedFiles.push({ name: file.name, type: file.type, size: file.size, data: base64 });
    }
    setSecretFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (index: number) => {
      setSecretFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processVault = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const allEmails = [user.email, ...extraGuardians.filter(e => e.trim() !== '')];
      
      // HYBRID PAYLOAD CONSTRUCTION
      const payload: SecretPayload = {
        type: 'HYBRID',
        text: secretText.length > 0 ? secretText : undefined,
        files: secretFiles.length > 0 ? secretFiles : undefined
      };
      
      setStatus('Encrypting payload...');
      const masterKeyHex = generateMasterKey();
      const encrypted = encryptData(JSON.stringify(payload), masterKeyHex);
      
      const vaultId = Math.random().toString(36).substr(2, 9);
      const vaultData: VaultData = {
        ...encrypted,
        metadata: {
          guardianEmails: allEmails,
          createdAt: Date.now(),
          threshold: threshold,
          totalShares: allEmails.length,
          vaultId: vaultId,
          creatorEmail: user.email,
          name: vaultName || `Vault ${new Date().toLocaleDateString()}`
        }
      };

      storageService.createVault(vaultData);
      
      setStatus('Sharding keys...');
      const shares = splitKey(masterKeyHex, allEmails.length, threshold);
      
      setStatus('Synthesizing Artifacts...');
      const themes = ['Liquid Chrome', 'White Marble', 'Glass Prism', 'Foggy Landscape', 'Silk Fabric'];

      for (let i = 0; i < allEmails.length; i++) {
        const email = allEmails[i];
        const isMe = email === user.email;
        
        setStatus(isMe ? `Creating your Master Artifact...` : `Securing artifact for ${email}...`);
        
        const theme = themes[i % themes.length];
        const artPrompt = await generateArtPrompt(theme);
        const base64Img = await generateCoverImage(artPrompt);
        
        setStatus(`Embedding shard ${i + 1}/${allEmails.length}...`);
        const shareData = `${shares[i].id}:${shares[i].data}`;
        const stegoImg = await embedDataInImage(base64Img, shareData);
        
        if (isMe) {
            setMyImage({
                id: shares[i].id,
                url: stegoImg,
                shareEmbedded: true,
                guardianEmail: email
            });
        } else {
            storageService.storePendingArtifact({
                vaultId: vaultId,
                vaultName: vaultName,
                targetEmail: email,
                shareId: shares[i].id,
                imageData: stegoImg
            });
        }
      }
      setStep(3);
    } catch (e) {
      console.error(e);
      setStatus('Error: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-12 animate-fade-in z-10 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-display font-bold">New Vault</h2>
        <button onClick={onBack} className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
             Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {step === 1 && (
            <>
                {/* LEFT: Configuration */}
                <div className="lg:col-span-8 space-y-8">
                    {/* SECTION 1: IDENTITY */}
                    <div className="premium-card p-8 rounded-[24px]">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">01. Identification</label>
                        <input 
                            type="text" 
                            placeholder="Operation Name..."
                            className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-4xl font-display font-bold text-black focus:border-black outline-none transition-all placeholder:text-gray-200"
                            value={vaultName}
                            onChange={(e) => setVaultName(e.target.value)}
                        />
                    </div>

                    {/* SECTION 2: PAYLOAD (HYBRID) */}
                    <div className="premium-card p-8 rounded-[24px]">
                         <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">02. Secure Payload</label>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Text Area */}
                             <div className="space-y-4">
                                <span className="text-sm font-bold text-black">Message / Key</span>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 h-64 resize-none focus:border-black outline-none transition-all font-mono text-sm leading-relaxed" 
                                    placeholder="Enter sensitive data here..." 
                                    value={secretText} 
                                    onChange={(e) => setSecretText(e.target.value)} 
                                />
                             </div>

                             {/* File Area */}
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-black">Attachments</span>
                                    <span className="text-xs text-gray-400">{secretFiles.length} files</span>
                                </div>
                                
                                <label className="block w-full h-32 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                                    <span className="text-2xl text-gray-300 group-hover:text-black transition-colors">+</span>
                                    <span className="text-xs font-bold text-gray-400 mt-2">Add Files</span>
                                </label>

                                <div className="space-y-2 max-h-28 overflow-y-auto pr-2 custom-scrollbar">
                                    {secretFiles.map((f, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-lg">📄</span>
                                                <span className="text-xs font-bold truncate max-w-[120px]">{f.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500">&times;</button>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* RIGHT: Guardians & Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="premium-card p-8 rounded-[24px] h-full flex flex-col">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">03. Consensus</label>
                        
                        {/* Threshold Control */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                             <p className="text-xs font-bold text-gray-500 mb-2">REQUIRED KEYS</p>
                             <div className="flex items-center justify-center gap-6">
                                <button onClick={decreaseThreshold} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all text-xl font-bold">-</button>
                                <span className="text-5xl font-display font-bold">{threshold}</span>
                                <button onClick={increaseThreshold} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all text-xl font-bold">+</button>
                             </div>
                             <p className="text-xs text-gray-400 mt-2">out of {totalShares} total guardians</p>
                        </div>

                        {/* Guardian List */}
                        <div className="flex-1 space-y-4">
                            <p className="text-xs font-bold text-black border-b border-gray-100 pb-2">TEAM ROSTER</p>
                            
                            <div className="flex items-center gap-3 p-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">ME</div>
                                <span className="text-sm font-mono truncate">{user?.email}</span>
                            </div>

                            {extraGuardians.map((email, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 group">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">0{i+2}</div>
                                    <input 
                                        type="email" 
                                        placeholder="email@domain.com" 
                                        className="flex-1 bg-transparent border-b border-transparent focus:border-black outline-none text-sm font-mono transition-colors"
                                        value={email} 
                                        onChange={(e) => handleGuardianChange(i, e.target.value)} 
                                    />
                                    <button onClick={() => removeGuardianSlot(i)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500">&times;</button>
                                </div>
                            ))}

                            <button onClick={addGuardianSlot} className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-400 hover:border-black hover:text-black transition-all">
                                + ADD GUARDIAN
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <button 
                                onClick={processVault} 
                                disabled={loading} 
                                className="w-full py-5 bg-black text-white rounded-full font-bold tracking-widest hover:scale-105 transition-transform disabled:opacity-50 shadow-xl"
                            >
                                {loading ? 'PROCESSING...' : 'INITIATE'}
                            </button>
                            {loading && <p className="text-center text-xs text-gray-400 mt-4 animate-pulse">{status}</p>}
                        </div>
                    </div>
                </div>
            </>
        )}

        {step === 3 && myImage && (
             <div className="lg:col-span-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                 <div className="premium-card p-12 rounded-[40px] max-w-2xl w-full relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                     
                     <h3 className="text-6xl font-display font-bold mb-4">Secured.</h3>
                     <p className="text-gray-500 font-serif italic text-xl mb-12">The protocol has successfully distributed the shards.</p>

                     <div className="bg-gray-50 p-8 rounded-3xl inline-flex flex-col items-center shadow-inner mb-12">
                         <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-6 relative group">
                             <img src={myImage.url} alt="Master Key" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-white font-bold tracking-widest text-xs">MASTER KEY</span>
                             </div>
                         </div>
                         <a 
                            href={myImage.url} 
                            download={`nyx_master_key_${myImage.id}.png`}
                            className="px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                         >
                            Download My Artifact
                         </a>
                     </div>

                     <div className="flex flex-col gap-2">
                        {extraGuardians.map((email, i) => (
                            <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Artifact dispatched to <strong className="text-black">{email}</strong></span>
                            </div>
                        ))}
                     </div>
                     
                     <button onClick={onBack} className="mt-12 text-sm font-bold border-b border-black pb-1 hover:opacity-50">RETURN TO DASHBOARD</button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default VaultCreate;
