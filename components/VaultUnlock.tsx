import React, { useState, useEffect } from 'react';
import { reconstructKey, decryptData } from '../utils/crypto';
import { extractDataFromImage } from '../utils/steganography';
import { VaultData, SecretPayload } from '../types';
import { networkService } from '../services/networkService';
import { useAuth } from '../context/AuthContext';

interface Props {
  onBack: () => void;
}

const VaultUnlock: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  
  const [stage, setStage] = useState<'SELECTION' | 'LOBBY'>('SELECTION');
  const [role, setRole] = useState<'HOST' | 'GUEST'>('GUEST');
  
  const [lobbyCode, setLobbyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [peers, setPeers] = useState<{id: string, name: string, hasUploaded: boolean}[]>([]);
  const [shares, setShares] = useState<{id: number, data: string}[]>([]);
  const [myUploaded, setMyUploaded] = useState(false);
  const [broadcastedSecret, setBroadcastedSecret] = useState<SecretPayload | null>(null);
  
  const [selectedVault, setSelectedVault] = useState<(VaultData & {id: number, name: string}) | null>(null);
  const [myVaults, setMyVaults] = useState<(VaultData & {id: number, name: string})[]>([]);

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
        const stored = localStorage.getItem(`vaults_${user.email}`);
        if (stored) {
            setMyVaults(JSON.parse(stored));
        }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = networkService.subscribe((msg) => {
        if (msg.type === 'JOIN') {
            setPeers(prev => [...prev, { id: msg.senderId, name: msg.payload.username, hasUploaded: false }]);
        }
        if (msg.type === 'UPLOAD_SHARE') {
            setPeers(prev => prev.map(p => p.id === msg.senderId ? { ...p, hasUploaded: true } : p));
            if (role === 'HOST') {
                const { shareId, shareData } = msg.payload;
                addShare(shareId, shareData);
            }
        }
        if (msg.type === 'SECRET_REVEALED') {
            setBroadcastedSecret(msg.payload);
            setStatus("SECRET UNLOCKED");
        }
    });
    return () => {
        unsubscribe();
        networkService.disconnect();
    }
  }, [role]);

  useEffect(() => {
    if (role === 'HOST' && selectedVault && shares.length >= selectedVault.metadata!.threshold) {
        attemptReconstruction();
    }
  }, [shares, role, selectedVault]);

  const addShare = (id: number, data: string) => {
    setShares(prev => {
        if (prev.find(s => s.id === id)) return prev;
        return [...prev, { id, data }];
    });
  };

  const startLobby = async () => {
      if (!selectedVault) return;
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setStatus('Initializing Lobby...');
      try {
          await networkService.initializeHost(code);
          setLobbyCode(code);
          setRole('HOST');
          setStage('LOBBY');
          setPeers([{ id: 'HOST', name: `${user?.username} (Host)`, hasUploaded: false }]);
      } catch (err) {
          setError("Failed to create lobby. Try again.");
      }
  };

  const joinLobby = async () => {
      if (inputCode.length !== 4) return;
      setStatus('Connecting...');
      try {
          await networkService.connectToLobby(inputCode, user);
          setLobbyCode(inputCode);
          setRole('GUEST');
          setStage('LOBBY');
      } catch (err) {
          setError("Lobby not found or connection failed.");
          setStatus('');
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setStatus("Analyzing Steganography...");
      try {
          const raw = await extractDataFromImage(file);
          if (raw && raw.includes(':')) {
              const [idStr, data] = raw.split(':');
              const id = parseInt(idStr);
              
              if (role === 'HOST') {
                  addShare(id, data);
                  setPeers(prev => prev.map(p => p.id === 'HOST' ? { ...p, hasUploaded: true } : p));
              } else {
                  networkService.sendToHost({
                      type: 'UPLOAD_SHARE',
                      payload: { shareId: id, shareData: data }
                  });
              }
              setMyUploaded(true);
              setStatus("Key Accepted. Waiting for consensus.");
          } else {
              setError("Invalid Key Image.");
          }
      } catch (err) {
          setError("Error reading image.");
      }
  };

  const attemptReconstruction = () => {
      if (!selectedVault) return;
      setStatus("Threshold Met. Decrypting...");
      setTimeout(() => {
          try {
              const key = reconstructKey(shares.slice(0, selectedVault.metadata!.threshold));
              if (key) {
                  const decrypted = decryptData(selectedVault, key);
                  if (decrypted) {
                      const payload = JSON.parse(decrypted);
                      networkService.broadcast({
                          type: 'SECRET_REVEALED',
                          payload: payload
                      });
                      setBroadcastedSecret(payload);
                  }
              }
          } catch (e) {
              setError("Decryption Failed.");
          }
      }, 1000);
  };

  if (stage === 'SELECTION') {
      return (
          <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in z-10">
              <div className="flex items-center mb-8 gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h2 className="text-2xl font-display font-bold text-white">Lobby Access</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-10 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                           <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Host Lobby</h3>
                      <p className="text-gray-400 text-sm mb-8 relative z-10 h-10">Initiate a secure session for one of your existing vaults.</p>
                      
                      {myVaults.length === 0 ? (
                          <div className="p-4 bg-white/5 rounded-xl text-sm text-gray-400 text-center border border-white/5">No vaults found</div>
                      ) : (
                          <div className="space-y-2 mb-8 max-h-48 overflow-y-auto pr-2 relative z-10">
                              {myVaults.map(v => (
                                  <div 
                                    key={v.id} 
                                    onClick={() => setSelectedVault(v)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedVault?.id === v.id ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'}`}
                                  >
                                      <p className="font-bold text-sm">{v.name}</p>
                                      <div className="flex justify-between mt-1 text-xs opacity-70">
                                          <span>{new Date(v.metadata!.createdAt).toLocaleDateString()}</span>
                                          <span>{v.metadata!.threshold}/{v.metadata!.totalShares} Keys</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                      
                      <button 
                        onClick={startLobby}
                        disabled={!selectedVault}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold relative z-10 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                          Create Lobby
                      </button>
                  </div>

                  <div className="glass-card p-10 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                           <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Join Lobby</h3>
                      <p className="text-gray-400 text-sm mb-8 relative z-10 h-10">Enter the 4-digit secure code provided by the host.</p>
                      
                      <div className="mb-8 relative z-10">
                        <input 
                            type="text"
                            maxLength={4}
                            placeholder="0000"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            className="w-full text-center text-5xl font-mono tracking-[0.5em] bg-black/40 border border-white/10 rounded-2xl p-6 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-gray-800 text-white"
                        />
                      </div>
                      
                      <button 
                        onClick={joinLobby}
                        disabled={inputCode.length !== 4}
                        className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold relative z-10 hover:bg-white hover:text-black transition-all disabled:opacity-50"
                      >
                          Connect
                      </button>
                      {error && <p className="text-red-400 text-center mt-4 text-sm relative z-10 bg-red-900/20 p-2 rounded-lg border border-red-500/20">{error}</p>}
                  </div>
              </div>
          </div>
      );
  }

  return (
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 animate-fade-in z-10">
          <div className="glass-card rounded-3xl min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg border border-blue-500/30 font-mono font-bold tracking-widest text-lg">
                            {lobbyCode}
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Lobby Status</p>
                            <p className="text-sm font-medium text-white">{status || 'Waiting for Keys...'}</p>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">ABORT</button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row">
                    <div className="w-full md:w-80 border-r border-white/5 bg-black/20 p-6 flex flex-col">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Guardians Active</h3>
                        <div className="space-y-3 overflow-y-auto flex-1">
                            {peers.map((p, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${p.hasUploaded ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${p.hasUploaded ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{p.name}</p>
                                            <p className="text-[10px] text-gray-500">{p.id === 'HOST' ? 'Lobby Host' : 'Guardian'}</p>
                                        </div>
                                    </div>
                                    {p.hasUploaded && <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-10 flex flex-col items-center justify-center relative bg-gradient-to-br from-transparent to-white/5">
                        {broadcastedSecret ? (
                            <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center animate-fade-in shadow-2xl">
                                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                                </div>
                                <h2 className="text-3xl font-display font-bold text-white mb-2">Access Granted</h2>
                                <p className="text-gray-400 mb-8 text-sm">The threshold has been met. The vault is open.</p>
                                
                                <div className="bg-black/60 rounded-2xl p-6 text-left border border-white/10 max-h-96 overflow-y-auto custom-scrollbar">
                                    {broadcastedSecret.type === 'TEXT' ? (
                                        <p className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{broadcastedSecret.text}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {broadcastedSecret.files?.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">📄</span>
                                                        <span className="text-sm font-medium text-white">{f.name}</span>
                                                    </div>
                                                    <a href={f.data} download={f.name} className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-gray-200">Download</a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center w-full max-w-md">
                                <label className={`block relative border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer group ${myUploaded ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                        disabled={myUploaded}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    
                                    {myUploaded ? (
                                        <div>
                                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Encrypted Share Sent</h3>
                                            <p className="text-gray-500 text-sm mt-2">Standing by for consensus...</p>
                                        </div>
                                    ) : (
                                        <div className="group-hover:translate-y-[-2px] transition-transform">
                                            <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-6 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                                                <svg className="w-6 h-6 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Upload Key</h3>
                                            <p className="text-gray-500 text-sm mt-2">Drop your generated art here.</p>
                                        </div>
                                    )}
                                </label>
                                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
                                <p className="mt-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                                    Zero Knowledge Architecture Active
                                </p>
                            </div>
                        )}
                    </div>
                </div>
          </div>
      </div>
  );
};

export default VaultUnlock;