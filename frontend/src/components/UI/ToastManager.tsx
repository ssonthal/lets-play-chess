import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Socket } from 'socket.io-client';

enum ToastType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Info = 'info'
}

interface Toast {
    id: number,
    message: string,
    type: ToastType,
    title: string,
    duration: number
}

const ToastItem = ({ toast, onRemove }: { toast: Toast, onRemove: (id: number) => void }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        // Trigger animation
        const timer = setTimeout(() => setIsVisible(true), 10);

        // Auto remove after duration
        if (toast.duration > 0) {
            timeoutRef.current = setTimeout(() => {
                handleRemove();
            }, toast.duration);
        }

        return () => {
            clearTimeout(timer);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleRemove = () => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case ToastType.Success:
                return <CheckCircle className="w-5 h-5 text-white" />;
            case ToastType.Warning:
                return <AlertTriangle className="w-5 h-5 text-white" />;
            case ToastType.Info:
                return <Info className="w-5 h-5 text-white" />;
            default:
                return <AlertCircle className="w-5 h-5 text-white" />;
        }
    };

    const getBackgroundStyle = () => {
        switch (toast.type) {
            case ToastType.Success:
                return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
            case ToastType.Warning:
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
            case ToastType.Info:
                return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
            default:
                return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
        }
    };

    return (
        <div
            className={`transform transition-all duration-300 ease-in-out ${isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
                }`}
        >
            <div
                className={`${getBackgroundStyle()} rounded-xl shadow-xl backdrop-blur-sm p-4 mb-3 max-w-md min-w-80 border border-white/20`}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                        <div className="bg-white/20 rounded-full p-1">
                            {getIcon()}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        {toast.title && (
                            <h4 className="text-sm font-bold text-white mb-1 drop-shadow-sm">
                                {toast.title}
                            </h4>
                        )}
                        <p className="text-sm text-white/90 drop-shadow-sm">
                            {toast.message}
                        </p>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="ml-3 flex-shrink-0 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={removeToast}
                />
            ))}
        </div>
    );
};

export const ToastManager = ({ socket }: { socket: Socket }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType, title: string, duration: number = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, title, duration } as Toast;
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    useEffect(() => {
        if (!socket) return;

        const handleServerError = (errorData: string) => {
            // Handle different error formats
            let message = 'An error occurred';
            let title = 'Error';

            if (typeof errorData === 'string') {
                message = errorData;
            }
            addToast(message, ToastType.Error, title);
        };

        const handleSuccess = (data: string) => {
            addToast(data || 'Operation successful', ToastType.Success, 'Success');
        };

        const handleInfo = (data: string) => {
            addToast(data || 'Information', ToastType.Info, 'Info');
        };

        // Listen for various socket events
        socket.on('error', handleServerError);
        socket.on('success', handleSuccess);
        socket.on('info', handleInfo);

        return () => {
            socket.off('error', handleServerError);
            socket.off('success', handleSuccess);
            socket.off('info', handleInfo);
        };
    }, [socket]);

    return <ToastContainer toasts={toasts} removeToast={removeToast} />;
};