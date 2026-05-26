import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './button';
import { X, Check } from 'lucide-react';

export function SignaturePad({ onSign, onCancel }) {
    const sigCanvas = useRef({});

    const clear = () => sigCanvas.current.clear();
    
    const save = () => {
        if (sigCanvas.current.isEmpty()) {
            alert('Veuillez dessiner votre signature avant de valider.');
            return;
        }
        const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        onSign(signatureData);
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 relative">
                <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="blue"
                    canvasProps={{ className: 'signature-canvas w-full h-48 rounded-lg cursor-crosshair' }}
                />
                <div className="absolute top-2 right-2 text-xs text-slate-400 select-none pointer-events-none">
                    Signez ici
                </div>
            </div>
            
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={clear}>
                    Effacer
                </Button>
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel}>
                        Annuler
                    </Button>
                )}
                <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Check size={16} />
                    Valider la Signature
                </Button>
            </div>
        </div>
    );
}
