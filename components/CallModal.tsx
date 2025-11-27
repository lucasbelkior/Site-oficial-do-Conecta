
import React from 'react';
import type { User } from '../types';
import { UserIcon, PhoneIcon } from './Icons';

interface CallModalProps {
    currentUser: User;
    targetUser: User;
    callType: 'audio' | 'video';
    onHangUp: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ currentUser, targetUser, callType, onHangUp }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
            <div className="text-center mb-8">
                <p className="text-slate-300">Chamada de {callType === 'audio' ? 'áudio' : 'vídeo'} com</p>
                <h1 className="text-4xl font-bold text-white">{targetUser.name}</h1>
            </div>

            <div className="relative flex items-center justify-center w-full max-w-md mb-12">
                 <div className="relative flex flex-col items-center text-center -mr-10 z-10">
                    <div className="h-32 w-32 rounded-full bg-purple-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                        <UserIcon className="h-20 w-20 text-white" />
                    </div>
                    <p className="mt-2 font-semibold text-white">{currentUser.name}</p>
                 </div>
                 <div className="relative flex flex-col items-center text-center -ml-10">
                    <div className="h-40 w-40 rounded-full bg-slate-600 flex items-center justify-center border-4 border-slate-700 shadow-lg">
                        <UserIcon className="h-24 w-24 text-white" />
                    </div>
                    <p className="mt-2 font-semibold text-white">{targetUser.name}</p>
                 </div>
            </div>
            
             <div className="text-center mb-12">
                <p className="text-lg text-slate-400 animate-pulse">Chamando...</p>
            </div>


            <button
                onClick={onHangUp}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                aria-label="Desligar chamada"
            >
                <PhoneIcon className="h-8 w-8 transform -rotate-135" />
            </button>
        </div>
    );
};
