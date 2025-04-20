import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { 
  Play, Pause, Volume2, VolumeX, Settings, Maximize, 
  Minimize, CaptionsOff, ChevronRight, ChevronLeft,
  RotateCcw, Smartphone, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import screenfull from 'screenfull';
import { saveWatchProgress, getWatchProgress, formatTime, calculatePercentWatched } from '@/lib/watch-progress';

// Define custom interfaces for screen orientation
type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

interface ExtendedScreenOrientation {
  angle: number;
  type: string;
  onchange: ((this: ScreenOrientation, ev: Event) => any) | null;
  lock?: (orientation: OrientationLockType) => Promise<void>;
  unlock?: () => void;
}

type VideoPlayerProps = {
  videoUrl: string;
  thumbnail: string;
  title: string;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  nextEpisodeId?: string;
  onNavigateToNextEpisode?: () => void;
  hasIntro?: boolean;
  introStartTime?: number;
  introEndTime?: number;
};

export default function VideoPlayer({ 
  videoUrl, 
  thumbnail, 
  title, 
  isFullscreen, 
  onFullscreenToggle,
  episodeId,
  animeId,
  episodeNumber,
  nextEpisodeId,
  onNavigateToNextEpisode,
  hasIntro = false,
  introStartTime = 0,
  introEndTime = 90
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isRealFullscreen, setIsRealFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [hasAutoSeeked, setHasAutoSeeked] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(10);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextEpisodeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    };
    setIsMobile(checkMobile());
  }, []);
  
  // Check if there's saved progress when component mounts
  useEffect(() => {
    // Reset auto-seek flag when episode changes
    setHasAutoSeeked(false);
    
    // Only check for saved progress if we have an episode ID
    if (episodeId) {
      const progress = getWatchProgress(episodeId);
      console.log('Retrieved watch progress for episode:', episodeId, progress);
      if (progress && progress.position > 5 && progress.position < progress.duration - 10) {
        setSavedProgress(progress.position);
        setShowResumePrompt(true);
        console.log('Setting saved progress to:', progress.position);
      }
    }
  }, [episodeId]);
  
  // Save watch progress periodically
  useEffect(() => {
    if (playing && duration > 0 && !seeking) {
      // Start interval to save progress every 5 seconds
      progressSaveIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentPosition = playerRef.current.getCurrentTime();
          
          // Save the current watch position
          saveWatchProgress({
            episodeId,
            animeId, 
            title,
            position: currentPosition,
            duration,
            thumbnailUrl: thumbnail,
            episodeNumber
          });
        }
      }, 5000);
    }
    
    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [playing, duration, seeking, episodeId, animeId, title, thumbnail, episodeNumber]);
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear next episode timer if it exists
      if (nextEpisodeTimerRef.current) {
        clearInterval(nextEpisodeTimerRef.current);
      }
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    if (screenfull.isEnabled) {
      const onFullscreenChange = () => {
        setIsRealFullscreen(screenfull.isFullscreen);
        
        // Auto rotate on mobile when entering fullscreen
        if (isMobile && screenfull.isFullscreen && !isRotated) {
          try {
            // Try to lock the screen to landscape orientation
            const screenOrientation = screen.orientation as ExtendedScreenOrientation;
            if (screenOrientation && screenOrientation.lock) {
              screenOrientation.lock('landscape').catch((err: unknown) => {
                console.error('Failed to lock screen orientation:', err);
              });
              setIsRotated(true);
            }
          } catch (err) {
            console.error('Screen orientation API not supported', err);
          }
        }
        
        // Reset rotation when exiting fullscreen
        if (!screenfull.isFullscreen && isRotated) {
          try {
            const screenOrientation = screen.orientation as ExtendedScreenOrientation;
            if (screenOrientation && screenOrientation.unlock) {
              screenOrientation.unlock();
              setIsRotated(false);
            }
          } catch (err: unknown) {
            console.error('Failed to unlock screen orientation:', err);
          }
        }
      };
      
      screenfull.on('change', onFullscreenChange);
      return () => {
        if (screenfull.isEnabled) {
          screenfull.off('change', onFullscreenChange);
        }
      };
    }
  }, [isMobile, isRotated]);

  // Handle control visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (playing) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    // Also handle touch events for mobile
    document.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Play/Pause
      if (e.key === ' ' || e.key === 'k') {
        setPlaying(prev => !prev);
      } 
      // Volume controls
      else if (e.key === 'm') {
        setMuted(prev => !prev);
      } else if (e.key === 'ArrowUp' && !e.shiftKey) {
        setVolume(prev => Math.min(prev + 0.1, 1));
        setMuted(false);
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        setVolume(prev => Math.max(prev - 0.1, 0));
        if (volume <= 0.1) setMuted(true);
      } 
      // Skip backward/forward
      else if (e.key === 'ArrowLeft') {
        if (e.shiftKey) {
          // Shift + Left Arrow: skip back 30 seconds
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(Math.max(currentTime - 30, 0));
          }
        } else {
          handleRewind(); // Regular rewind (10s)
        }
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
          // Shift + Right Arrow: skip forward 30 seconds
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(Math.min(currentTime + 30, duration));
          }
        } else {
          handleFastForward(); // Regular fast forward (10s)
        }
      } 
      // Fullscreen toggle
      else if (e.key === 'f') {
        onFullscreenToggle();
      } 
      // Skip intro (if in intro period and has intro defined)
      else if (e.key === 's') {
        if (hasIntro && showSkipIntro) {
          handleSkipIntro();
        }
      }
      // Next episode shortcut (if available)
      else if (e.key === 'n') {
        if (nextEpisodeId && onNavigateToNextEpisode) {
          handleNextEpisode();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFullscreenToggle, volume, hasIntro, showSkipIntro, nextEpisodeId, onNavigateToNextEpisode, duration]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setMuted(value[0] === 0);
  };

  const handleVolumeToggle = () => {
    setMuted(!muted);
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      
      // Check if we're near the end to show next episode prompt
      if (nextEpisodeId && onNavigateToNextEpisode && duration > 0) {
        const timeRemaining = duration - state.playedSeconds;
        if (timeRemaining <= 30 && !showNextEpisode) {
          // Show next episode prompt with 10 second countdown
          setShowNextEpisode(true);
          setNextEpisodeCountdown(10);
          
          // Start countdown timer for next episode
          if (nextEpisodeTimerRef.current) {
            clearInterval(nextEpisodeTimerRef.current);
          }
          
          nextEpisodeTimerRef.current = setInterval(() => {
            setNextEpisodeCountdown(prev => {
              if (prev <= 1) {
                // Time's up, move to next episode
                if (nextEpisodeTimerRef.current) {
                  clearInterval(nextEpisodeTimerRef.current);
                }
                if (onNavigateToNextEpisode) {
                  onNavigateToNextEpisode();
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
      
      // Check if we're in the intro period to show skip intro button
      if (hasIntro && introStartTime !== undefined && introEndTime !== undefined) {
        const currentSeconds = state.playedSeconds;
        if (currentSeconds >= introStartTime && currentSeconds <= introEndTime) {
          if (!showSkipIntro) {
            setShowSkipIntro(true);
          }
        } else {
          if (showSkipIntro) {
            setShowSkipIntro(false);
          }
        }
      }
    }
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleRewind = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(currentTime - 10, 0));
    }
  };

  const handleFastForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.min(currentTime + 10, duration));
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const currentTime = duration * played;
  const remainingTime = duration - currentTime;

  // Handle real fullscreen toggle
  const handleRealFullscreenToggle = () => {
    if (screenfull.isEnabled) {
      if (isRealFullscreen) {
        screenfull.exit();
      } else if (containerRef.current) {
        screenfull.request(containerRef.current);
      }
    } else {
      // Fallback to app's fullscreen mode if browser API is not available
      onFullscreenToggle();
    }
  };

  // Handle rotation toggle for mobile devices
  const handleRotationToggle = () => {
    if (isMobile) {
      if (isRotated) {
        const screenOrientation = screen.orientation as ExtendedScreenOrientation;
        if (screenOrientation && screenOrientation.unlock) {
          screenOrientation.unlock();
          setIsRotated(false);
        }
      } else {
        const screenOrientation = screen.orientation as ExtendedScreenOrientation;
        if (screenOrientation && screenOrientation.lock) {
          screenOrientation.lock('landscape').catch((err: unknown) => {
            console.error('Failed to lock screen orientation:', err);
          });
          setIsRotated(true);
        }
      }
    }
  };
  
  // Handle resuming playback from saved position
  const handleResumePlayback = () => {
    // Set hasAutoSeeked to true to prevent onReady auto-seeking
    setHasAutoSeeked(true);
    
    if (savedProgress && playerRef.current) {
      console.log('Attempting to resume at position:', savedProgress);
      
      // First make sure we dismiss the resume prompt
      setShowResumePrompt(false);
      
      // Then set playing to true so video starts playing immediately
      setPlaying(true);
      
      // Ensure player is ready before seeking
      if (playerRef.current.getInternalPlayer()) {
        console.log('Internal player ready, seeking to position');
        
        // Use setTimeout to ensure seeking happens after player is fully initialized
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.seekTo(savedProgress, 'seconds');
            console.log('Seeking complete, video should now be playing');
          }
        }, 100);
      } else {
        console.log('Internal player not ready, using timeout');
        // If player not ready, use a longer timeout to try again
        setTimeout(() => {
          console.log('Retrying seek after timeout');
          if (playerRef.current) {
            playerRef.current.seekTo(savedProgress, 'seconds');
            console.log('Delayed seeking complete, video should now be playing');
          }
        }, 1000);
      }
    } else {
      console.log('No saved progress or player ref available');
      setShowResumePrompt(false);
      setPlaying(true);
    }
  };
  
  // Handle starting from beginning (skip saved position)
  const handlePlayFromBeginning = () => {
    // Set hasAutoSeeked to true to prevent onReady auto-seeking
    setHasAutoSeeked(true);
    
    // First hide the resume prompt
    setShowResumePrompt(false);
    
    // Seek to the beginning
    if (playerRef.current) {
      playerRef.current.seekTo(0, 'seconds');
    }
    
    // Start playing after a small delay to ensure player is initialized
    setTimeout(() => {
      setPlaying(true);
      console.log('Starting playback from beginning');
    }, 100);
  };
  
  // Handle skipping intro
  const handleSkipIntro = () => {
    if (playerRef.current && introEndTime) {
      // Skip to the end of the intro
      playerRef.current.seekTo(introEndTime, 'seconds');
      console.log('Skipped intro to:', introEndTime);
      setShowSkipIntro(false);
    }
  };
  
  // Handle navigating to next episode
  const handleNextEpisode = () => {
    // Clear the next episode timer if it exists
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
    }
    
    // Hide the next episode prompt
    setShowNextEpisode(false);
    
    // Call the navigation callback provided by the parent component
    if (onNavigateToNextEpisode) {
      console.log('Navigating to next episode');
      onNavigateToNextEpisode();
    }
  };
  
  // Handle canceling next episode autoplay
  const handleCancelNextEpisode = () => {
    // Clear the timer and hide the prompt
    if (nextEpisodeTimerRef.current) {
      clearInterval(nextEpisodeTimerRef.current);
      nextEpisodeTimerRef.current = null;
    }
    setShowNextEpisode(false);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "video-container relative", 
        { 
          "h-full": isFullscreen,
          "fixed inset-0 z-50 bg-black": isRealFullscreen 
        }
      )}
    >
      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button
          onClick={handleSkipIntro}
          className="absolute top-24 right-4 z-20 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Skip Intro</span>
        </button>
      )}
      
      {/* Next Episode Overlay */}
      {showNextEpisode && nextEpisodeId && onNavigateToNextEpisode && (
        <div className="absolute bottom-24 right-4 z-20 bg-black bg-opacity-80 text-white p-3 rounded-md shadow-lg max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Next Episode</h4>
            <button 
              onClick={handleCancelNextEpisode}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-300">Playing in {nextEpisodeCountdown}s</div>
            <button
              onClick={handleNextEpisode}
              className="bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1 rounded-md transition-colors"
            >
              Play Now
            </button>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-accent h-1 rounded-full transition-all duration-1000"
              style={{ width: `${(1 - nextEpisodeCountdown / 10) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Resume Prompt Overlay */}
      {showResumePrompt && savedProgress && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-white">Resume Playback</h3>
              <button 
                onClick={() => {
                  setShowResumePrompt(false);
                  setHasAutoSeeked(true); // Prevent auto-seeking after closing
                  setPlaying(true); // Start playing from current position
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              {`You were watching this episode at ${formatTime(savedProgress)}. Would you like to resume where you left off?`}
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePlayFromBeginning}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Start from Beginning
              </button>
              <button
                onClick={handleResumePlayback}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onReady={() => {
          console.log('ReactPlayer is ready');
          
          // Only auto-seek if we have saved progress, aren't showing the resume prompt, 
          // haven't already seeked, and have a valid player ref
          if (savedProgress && !showResumePrompt && !hasAutoSeeked && playerRef.current) {
            console.log('Auto seeking to saved position on ready:', savedProgress);
            
            // Mark that we've performed the auto-seek to prevent multiple seeks
            setHasAutoSeeked(true);
            
            // Use a small timeout to ensure the player is fully ready
            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.seekTo(savedProgress, 'seconds');
                console.log('Auto-seeking complete');
                // Ensure video plays after seeking if it should be playing
                if (playing) {
                  console.log('Ensuring video is playing after auto-seek');
                  setPlaying(true);
                }
              }
            }, 200);
          }
        }}
        style={{ backgroundColor: '#000' }}
        light={!playing ? thumbnail : false}
        playIcon={
          <div className="play-button-overlay w-16 h-16 bg-secondary bg-opacity-80 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8 text-white" />
          </div>
        }
      />
      
      <div 
        className={cn(
          "video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300",
          { "opacity-0": !showControls && playing, "opacity-100": showControls || !playing }
        )}
      >
        {/* Progress bar */}
        <div 
          className="video-progress mb-2 cursor-pointer rounded overflow-hidden h-1 bg-gray-700"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            setPlayed(percent);
            playerRef.current?.seekTo(percent);
          }}
        >
          <div 
            className="video-progress-filled bg-accent h-full"
            style={{ width: `${played * 100}%` }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="text-white hover:text-secondary transition duration-200"
              onClick={handlePlayPause}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            
            <button 
              className="text-white hover:text-secondary transition duration-200"
              onClick={handleRewind}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button 
              className="text-white hover:text-secondary transition duration-200"
              onClick={handleFastForward}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <div className="flex items-center group relative">
              <button 
                className="text-white hover:text-secondary transition duration-200 mr-2"
                onClick={handleVolumeToggle}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              
              <div className="w-16 hidden group-hover:block">
                <Slider
                  value={[muted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="h-1"
                />
              </div>
            </div>
            
            <span className="text-sm text-white hidden sm:inline-block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button 
                className="text-white hover:text-secondary transition duration-200"
                onClick={handleRotationToggle}
              >
                <Smartphone className={`h-5 w-5 ${isRotated ? 'rotate-90' : ''}`} />
              </button>
            )}
            
            <button className="text-white hover:text-secondary transition duration-200 hidden sm:block">
              <CaptionsOff className="h-5 w-5" />
            </button>
            
            <button className="text-white hover:text-secondary transition duration-200 hidden sm:block">
              <Settings className="h-5 w-5" />
            </button>
            
            <button 
              className="text-white hover:text-secondary transition duration-200"
              onClick={handleRealFullscreenToggle}
            >
              {isRealFullscreen || isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
