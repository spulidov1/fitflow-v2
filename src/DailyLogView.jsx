import React, { useState, useEffect, memo, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Lock, Globe, Heart, MessageCircle, 
  Calendar, Trash2, ChevronDown, X, Check, AlertCircle
} from 'lucide-react';
import { formatDate } from './utils/helpers';

// ============================================================================
// CONSTANTS
// ============================================================================

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

// Subtle mood options (no cheap emojis)
const MOOD_OPTIONS = [
  { id: 'peaceful', label: 'Peaceful', color: 'from-blue-500 to-cyan-600' },
  { id: 'energized', label: 'Energized', color: 'from-orange-500 to-yellow-600' },
  { id: 'content', label: 'Content', color: 'from-green-500 to-emerald-600' },
  { id: 'reflective', label: 'Reflective', color: 'from-purple-500 to-indigo-600' },
  { id: 'tired', label: 'Tired', color: 'from-slate-500 to-slate-600' },
  { id: 'stressed', label: 'Stressed', color: 'from-red-500 to-pink-600' },
];

// ============================================================================
// MOOD SELECTOR - Subtle, elegant
// ============================================================================

const MoodSelector = memo(({ selectedMood, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 dark:bg-black/40 border border-slate-200/20 dark:border-slate-700/30 hover:bg-white/12 dark:hover:bg-black/50 transition-colors"
      >
        {selectedMood ? (
          <>
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${MOOD_OPTIONS.find(m => m.id === selectedMood)?.color}`} />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {MOOD_OPTIONS.find(m => m.id === selectedMood)?.label}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            How are you feeling? (optional)
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{spring : { stiffness: 500, damping: 30 }, ...subtle}}
            className="absolute top-full mt-2 left-0 right-0 backdrop-blur-xl bg-white/95 dark:bg-black/90 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-2 z-10"
          >
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  onSelect(mood.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${mood.color}`} />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {mood.label}
                </span>
                {selectedMood === mood.id && (
                  <Check className="w-4 h-4 text-indigo-500 ml-auto" strokeWidth={2} />
                )}
              </button>
            ))}
            
            {selectedMood && (
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left border-t border-slate-200 dark:border-slate-700 mt-2 pt-2"
              >
                <X className="w-3 h-3 text-slate-400" strokeWidth={2} />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Clear mood
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MoodSelector.displayName = 'MoodSelector';

// ============================================================================
// PRIVACY TOGGLE - Lock/Globe
// ============================================================================

const PrivacyToggle = memo(({ isPublic, onChange }) => {
  return (
    <button
      onClick={() => onChange(!isPublic)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 dark:bg-black/40 border border-slate-200/20 dark:border-slate-700/30 hover:bg-white/12 dark:hover:bg-black/50 transition-colors"
    >
      {isPublic ? (
        <>
          <Globe className="w-4 h-4 text-green-500" strokeWidth={2} />
          <span className="text-sm text-slate-700 dark:text-slate-300">Public</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 text-slate-500" strokeWidth={2} />
          <span className="text-sm text-slate-700 dark:text-slate-300">Private</span>
        </>
      )}
    </button>
  );
});

PrivacyToggle.displayName = 'PrivacyToggle';

// ============================================================================
// AI ENCOURAGEMENT - Observational, never pushy
// ============================================================================

const AIEncouragement = memo(({ entry, onDismiss }) => {
  const encouragements = [
    "You're building a meaningful practice of self-reflection.",
    "It's good to check in with yourself like this.",
    "Your consistency in journaling is worth noting.",
    "Taking time to reflect shows real self-awareness.",
  ];

  const [message] = useState(() => {
    // Simple logic - can be enhanced with actual AI
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", ...SPRING_CONFIG.gentle }}
      className="backdrop-blur-xl bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
});

AIEncouragement.displayName = 'AIEncouragement';

// ============================================================================
// JOURNAL ENTRY CARD - Timeline item
// ============================================================================

const JournalEntryCard = memo(({ entry, onDelete, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);
  const mood = MOOD_OPTIONS.find(m => m.id === entry.mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", ...SPRING_CONFIG.default }}
      className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6 hover:bg-white/12 dark:hover:bg-black/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-500" strokeWidth={2} />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(entry.date)}
          </span>
          
          {mood && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-black/30">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mood.color}`} />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {mood.label}
              </span>
            </div>
          )}

          {entry.isPublic && (
            <Globe className="w-4 h-4 text-green-500" strokeWidth={2} />
          )}
        </div>

        <button
          onClick={() => onDelete(entry.id)}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
          aria-label="Delete entry"
        >
          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
        {entry.content}
      </p>

      {/* Reactions (if public) */}
      {entry.isPublic && (
        <div className="flex items-center gap-2">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/30 hover:bg-white/20 dark:hover:bg-black/40 transition-colors"
          >
            <Heart className="w-4 h-4 text-slate-500" strokeWidth={2} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {entry.reactions || 0}
            </span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/30 hover:bg-white/20 dark:hover:bg-black/40 transition-colors">
            <MessageCircle className="w-4 h-4 text-slate-500" strokeWidth={2} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {entry.comments || 0}
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
});

JournalEntryCard.displayName = 'JournalEntryCard';

// ============================================================================
// DAILY LOG VIEW - Main Component
// ============================================================================

const DailyLogView = ({ 
  user, 
  moodEntries = [], 
  setMoodEntries,
  showToast,
  setConfirmDialog,
  darkMode 
}) => {
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [journalText]);

  const handleSubmit = async () => {
    if (!journalText.trim()) return;

    setIsSubmitting(true);

    try {
      // TODO: Save to database via your service
      const newEntry = {
        id: Date.now(),
        user_id: user.id,
        content: journalText,
        mood: selectedMood,
        isPublic: isPublic,
        date: new Date().toISOString(),
        reactions: 0,
        comments: 0
      };

      setMoodEntries([newEntry, ...moodEntries]);
      
      // Show AI encouragement
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 8000);

      // Reset form
      setJournalText('');
      setSelectedMood(null);
      setIsPublic(false);

      showToast('Journal entry saved', 'success');
    } catch (error) {
      console.error('Error saving entry:', error);
      showToast('Failed to save entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this journal entry?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        setMoodEntries(moodEntries.filter(e => e.id !== id));
        showToast('Entry deleted', 'success');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Daily Log
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          A space for reflection, without judgment
        </p>
      </motion.div>

      {/* Journal Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6 shadow-xl"
      >
        <div className="space-y-4">
          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What's on your mind?
            </label>
            <textarea
              ref={textareaRef}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Start writing... This is your space."
              className="w-full min-h-[120px] px-4 py-3 bg-white/50 dark:bg-black/30 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              style={{ maxHeight: '400px', overflow: 'auto' }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />
              <PrivacyToggle isPublic={isPublic} onChange={setIsPublic} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!journalText.trim() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>

          {/* Privacy notice */}
          {isPublic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30"
            >
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Public entries can be seen by your family members. They can react and leave supportive comments.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* AI Encouragement */}
      <AnimatePresence>
        {showEncouragement && (
          <AIEncouragement 
            entry={moodEntries[0]}
            onDismiss={() => setShowEncouragement(false)}
          />
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Journey
        </h2>

        {moodEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-500 dark:text-slate-400">
              No entries yet. Start by writing your first reflection above.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {moodEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onReact={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogView;
