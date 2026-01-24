import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { extractDataFromImage } from '../utils/steganography';
import { reconstructKey, decryptData } from '../utils/crypto';
import { VaultData, StoredShare, SecretPayload, PendingArtifact } from '../types';

interface Props {
    onCreateNew: () => void;
}

const Dashboard: React.FC<Props> = ({ onCreateNew }) => {
    const { user, logout } = useAuth();
    const [vaults, setVaults] = useState<VaultData[]>([]);
    const [pendingArtifacts, setPendingArtifacts] = useState<PendingArtifact[]>([]);
    const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);
    const [vaultShares, setVaultShares] = useState<StoredShare[]>([]);
    const [revealedSecret, setRevealedSecret] = useState<SecretPayload | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        if (user) refreshData();
    }, [user]);

    const refreshData = () => {
        if(!user) return;
        setVaults(storageService.getVaultsForUser(user.email));
        setPendingArtifacts(storageService.getPendingArtifacts(user.email));
    };

    const handleDownloadArtifact = (artifact: PendingArtifact) => {
        const a = document.createElement('a');
        a.href = artifact.imageData;
        a.download = `nyx_artifact_${artifact.shareId}.png`;
        a.click();
        storageService.markArtifactRetrieved(artifact.id);
        refreshData();
    };

    const handleSelectVault = (vault: VaultData) => {
        setSelectedVault(vault);
        setRevealedSecret(null);
        setUploadStatus('');
        
        const shares = storageService.getSharesForVault(vault.metadata.vaultId);
        setVaultShares(shares);

        const myShare = shares.find(s => s.uploaderEmail === user?.email);
        if (myShare) setUploadStatus('Share Uploaded');

        if (shares.length >= vault.metadata.threshold) {
            attemptUnlock(vault, shares);
        }
    };

    const attemptUnlock = (vault: VaultData, shares: StoredShare[]) => {
        try {
            const formattedShares = shares.map(s => ({ id: s.shareId, data: s.shareData }));
            const subset = formattedShares.slice(0, vault.metadata.threshold);
            const key = reconstructKey(subset);
            
            if (key) {
                const decrypted = decryptData(vault, key);
                if (decrypted) setRevealedSecret(JSON.parse(decrypted));
            }
        } catch (e) { console.error(e); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedVault || !user) return;

        setUploadStatus("Processing...");
        try {
            const raw = await extractDataFromImage(file);
            if (raw && raw.includes(':')) {
                const [idStr, data] = raw.split(':');
                const id = parseInt(idStr);
                
                storageService.uploadShare({
                    vaultId: selectedVault.metadata.vaultId,
                    shareId: id,
                    shareData: data,
                    uploaderEmail: user.email,
                    uploadedAt: Date.now()
                });
                setUploadStatus("Uploaded Successfully");
                handleSelectVault(selectedVault);
            } else {
                setUploadStatus("Invalid Image");
            }
        } catch (err) { setUploadStatus("Error reading file"); }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-black p-6 md:p-12 animate-fade-in relative z-10">
            {/* Header */}
            <header className="flex justify-between items-end mb-16 max-w-7xl mx-auto border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-6xl font-display font-bold tracking-tighter mb-2">Dashboard</h1>
                    <p className="text-gray-400 font-serif italic">Welcome back, {user?.username}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={onCreateNew} className="px-8 py-4 bg-black text-white rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform shadow-xl">
                        + NEW VAULT
                    </button>
                    <button onClick={logout} className="text-sm font-bold hover:opacity-50 transition-opacity px-4">
                        SIGN OUT
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-16">
                
                {/* Section 1: Secure Inbox */}
                {pendingArtifacts.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                             <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Secure Inbox</h3>
                             <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {pendingArtifacts.map(artifact => (
                                <div key={artifact.id} className="premium-card p-8 rounded-[24px] flex flex-col justify-between h-72 relative overflow-hidden group transition-transform hover:-translate-y-1">
                                    {/* Abstract Decor */}
                                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-gray-100 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest rounded-full">INBOUND</span>
                                            <span className="text-2xl opacity-20">❖</span>
                                        </div>
                                        <h4 className="text-3xl font-display font-bold leading-none mb-2">{artifact.vaultName}</h4>
                                        <p className="text-gray-400 text-sm font-serif italic">Encrypted Artifact for {user?.username}</p>
                                    </div>

                                    <button 
                                        onClick={() => handleDownloadArtifact(artifact)}
                                        className="w-full py-4 border border-gray-200 rounded-xl font-bold text-sm hover:bg-black hover:text-white hover:border-black transition-all z-10 bg-white/50 backdrop-blur-sm"
                                    >
                                        Accept & Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section 2: Vaults Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar List */}
                    <div className="lg:col-span-4 space-y-8">
                         <div className="flex items-center gap-4 mb-4">
                             <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Operations</h3>
                         </div>
                         
                         <div className="space-y-4">
                            {vaults.map(v => {
                                const shares = storageService.getSharesForVault(v.metadata.vaultId);
                                const isSelected = selectedVault?.metadata.vaultId === v.metadata.vaultId;
                                const isComplete = shares.length >= v.metadata.threshold;

                                return (
                                    <div 
                                        key={v.metadata.vaultId}
                                        onClick={() => handleSelectVault(v)}
                                        className={`group p-6 rounded-[20px] cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-black text-white shadow-2xl scale-105 border-black' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-xl">{v.metadata.name}</h4>
                                            {isComplete && <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-400' : 'bg-green-500'}`}></span>}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs font-mono opacity-60">
                                            <span>ID: {v.metadata.vaultId.toUpperCase()}</span>
                                            <span>•</span>
                                            <span>{new Date(v.metadata.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="mt-6 flex items-center gap-2">
                                            <div className="flex-1 h-0.5 bg-gray-500/20 overflow-hidden">
                                                <div className="h-full bg-current transition-all duration-1000" style={{ width: `${(shares.length / v.metadata.threshold) * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold">{shares.length}/{v.metadata.threshold}</span>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>

                    {/* Main Details Area */}
                    <div className="lg:col-span-8">
                        {selectedVault ? (
                            <div className="premium-card p-10 rounded-[32px] min-h-[600px] flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-400"></div>

                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h2 className="text-5xl font-display font-bold mb-2">{selectedVault.metadata.name}</h2>
                                        <p className="text-gray-400 font-serif italic">
                                            Initiated by {selectedVault.metadata.creatorEmail === user?.email ? 'You' : selectedVault.metadata.creatorEmail}
                                        </p>
                                    </div>
                                    <div className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest border ${revealedSecret ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>
                                        {revealedSecret ? 'DECRYPTED' : 'LOCKED'}
                                    </div>
                                </div>

                                {revealedSecret ? (
                                    <div className="flex-1 animate-fade-in flex flex-col gap-8">
                                        {/* Payload Display */}
                                        <div className="bg-gray-50/50 rounded-[24px] p-8 border border-gray-100 flex-1">
                                            <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-gray-400">Classified Data</h3>
                                            
                                            {/* Text Content */}
                                            {revealedSecret.text && (
                                                <div className="mb-8 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 border-l-2 border-black pl-4">
                                                    {revealedSecret.text}
                                                </div>
                                            )}

                                            {/* File Content */}
                                            {revealedSecret.files && revealedSecret.files.length > 0 && (
                                                <div className="space-y-4">
                                                    <p className="text-xs font-bold text-gray-900">ATTACHMENTS</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {revealedSecret.files.map((f, i) => (
                                                            <a key={i} href={f.data} download={f.name} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-black transition-all group">
                                                                <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-bold truncate">{f.name}</p>
                                                                    <p className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col justify-between">
                                        {/* Status Grid */}
                                        <div>
                                            <h3 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-gray-400">Consensus Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedVault.metadata.guardianEmails.map(email => {
                                                    const hasUploaded = vaultShares.some(s => s.uploaderEmail === email);
                                                    return (
                                                        <div key={email} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${hasUploaded ? 'border-green-200 bg-green-50/50' : 'border-gray-100 bg-white'}`}>
                                                            <div className={`w-3 h-3 rounded-full ${hasUploaded ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-200'}`}></div>
                                                            <span className={`text-sm ${hasUploaded ? 'font-bold text-black' : 'text-gray-400'}`}>{email}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Upload Section */}
                                        <div className="border-t border-gray-100 pt-8 mt-8">
                                            <h3 className="font-display font-bold text-xl mb-4">Upload Artifact</h3>
                                            {uploadStatus === 'Share Uploaded' ? (
                                                <div className="w-full py-8 bg-black text-white rounded-[20px] text-center font-bold tracking-widest flex flex-col items-center justify-center gap-2">
                                                    <span className="text-2xl">✓</span>
                                                    <span>ARTIFACT VERIFIED</span>
                                                </div>
                                            ) : (
                                                <label className="block w-full py-12 border border-dashed border-gray-300 rounded-[20px] text-center hover:bg-gray-50 transition-all cursor-pointer group relative overflow-hidden">
                                                    <input type="file" onChange={handleImageUpload} className="hidden" />
                                                    <div className="relative z-10">
                                                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                                            <svg className="w-6 h-6 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                        </div>
                                                        <span className="font-bold text-gray-800">Drop Key Image Here</span>
                                                        <p className="text-xs text-gray-400 mt-2">{uploadStatus || 'Steganographic Analysis Required'}</p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 p-12 border border-dashed border-gray-200 rounded-[32px] bg-white/50">
                                <span className="text-6xl mb-6 opacity-20">❖</span>
                                <p className="font-serif italic text-lg">Select an operation to view details</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;