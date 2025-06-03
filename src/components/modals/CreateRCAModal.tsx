import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRCAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RCAFormData) => void;
}

export interface RCAFormData {
  equipment: string;
  symptoms: string;
  impact: string;
  priority: '1' | '2' | '3' | '4' | '5';
}

const CreateRCAModal: React.FC<CreateRCAModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<RCAFormData>({
    equipment: '',
    symptoms: '',
    impact: '',
    priority: '3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New RCA</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment in Scope
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Production Line 3, CNC Machine K400"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms Experienced
              </label>
              <textarea
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the symptoms or issues observed..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Impact
              </label>
              <textarea
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the current impact on production, quality, etc..."
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as RCAFormData['priority'] })}
              >
                <option value="1">1 - Low Impact</option>
                <option value="2">2 - Minor Impact</option>
                <option value="3">3 - Moderate Impact</option>
                <option value="4">4 - Major Impact</option>
                <option value="5">5 - Critical Impact</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create RCA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRCAModal;