import React from 'react';
import { MdPages, MdAdd } from 'react-icons/md';
import Button from '../common/Button';

interface EmptyPagesStateProps {
  onCreateClick: () => void;
}

export const EmptyPagesState: React.FC<EmptyPagesStateProps> = ({
  onCreateClick
}) => {
  return (
    <div className="text-center py-12">
      <MdPages size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No pages yet</h3>
      <p className="text-gray-600 mb-6">
        Create your first page to start building your portfolio
      </p>
      <Button onClick={onCreateClick} className="flex items-center gap-2 mx-auto">
        <MdAdd size={20} />
        Create Your First Page
      </Button>
    </div>
  );
};
