import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause,
  Maximize2
} from 'lucide-react';
import { Photo } from '../types';

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photos, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoom(1);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoom(1);
  }, [photos.length]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(handleNext, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8"
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <ZoomOut className="w-6 h-6" />
            </button>
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <Download className="w-6 h-6" />
            </button>
            <button className="p-2 text-white/70 hover:text-white transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white transition-colors ml-4"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 p-4 text-white/50 hover:text-white transition-colors z-10 hidden md:block"
        >
          <ChevronLeft className="w-12 h-12" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 p-4 text-white/50 hover:text-white transition-colors z-10 hidden md:block"
        >
          <ChevronRight className="w-12 h-12" />
        </button>

        {/* Photo Container */}
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <img 
            src={currentPhoto.url} 
            alt={currentPhoto.caption || 'Gallery Photo'} 
            className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Caption & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-center">
          <p className="text-white text-lg font-medium max-w-3xl mx-auto">
            {currentPhoto.caption}
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-white/50 text-sm">
            {currentPhoto.photographer && <span>Photographer: {currentPhoto.photographer}</span>}
            {currentPhoto.dateTaken && <span>Date: {currentPhoto.dateTaken}</span>}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
