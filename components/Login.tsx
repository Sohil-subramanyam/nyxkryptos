import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
    onBack?: () => void;
}

const Login: React.FC<Props> = ({ onBack }) => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && username) {
            login(email, username);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 z-20 relative">
            <div className="premium-card p-8 md:p-12 rounded-[32px] max-w-md w-full animate-fade-in relative overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
                {onBack && (
                    <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-black transition-colors font-bold text-sm uppercase tracking-wider">
                        &larr; Back
                    </button>
                )}
                
                <div className="text-center mb-12 mt-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-6 shadow-xl">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-4xl font-bold font-display tracking-tighter text-black mb-2">Identify</h2>
                    <p className="text-gray-500 font-serif italic">Enter your credentials to access the node.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Callsign</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Neo"
                            className="w-full bg-transparent border-b-2 border-gray-200 p-3 text-2xl font-bold text-black focus:border-black outline-none transition-all placeholder:text-gray-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Uplink Address</label>
                        <input 
                            type="email" 
                            required
                            placeholder="neo@matrix.com"
                            className="w-full bg-transparent border-b-2 border-gray-200 p-3 text-2xl font-bold text-black focus:border-black outline-none transition-all placeholder:text-gray-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 mt-6 bg-black text-white rounded-full font-bold tracking-widest hover:scale-105 transition-transform disabled:opacity-70 disabled:scale-100 shadow-xl"
                    >
                        {isLoading ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;