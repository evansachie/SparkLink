import React from 'react';
import { motion } from 'framer-motion';
import { MdPages, MdAdd } from 'react-icons/md';
import Button from '../common/Button';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  count: number;
  maxCount: number | string;
  onCreateClick: () => void;
  canCreate: boolean;
  userSubscription: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  count,
  maxCount,
  onCreateClick,
  canCreate,
  userSubscription
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MdPages size={32} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">
              {subtitle} ({count}/{maxCount === Infinity ? '∞' : maxCount} used)
            </p>
          </div>
        </div>
        
        <Button
          onClick={onCreateClick}
          disabled={!canCreate}
          className="sm:w-auto w-full flex items-center justify-center gap-2 px-4"
        >
          <MdAdd size={20} />
          Create Page
        </Button>
      </div>

      {!canCreate && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm">
            You've reached the page limit for your {userSubscription} plan. 
            <a href="/dashboard/subscription" className="font-medium underline ml-1">
              Upgrade to create more pages
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
};
