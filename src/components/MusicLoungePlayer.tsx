import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Music,
  Headphones,
  Search,
  Sparkles,
  ShieldCheck,
  Disc,
  Radio,
  Flame,
  Zap,
} from 'lucide-react';
import { bgMusicEngine, MUSIC_TRACKS, TrackInfo, MusicCategory } from '../utils/audioMusic';

export const MusicLoungePlayer: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const scrubberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = bgMusicEngine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const isPlaying = bgMusicEngine.getIsPlaying();
  const currentTrack = bgMusicEngine.getCurrentTrack();
  const volume = bgMusicEngine.getVolume();
  const isMuted = bgMusicEngine.getIsMuted();
  const currentTime = bgMusicEngine.getCurrentTime();
  const duration = bgMusicEngine.getDuration() || 180;
  const isLooping = bgMusicEngine.getIsLooping();
  const isShuffled = bgMusicEngine.getIsShuffled();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    bgMusicEngine.seek(pos * duration);
  };

  const filteredTracks = MUSIC_TRACKS.filter((t) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Country' && t.category === 'Country') ||
      (selectedCategory === 'Rap' && t.category === 'Rap') ||
      (selectedCategory === 'Pop' && t.category === 'Pop') ||
      (selectedCategory === 'Polar' && t.category === 'Polar');

    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    All: MUSIC_TRACKS.length,
    Country: MUSIC_TRACKS.filter((t) => t.category === 'Country').length,
    Rap: MUSIC_TRACKS.filter((t) => t.category === 'Rap').length,
    Pop: MUSIC_TRACKS.filter((t) => t.category === 'Pop').length,
    Polar: MUSIC_TRACKS.filter((t) => t.category === 'Polar').length,
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none rounded-2xl border border-slate-800">
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-amber-950/70 border-b border-slate-800 p-4 sm:p-6 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white shrink-0">
              <Disc className={`w-7 h-7 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Penguin Beats: Music Lounge
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Non-Copyrighted
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Background Play
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Massive royalty-free jukebox featuring Country, Rap, and Pop hits. Plays in background even in other tabs on Chromebook!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold flex items-center gap-2 shadow-sm">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <span>{MUSIC_TRACKS.length} Tracks Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Deck Section */}
      <div className="p-4 sm:p-6 bg-slate-900/40 border-b border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Vinyl & Visualizer Artwork */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative group">
              {/* Outer Glow */}
              <div
                className={`absolute -inset-2 rounded-full blur-xl transition-all duration-700 ${
                  isPlaying ? 'bg-cyan-500/25 opacity-100' : 'bg-transparent opacity-0'
                }`}
              />

              {/* Vinyl Turntable */}
              <div
                className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              >
                {/* Grooves */}
                <div className="absolute inset-4 rounded-full border border-slate-800/80" />
                <div className="absolute inset-8 rounded-full border border-slate-800/60" />
                <div className="absolute inset-12 rounded-full border border-slate-800/40" />

                {/* Center Label */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-cyan-500 p-1 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-xl sm:text-2xl">{currentTrack.icon}</span>
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate max-w-[65px]">
                      {currentTrack.category || 'Arcade'}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Now Playing Details & Transport Controls */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
            {/* Song Meta */}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {currentTrack.category || 'Arcade'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {currentTrack.bpm} BPM
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentTrack.genre}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 truncate">
                <span>{currentTrack.title}</span>
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-5 shrink-0">
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '70%', animationDelay: '0ms' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '40%', animationDelay: '300ms' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '85%', animationDelay: '450ms' }} />
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {currentTrack.description}
              </p>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="space-y-1">
              <div
                ref={scrubberRef}
                onClick={handleScrubberClick}
                className="w-full h-2.5 bg-slate-800 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all group"
                title="Click to seek"
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Buttons & Volume */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                {/* Shuffle */}
                <button
                  type="button"
                  onClick={() => bgMusicEngine.toggleShuffle()}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isShuffled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title={isShuffled ? 'Shuffle is ON' : 'Shuffle is OFF'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Prev */}
                <button
                  type="button"
                  onClick={() => bgMusicEngine.prevTrack()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Big Play / Pause */}
                <button
                  type="button"
                  onClick={() => bgMusicEngine.togglePlay()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>PLAY</span>
                    </>
                  )}
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={() => bgMusicEngine.nextTrack()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Loop */}
                <button
                  type="button"
                  onClick={() => bgMusicEngine.toggleLoop()}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isLooping
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title={isLooping ? 'Loop Single Track is ON' : 'Repeat Album'}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5 w-full sm:w-48 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl">
                <button
                  type="button"
                  onClick={() => bgMusicEngine.toggleMute()}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (isMuted) bgMusicEngine.toggleMute();
                    bgMusicEngine.setVolume(parseFloat(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-slate-400 min-w-[28px] text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="p-4 sm:px-6 pb-2 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['All', 'Country', 'Rap', 'Pop', 'Polar'] as MusicCategory[]).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat === 'Country' && '🛻'}
                  {cat === 'Rap' && '🎤'}
                  {cat === 'Pop' && '✨'}
                  {cat === 'Polar' && '🐧'}
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {categoryCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[180px] sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracks or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Tracks Grid / List */}
      <div className="p-4 sm:p-6 flex-1 space-y-2">
        {filteredTracks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No tracks found matching &quot;{searchQuery}&quot;. Try a different search.
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isThisTrack = currentTrack.id === track.id;
            const isThisPlaying = isThisTrack && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isThisTrack) {
                    bgMusicEngine.togglePlay();
                  } else {
                    bgMusicEngine.setTrack(track.id);
                    if (!isPlaying) bgMusicEngine.play();
                  }
                }}
                className={`group p-3 sm:px-4 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isThisTrack
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Track Index & Play State */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-black transition-all ${
                      isThisPlaying
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : isThisTrack
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : isThisTrack ? (
                      <Play className="w-4 h-4 fill-current" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <span className="text-xl shrink-0">{track.icon}</span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-extrabold truncate ${
                          isThisTrack ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                        }`}
                      >
                        {track.title}
                      </h4>
                      {isThisPlaying && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 animate-pulse">
                          PLAYING
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {track.genre} • {track.description}
                    </p>
                  </div>
                </div>

                {/* Right: Category badge, BPM & Length */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {track.category || 'Arcade'}
                  </span>
                  <span className="hidden md:inline-block text-[11px] font-mono text-slate-400">
                    {track.bpm} BPM
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {formatTime(track.duration || 180)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
