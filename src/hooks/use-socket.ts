import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSocket(namespace: string) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(`${SOCKET_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log(`Connected to socket namespace: ${namespace}`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log(`Disconnected from socket namespace: ${namespace}`);
    });

    socket.on('authenticated', (data) => {
      console.log(`Authenticated with socket namespace: ${namespace}`, data);
    });

    return () => {
      socket.disconnect();
    };
  }, [namespace]);

  return { socket: socketRef.current, isConnected };
}
