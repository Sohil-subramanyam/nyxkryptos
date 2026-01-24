export interface VaultData {
  iv: string;
  ciphertext: string;
  hmac: string; 
  metadata: {
    guardianEmails: string[]; // List of all participants (Creator + Guardians)
    createdAt: number;
    threshold: number;
    totalShares: number;
    vaultId: string; // Unique ID
    creatorEmail: string;
    name: string;
  };
}

export interface StoredShare {
  vaultId: string;
  shareId: number;
  shareData: string;
  uploaderEmail: string;
  uploadedAt: number;
}

// New: For holding images until the specific user logs in
export interface PendingArtifact {
  id: string; // unique ID
  vaultId: string;
  vaultName: string;
  targetEmail: string;
  shareId: number;
  imageData: string; // Base64 Stego Image
  createdAt: number;
  retrieved: boolean;
}

export interface GeneratedImage {
  id: number;
  url: string; 
  shareEmbedded: boolean;
  guardianEmail?: string;
}

export enum AppMode {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
}

export interface DecryptedFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64
}

export type SecretType = 'TEXT' | 'FILES' | 'HYBRID';

export interface SecretPayload {
  type: SecretType;
  text?: string;
  files?: DecryptedFile[];
}
