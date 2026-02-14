import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Check } from 'lucide-react';

// ============================================================================
// BACKDATE ENTRY MODAL
// ============================================================================

const SPRING_CONFIG = {
  default: { stiffness: 300, damping: 28, mass: 1 },
  snappy: { stiffness: 340, damping: 26, mass: 0.8 }
};

const BackdateModal = memo(({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Add Entry",
  fields = [],
  type = "weight" // weight, calories, wellness, etc.
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      if (field.min !== undefined && values[field.id] < field.min) {
        newErrors[field.id] = `Must be at least ${field.min}`;
      }
      if (field.max !== undefined && values[field.id] > field.max) {
        newErrors[field.id] = `Must be at most ${field.max}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    onSubmit({ date, ...values });
    
    // Reset
    setValues({});
    setErrors({});
    onClose();
  };

  const handleChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", ...SPRING_CONFIG.default }}
          className="relative w-full max-w-md backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" strokeWidth={2} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  required
                />
              </div>
            </div>

            {/* Dynamic Fields */}
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'number' ? (
                  <input
                    type="number"
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    className={`
                      w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl 
                      text-slate-900 dark:text-white placeholder-slate-400 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                      ${errors[field.id] 
                        ? 'border-red-500 focus:ring-red-500/40' 
                        : 'border-slate-200 dark:border-slate-700'
                      }
                    `}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`
                      w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl 
                      text-slate-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                      ${errors[field.id] 
                        ? 'border-red-500 focus:ring-red-500/40' 
                        : 'border-slate-200 dark:border-slate-700'
                      }
                    `}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={values[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`
                      w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl 
                      text-slate-900 dark:text-white placeholder-slate-400 resize-none
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                      ${errors[field.id] 
                        ? 'border-red-500 focus:ring-red-500/40' 
                        : 'border-slate-200 dark:border-slate-700'
                      }
                    `}
                  />
                )}
                
                {errors[field.id] && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-1"
                  >
                    {errors[field.id]}
                  </motion.p>
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Check className="w-4 h-4" strokeWidth={2} />
                Add Entry
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

BackdateModal.displayName = 'BackdateModal';

export default BackdateModal;
