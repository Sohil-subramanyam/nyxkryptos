import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { networkService } from '../services/networkService';
import { extractDataFromImage } from '../utils/steganography';

interface Props {
    lobbyId: string;
}

const GuardianPortal: React.FC<Props> = ({ lobbyId }) => {
    const { user, login, isLoading } = useAuth();
    const [status, setStatus] = useState("Waiting for authentication...");
    const [uploaded, setUploaded] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Notify Host when user logs in
    useEffect(() => {
        const connect = async () => {
             if (user && lobbyId && !isConnected) {
                setStatus("Establishing P2P Connection...");
                try {
                    await networkService.connectToLobby(lobbyId, user.email);
                    setIsConnected(true);
                    setStatus("Connected to Host. Waiting for key.");
                } catch (err) {
                    console.error(err);
                    setStatus("Connection Failed. Refresh to try again.");
                }
            }
        };
        connect();
    }, [user, lobbyId, isConnected]);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setStatus("Analyzing Steganography...");
        try {
            const rawPayload = await extractDataFromImage(file);
            if (rawPayload) {
                let id = 0;
                let data = "";

                if (rawPayload.includes(':')) {
                    const parts = rawPayload.split(':');
                    id = parseInt(parts[0]);
                    data = parts[1];
                } else {
                    setStatus("Invalid Key Image Format");
                    return;
                }

                setStatus("Transmitting Secure Share...");
                
                // Send via PeerJS
                try {
                    networkService.sendToHost({
                        type: 'UPLOAD_SHARE',
                        payload: { email: user.email, shareData: data, shareId: id }
                    });
                    setUploaded(true);
                    setStatus("Secure Transmission Complete.");
                } catch (e) {
                    setStatus("Failed to send. Host may be offline.");
                }

            } else {
                setStatus("No hidden data found in this image.");
            }
        } catch (error) {
            setStatus("Error processing image.");
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <h2 className="text-2xl font-bold text-white">Guardian Authentication</h2>
                <p className="text-gray-400 text-center max-w-md">
                    You have been invited to unlock a Nyx Kryptos vault. <br/>
                    Please authenticate to establish a secure uplink.
                </p>
                <button
                    onClick={() => login("guardian" + Math.floor(Math.random() * 1000) + "@example.com", "Guardian")}
                    disabled={isLoading}
                    className="flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 mr-3 text-gray-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    )}
                    Sign in with Google
                </button>
            </div>
        );
    }

    if (uploaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500 animate-pulse-ring">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-green-400">Share Transmitted</h2>
                <p className="text-gray-400">
                    Thank you, {user.username}.<br/>
                    Your cryptographic shard has been securely sent to the Host.<br/>
                    You may close this window.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <img src={user.photoUrl} alt="User" className="w-10 h-10 rounded-full" />
                <div>
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="font-bold text-white">{user.username}</p>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-blue-400">Upload Your Key</h2>
                <div className="flex items-center justify-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                     <p className="text-sm text-gray-500">{isConnected ? "Connected to Host" : "Connecting..."}</p>
                </div>
            </div>

            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all relative ${
                isConnected 
                ? 'border-gray-700 hover:border-blue-500 cursor-pointer' 
                : 'border-gray-800 opacity-50 cursor-not-allowed'
            }`}>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFile}
                    disabled={!isConnected}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg className="mx-auto h-12 w-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <p className="text-lg text-white font-medium">Select Key Image</p>
                <p className="text-sm text-gray-500 mt-2">{status}</p>
            </div>
        </div>
    );
};

export default GuardianPortal;