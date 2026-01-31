/**
 * REAL-TIME P2P NETWORK SERVICE (WebRTC via PeerJS)
 */

// Declare global PeerJS object from the script tag
declare const Peer: any;

export type MessageType = 'JOIN' | 'UPLOAD_SHARE' | 'SECRET_REVEALED' | 'ERROR';

export interface NetworkMessage {
    type: MessageType;
    payload: any;
}

class NetworkService {
    private peer: any = null;
    private connections: Map<string, any> = new Map(); 
    private listeners: ((msg: NetworkMessage & { senderId: string }) => void)[] = [];
    public hostId: string | null = null;

    constructor() {
        // Singleton
    }

    public subscribe(callback: (msg: NetworkMessage & { senderId: string }) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(msg: NetworkMessage, senderId: string) {
        this.listeners.forEach(l => l({ ...msg, senderId }));
    }

    /**
     * Initialize as HOST with a specific 4-digit code
     */
    public async initializeHost(code: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const id = `NYX-${code}`; // Namespace the ID
            
            this.peer = new Peer(id, { debug: 1 });

            this.peer.on('open', (id: string) => {
                console.log('HOST: Lobby Created:', id);
                this.hostId = id;
                resolve(code);
            });

            this.peer.on('connection', (conn: any) => {
                this.handleIncomingConnection(conn);
            });

            this.peer.on('error', (err: any) => {
                console.error('PeerJS Error:', err);
                if (err.type === 'unavailable-id') {
                    reject(new Error("Lobby Code already in use. Try another."));
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Connect as GUEST
     */
    public async connectToLobby(code: string, user: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const guestId = 'G-' + Math.random().toString(36).substr(2, 5);
            this.peer = new Peer(guestId);

            this.peer.on('open', () => {
                const conn = this.peer.connect(`NYX-${code}`, { reliable: true });

                conn.on('open', () => {
                    this.connections.set('HOST', conn);
                    
                    // Send Identity
                    this.sendToHost({
                        type: 'JOIN',
                        payload: { email: user.email, username: user.username }
                    });
                    
                    // Listen for Broadcasts (like Secret Revealed)
                    conn.on('data', (data: any) => {
                        this.notifyListeners(data as NetworkMessage, 'HOST');
                    });

                    resolve();
                });

                conn.on('error', (err: any) => {
                    reject(err);
                });
                
                // If connection fails immediately
                setTimeout(() => {
                    if (!conn.open) reject(new Error("Lobby not found or timed out"));
                }, 5000);
            });

            this.peer.on('error', (err: any) => {
                reject(err);
            });
        });
    }

    private handleIncomingConnection(conn: any) {
        conn.on('open', () => {
            this.connections.set(conn.peer, conn);
        });

        conn.on('data', (data: any) => {
            this.notifyListeners(data as NetworkMessage, conn.peer);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
        });
    }

    public sendToHost(msg: NetworkMessage) {
        const conn = this.connections.get('HOST');
        if (conn && conn.open) {
            conn.send(msg);
        }
    }

    public broadcast(msg: NetworkMessage) {
        this.connections.forEach(conn => {
            if (conn.open) conn.send(msg);
        });
    }
    
    public disconnect() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connections.clear();
        this.listeners = [];
        this.hostId = null;
    }
}

export const networkService = new NetworkService();
