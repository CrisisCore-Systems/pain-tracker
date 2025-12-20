import React from 'react';
import { GoalManager } from './GoalManager';
import { Modal } from '../../design-system';

interface GoalManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalManagerModal: React.FC<GoalManagerModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <GoalManager onClose={onClose} />
    </Modal>
  );
};
