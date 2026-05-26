import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationToaster() {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (data) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, ...data }]);

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 5000);
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    const dismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
            <AnimatePresence>
                {notifications.map(notif => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-xl rounded-md p-4 w-80 flex items-start justify-between gap-3 relative"
                    >
                        <Bell className="text-blue-500 shrink-0 h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                {notif.type === 'LEAVE_REQUEST' ? 'Nouveau Congé' : 'Mise à jour Congé'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                                {notif.message}
                            </p>
                        </div>
                        <button onClick={() => dismiss(notif.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
