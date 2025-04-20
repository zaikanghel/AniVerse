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
};

export default function VideoPlayer({ 
  videoUrl, 
  thumbnail, 
  title, 
  isFullscreen, 
  onFullscreenToggle,
  episodeId,
  animeId,
  episodeNumber
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
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (e.key === ' ' || e.key === 'k') {
        setPlaying(prev => !prev);
      } else if (e.key === 'm') {
        setMuted(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        handleRewind();
      } else if (e.key === 'ArrowRight') {
        handleFastForward();
      } else if (e.key === 'f') {
        onFullscreenToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFullscreenToggle]);

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
    if (savedProgress && playerRef.current) {
      console.log('Attempting to resume at position:', savedProgress);
      
      // Ensure player is ready before seeking
      if (playerRef.current.getInternalPlayer()) {
        console.log('Internal player ready, seeking to position');
        playerRef.current.seekTo(savedProgress, 'seconds');
      } else {
        console.log('Internal player not ready, using timeout');
        // If player not ready, use a timeout to try again
        setTimeout(() => {
          console.log('Retrying seek after timeout');
          if (playerRef.current) {
            playerRef.current.seekTo(savedProgress, 'seconds');
          }
        }, 1000);
      }
      
      setPlaying(true);
    } else {
      console.log('No saved progress or player ref available');
    }
    setShowResumePrompt(false);
  };
  
  // Handle starting from beginning (skip saved position)
  const handlePlayFromBeginning = () => {
    setPlaying(true);
    setShowResumePrompt(false);
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
      {/* Resume Prompt Overlay */}
      {showResumePrompt && savedProgress && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-white">Resume Playback</h3>
              <button 
                onClick={() => setShowResumePrompt(false)}
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
          if (savedProgress && !showResumePrompt && playerRef.current) {
            console.log('Auto seeking to saved position on ready:', savedProgress);
            playerRef.current.seekTo(savedProgress, 'seconds');
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
