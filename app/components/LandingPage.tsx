import React from 'react';

interface Props {
  onGetStarted: () => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="snap-container bg-[#fcfcfc] text-black">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full p-8 md:p-12 flex justify-between items-center z-50">
             <div className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                NYX
             </div>
             <button 
                onClick={onGetStarted} 
                className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 transition-opacity"
             >
                Enter System
             </button>
        </nav>

        {/* Section 1: Hero */}
        <section className="snap-section">
            <div className="text-center max-w-6xl px-6 relative z-10 flex flex-col items-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-8 animate-fade-in">Decentralized Custody Protocol</p>
                <h1 className="text-6xl md:text-[10rem] font-bold font-display tracking-tighter leading-[0.9] mb-12 text-balance">
                    TRUSTLESS<br/>SECURITY
                </h1>
                
                <div className="w-full h-px bg-gray-200 max-w-xs mx-auto mb-12"></div>
                
                <p className="text-xl text-gray-500 font-serif italic max-w-2xl mx-auto mb-16">
                    "Divide your secrets into digital artifacts. <br/>
                    Distribute them to the ones you trust."
                </p>
                
                <button 
                    onClick={onGetStarted}
                    className="px-12 py-5 bg-black text-white rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-transform"
                >
                    INITIALIZE VAULT
                </button>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-[100px] -z-10 animate-float"></div>
        </section>

        {/* Section 2: Visual Explanation */}
        <section className="snap-section bg-white relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                 <span className="text-[20vw] font-display font-bold">ARTIFACT</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl px-6 gap-24 items-center z-10">
                 <div>
                     <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden group">
                         <img 
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                            alt="Abstract Artifact"
                         />
                         <div className="absolute bottom-8 left-8 text-white mix-blend-difference">
                             <p className="font-mono text-xs">FIG 01.</p>
                             <p className="font-display font-bold text-2xl">High Fidelity Encryption</p>
                         </div>
                     </div>
                 </div>
                 <div className="space-y-8">
                     <h2 className="text-5xl font-display font-bold leading-tight">Hidden in <br/>Plain Sight.</h2>
                     <p className="text-gray-500 text-lg leading-relaxed font-serif">
                         Traditional security uses database passwords. We use Steganography. 
                         Your cryptographic shards are embedded within the pixels of unique, AI-generated art pieces.
                     </p>
                     <ul className="space-y-4 pt-4 border-t border-gray-100">
                         <li className="flex items-center gap-4 text-sm font-bold">
                             <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                             AES-256 Encryption
                         </li>
                         <li className="flex items-center gap-4 text-sm font-bold">
                             <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                             Shamir's Secret Sharing
                         </li>
                         <li className="flex items-center gap-4 text-sm font-bold">
                             <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                             Generative Art Carriers
                         </li>
                     </ul>
                 </div>
            </div>
        </section>
    </div>
  );
};
export default LandingPage;