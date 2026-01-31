'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    email: string;
    username: string;
    photoUrl: string; // Generated avatar based on name
}

interface AuthContextType {
    user: User | null;
    login: (email: string, username: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, username: string) => {
        setIsLoading(true);
        // Simulate API handshake
        await new Promise(r => setTimeout(r, 800));
        
        const newUser: User = {
            email: email,
            username: username,
            // Generate a deterministic avatar color/style based on username
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`
        };
        
        setUser(newUser);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
