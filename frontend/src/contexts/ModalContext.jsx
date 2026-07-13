import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'alert', // 'alert' | 'confirm'
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (message, title = 'Notification') => {
    return new Promise((resolve) => {
      setModalConfig({
        title,
        message,
        type: 'alert',
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: null,
      });
      setIsOpen(true);
    });
  };

  const showConfirm = (message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setModalConfig({
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        },
      });
      setIsOpen(true);
    });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                modalConfig.type === 'confirm' 
                  ? 'bg-brand-primary/10 text-brand-primary' 
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                {modalConfig.type === 'confirm' ? <HelpCircle size={22} /> : <AlertCircle size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-heading font-extrabold text-white leading-normal m-0">
                  {modalConfig.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap font-medium">
                  {modalConfig.message}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                }}
                className={`px-4.5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow ${
                  modalConfig.type === 'confirm'
                    ? 'bg-brand-primary hover:bg-brand-primary/95 shadow-brand-primary/10'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                }`}
              >
                {modalConfig.type === 'confirm' ? 'Yes, Proceed' : 'Okay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
