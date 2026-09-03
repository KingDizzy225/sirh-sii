import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React Global Error Boundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm my-6">
                    <div className="max-w-md w-full text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                            <AlertTriangle size={32} />
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900">Un problème est survenu sur ce module</h3>
                            <p className="text-xs text-slate-500">
                                L'application a rencontré une erreur d'affichage inattendue. Votre session reste active et sécurisée.
                            </p>
                        </div>

                        {this.state.error?.message && (
                            <div className="p-3 bg-slate-100 rounded-lg text-left overflow-x-auto text-[11px] font-mono text-slate-700 border border-slate-200 max-h-28">
                                <p className="font-bold text-rose-600">Erreur : {this.state.error.message}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button 
                                onClick={this.handleReset}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2"
                            >
                                <RefreshCw size={14} />
                                Recharger le module
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="border-slate-300 text-xs font-semibold gap-2"
                            >
                                <Home size={14} />
                                Accueil
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
