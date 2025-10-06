"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  GiftIcon,
  FireIcon,
  SparklesIcon,
  ArrowRightIcon,
  BellIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon
} from "@heroicons/react/24/outline";
import { 
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid
} from "@heroicons/react/24/solid";

// Types
interface Announcement {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'feature';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  image?: string;
  icon?: React.ComponentType<any>;
  backgroundColor?: string;
  textColor?: string;
  isDismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: string[];
  isAnimated?: boolean;
  animationType?: 'slide' | 'fade' | 'bounce' | 'pulse' | 'glow';
}

interface AnnouncementBarProps {
  announcements?: Announcement[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showProgress?: boolean;
  maxHeight?: string;
  position?: 'top' | 'bottom';
  theme?: 'light' | 'dark' | 'auto';
}

// Main Component
export default function UltraAnnouncementBar({
  announcements = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showProgress = true,
  maxHeight = '80px',
  position = 'top',
  theme = 'auto'
}: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Default announcements if none provided
  const defaultAnnouncements: Announcement[] = [
    {
      id: '1',
      type: 'promotion',
      title: '🎉 عرض خاص!',
      message: 'احصل على خصم 20% على جميع العقارات الجديدة هذا الأسبوع',
      actionText: 'استفد الآن',
      actionUrl: '/properties?discount=20',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      isDismissible: true,
      autoHide: false,
      priority: 1,
      isAnimated: true,
      animationType: 'pulse'
    },
    {
      id: '2',
      type: 'feature',
      title: '✨ ميزة جديدة!',
      message: 'اكتشف نظام القضايا القانونية المتطور لإدارة جميع شؤونك القانونية',
      actionText: 'جرب الآن',
      actionUrl: '/legal',
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      isDismissible: true,
      autoHide: false,
      priority: 2,
      isAnimated: true,
      animationType: 'glow'
    },
    {
      id: '3',
      type: 'info',
      title: '📢 إعلان مهم',
      message: 'سيتم إجراء صيانة مجدولة للنظام يوم الجمعة من 2:00 ص إلى 4:00 ص',
      actionText: 'اعرف المزيد',
      actionUrl: '/maintenance',
      backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      isDismissible: true,
      autoHide: true,
      autoHideDelay: 10000,
      priority: 3,
      isAnimated: true,
      animationType: 'slide'
    },
    {
      id: '4',
      type: 'success',
      title: '✅ تم بنجاح!',
      message: 'تم تحديث النظام بنجاح. استمتع بالميزات الجديدة!',
      actionText: 'شاهد التحديثات',
      actionUrl: '/updates',
      backgroundColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      textColor: '#ffffff',
      isDismissible: true,
      autoHide: true,
      autoHideDelay: 8000,
      priority: 4,
      isAnimated: true,
      animationType: 'bounce'
    }
  ];

  const activeAnnouncements = announcements.length > 0 ? announcements : defaultAnnouncements;
  const visibleAnnouncements = activeAnnouncements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  const currentAnnouncement = visibleAnnouncements[currentIndex];

  // Effects
  useEffect(() => {
    if (visibleAnnouncements.length === 0) {
      setIsVisible(false);
      return;
    }

    if (currentIndex >= visibleAnnouncements.length) {
      setCurrentIndex(0);
    }
  }, [visibleAnnouncements.length, currentIndex]);

  useEffect(() => {
    if (!isPlaying || !currentAnnouncement || isHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    // Auto-hide if enabled
    if (currentAnnouncement.autoHide && currentAnnouncement.autoHideDelay) {
      const hideTimer = setTimeout(() => {
        handleNext();
      }, currentAnnouncement.autoHideDelay);

      return () => clearTimeout(hideTimer);
    }

    // Auto-play
    intervalRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    // Progress bar
    if (showProgress) {
      setProgress(0);
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (autoPlayInterval / 100);
          return Math.min(100, prev + increment);
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentAnnouncement, isHovered, autoPlayInterval, showProgress]);

  // Handlers
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length);
    setProgress(0);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
    setProgress(0);
  };

  const handleDismiss = (announcementId: string) => {
    setDismissedAnnouncements(prev => [...prev, announcementId]);
    if (currentIndex >= visibleAnnouncements.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleActionClick = () => {
    if (currentAnnouncement?.actionUrl) {
      window.open(currentAnnouncement.actionUrl, '_blank');
    }
  };

  // Render functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return InformationCircleIcon;
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      case 'promotion':
        return GiftIcon;
      case 'feature':
        return SparklesIconSolid;
      default:
        return InformationCircleIcon;
    }
  };

  const getAnimationClass = (animationType?: string) => {
    switch (animationType) {
      case 'slide':
        return 'animate-slide-in';
      case 'fade':
        return 'animate-fade-in';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      case 'glow':
        return 'animate-glow';
      default:
        return '';
    }
  };

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'
      }`}
      style={{ maxHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: currentAnnouncement.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: currentAnnouncement.textColor || '#ffffff'
        }}
      >
        {/* Background Animation */}
        {currentAnnouncement.isAnimated && (
          <div className={`absolute inset-0 opacity-20 ${getAnimationClass(currentAnnouncement.animationType)}`}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative flex items-center justify-between px-4 py-3">
          {/* Left Side - Icon and Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {currentAnnouncement.icon ? (
                <currentAnnouncement.icon className="w-6 h-6" />
              ) : (
                React.createElement(getTypeIcon(currentAnnouncement.type), {
                  className: "w-6 h-6"
                })
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {currentAnnouncement.title}
                </h3>
                {currentAnnouncement.priority === 1 && (
                  <FireIconSolid className="w-4 h-4 text-yellow-300 animate-pulse" />
                )}
              </div>
              <p className="text-xs opacity-90 truncate">
                {currentAnnouncement.message}
              </p>
            </div>
          </div>

          {/* Center - Action Button */}
          {currentAnnouncement.actionText && (
            <div className="flex-shrink-0 mx-4">
              <button
                onClick={handleActionClick}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
              >
                {currentAnnouncement.actionText}
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Right Side - Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation */}
            {visibleAnnouncements.length > 1 && showControls && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevious}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="السابق"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="التالي"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Play/Pause */}
            {showControls && (
              <button
                onClick={handlePlayPause}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mute */}
            {showControls && (
              <button
                onClick={handleMuteToggle}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMuted ? 'تشغيل الصوت' : 'إيقاف الصوت'}
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Dismiss */}
            {currentAnnouncement.isDismissible && (
              <button
                onClick={() => handleDismiss(currentAnnouncement.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="إغلاق"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && isPlaying && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-white/60 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Indicators */}
        {visibleAnnouncements.length > 1 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {visibleAnnouncements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
