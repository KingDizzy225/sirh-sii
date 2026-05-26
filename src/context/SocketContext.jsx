import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // En développement on tape sur le port 3000, en prod on tape sur l'URL de base
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling']
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connecté au serveur WebSocket', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('Déconnecté du serveur WebSocket');
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}
