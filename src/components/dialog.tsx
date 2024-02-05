import React, { useState } from 'react';

// Define the props interface
interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

// Define the ConfirmationDialog component
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        zIndex: 100,
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <p>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        <button onClick={onConfirm} style={{ marginRight: '10px' }}>
          Confirm
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
