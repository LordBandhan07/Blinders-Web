'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ALL_EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
    '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️',
    '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
    '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
    '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇',
    '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '🔥', '💧', '💨', '⭐', '🌟', '✨', '⚡', '☄️',
];

export default function EmojiPicker({ onEmojiSelect, onClose, position }: EmojiPickerProps) {
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => onClose();
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-50 bg-[#0a0a0a] border border-[#FFC107] rounded-2xl shadow-2xl"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -100%)',
                    padding: '12px',
                }}
            >
                {!showAll ? (
                    // Quick emojis
                    <div className="flex items-center gap-2">
                        {QUICK_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    onEmojiSelect(emoji);
                                    onClose();
                                }}
                                className="text-2xl hover:scale-125 transition-transform"
                                style={{ padding: '6px' }}
                            >
                                {emoji}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-xs text-[#FFC107] hover:text-[#FFD54F] font-semibold border border-[#FFC107] rounded-lg"
                            style={{ padding: '6px 10px' }}
                        >
                            More
                        </button>
                    </div>
                ) : (
                    // All emojis
                    <div className="relative">
                        <div
                            className="grid grid-cols-6 gap-1 overflow-y-auto"
                            style={{ maxHeight: '200px', maxWidth: '280px', padding: '8px' }}
                        >
                            {ALL_EMOJIS.map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onEmojiSelect(emoji);
                                        onClose();
                                    }}
                                    className="text-xl hover:scale-125 transition-transform"
                                    style={{ padding: '4px' }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAll(false)}
                            className="absolute top-2 right-2 text-[#FFC107] hover:text-[#FFD54F]"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
