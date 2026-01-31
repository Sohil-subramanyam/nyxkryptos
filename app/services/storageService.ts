import { VaultData, StoredShare, PendingArtifact } from '@/types';

const KEYS = {
    VAULTS: 'nyx_db_vaults',
    SHARES: 'nyx_db_shares',
    ARTIFACTS: 'nyx_db_artifacts'
};

export const storageService = {
    // --- VAULTS ---
    createVault: (vault: VaultData) => {
        const vaults = JSON.parse(localStorage.getItem(KEYS.VAULTS) || '[]');
        vaults.push(vault);
        localStorage.setItem(KEYS.VAULTS, JSON.stringify(vaults));
    },

    getVaultsForUser: (email: string): VaultData[] => {
        const vaults = JSON.parse(localStorage.getItem(KEYS.VAULTS) || '[]');
        // User sees vault if they are creator OR they are in guardian list
        return vaults.filter((v: VaultData) => v.metadata.guardianEmails.includes(email));
    },

    // --- ARTIFACT DELIVERY SYSTEM ---
    storePendingArtifact: (artifact: Omit<PendingArtifact, 'id' | 'createdAt' | 'retrieved'>) => {
        const artifacts = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]');
        const newArtifact: PendingArtifact = {
            ...artifact,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
            retrieved: false
        };
        artifacts.push(newArtifact);
        localStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(artifacts));
    },

    getPendingArtifacts: (email: string): PendingArtifact[] => {
        const artifacts = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]');
        return artifacts.filter((a: PendingArtifact) => a.targetEmail === email && !a.retrieved);
    },

    markArtifactRetrieved: (id: string) => {
        const artifacts = JSON.parse(localStorage.getItem(KEYS.ARTIFACTS) || '[]');
        const updated = artifacts.map((a: PendingArtifact) => a.id === id ? { ...a, retrieved: true } : a);
        localStorage.setItem(KEYS.ARTIFACTS, JSON.stringify(updated));
    },

    // --- RECONSTRUCTION SHARES ---
    uploadShare: (share: StoredShare) => {
        const shares = JSON.parse(localStorage.getItem(KEYS.SHARES) || '[]');
        const exists = shares.find((s: StoredShare) => s.vaultId === share.vaultId && s.uploaderEmail === share.uploaderEmail);
        if (!exists) {
            shares.push(share);
            localStorage.setItem(KEYS.SHARES, JSON.stringify(shares));
        }
    },

    getSharesForVault: (vaultId: string): StoredShare[] => {
        const shares = JSON.parse(localStorage.getItem(KEYS.SHARES) || '[]');
        return shares.filter((s: StoredShare) => s.vaultId === vaultId);
    }
};
