// Background Music Engine for GameLand Penguin
// Powered by HTML5 Audio with native AAC/M4A streaming and ChromeOS MediaSession integration.

export type MusicCategory = 'All' | 'Country' | 'Rap' | 'Pop' | 'Polar';

export interface TrackInfo {
  id: string;
  title: string;
  genre: string;
  category: 'Country' | 'Rap' | 'Pop' | 'Polar';
  bpm: number;
  description: string;
  icon: string;
  audioUrl: string;
  fallbackUrl: string;
  duration?: number;
  isVip?: boolean;
  vipLevel?: 'Gold' | 'Platinum' | 'Diamond';
}

/**
 * Resolves an audio path so it works seamlessly on local dev, production servers,
 * and GitHub Pages subpaths (e.g. /GamelandPenguin/music/...).
 */
export const resolveAudioUrl = (relativePath: string): string => {
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanSub = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return cleanBase + cleanSub;
};

export const MUSIC_TRACKS: TrackInfo[] = [
  // --- COUNTRY TRACKS (7) ---
  {
    id: 'country-dust-on-tailgate',
    title: 'Dust on the Tailgate',
    genre: 'Modern Country Rock',
    category: 'Country',
    bpm: 115,
    description: 'Energetic electric slide guitar, heavy acoustic strumming, and warm southern driving rhythms.',
    icon: '🛻',
    audioUrl: '/music/country/dust_on_the_tailgate.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Dust%20on%20the%20Tailgate.m4a',
    duration: 180,
  },
  {
    id: 'country-midnight-campfire',
    title: 'Midnight Campfire Drift',
    genre: 'Acoustic Country Folk',
    category: 'Country',
    bpm: 85,
    description: 'Acoustic fingerpicked guitar, rustic banjo, and warm pedal steel swells by the campfire.',
    icon: '🔥',
    audioUrl: '/music/country/midnight_campfire_drift.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Midnight%20Campfire%20Drift.m4a',
    duration: 180,
  },
  {
    id: 'country-two-lane-freedom',
    title: 'Two-Lane Freedom',
    genre: 'Outlaw Southern Stomp',
    category: 'Country',
    bpm: 128,
    description: 'Gritty southern rock country, stomping kick drum, crunchy telecaster riffs, and highway chase spirit.',
    icon: '🛣️',
    audioUrl: '/music/country/two_lane_freedom.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Two-Lane%20Freedom.m4a',
    duration: 180,
  },
  {
    id: 'country-prairie-sunset',
    title: 'Prairie Sunset Glow',
    genre: 'Indie Country Ballad',
    category: 'Country',
    bpm: 92,
    description: 'Slow sweet country melody, acoustic 12-string guitar, soft fiddle harmony, and golden-hour vibes.',
    icon: '🌅',
    audioUrl: '/music/country/prairie_sunset_glow.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Prairie%20Sunset%20Glow.m4a',
    duration: 180,
  },
  {
    id: 'country-neon-honky-tonk',
    title: 'Neon Honky-Tonk Shuffle',
    genre: 'Classic 90s Country',
    category: 'Country',
    bpm: 130,
    description: 'Twangy telecaster guitar, walking upright bass, saloon piano rolls, and feel-good country rhythm.',
    icon: '🍻',
    audioUrl: '/music/country/neon_honky_tonk_shuffle.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Neon%20Honky-Tonk%20Shuffle.m4a',
    duration: 180,
  },
  {
    id: 'country-backroad-bluegrass',
    title: 'Backroad Bluegrass Jam',
    genre: 'Fast Bluegrass Breakdown',
    category: 'Country',
    bpm: 145,
    description: 'High-speed bluegrass with blistering banjo rolls, fast mandolin chops, and galloping acoustic guitar.',
    icon: '🪕',
    audioUrl: '/music/country/backroad_bluegrass_jam.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Backroad%20Bluegrass%20Jam.m4a',
    duration: 180,
  },
  {
    id: 'country-whispering-pines',
    title: 'Whispering Pines',
    genre: 'Atmospheric Mountain Country',
    category: 'Country',
    bpm: 80,
    description: 'Mellow atmospheric country, reverb-drenched lap steel, clean acoustic picking, and serene morning breeze.',
    icon: '🌲',
    audioUrl: '/music/country/whispering_pines.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Whispering%20Pines.m4a',
    duration: 180,
  },

  // --- RAP & HIP-HOP TRACKS (7) ---
  {
    id: 'rap-arctic-grind',
    title: 'Arctic Grind',
    genre: 'High-Octane Modern Trap',
    category: 'Rap',
    bpm: 140,
    description: 'Heavy modern trap beat, 808 sub bass glides, crisp metallic hi-hat triplets, and dark icy synth leads.',
    icon: '❄️',
    audioUrl: '/music/rap/arctic_grind.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Arctic%20Grind.m4a',
    duration: 180,
  },
  {
    id: 'rap-subway-neon',
    title: 'Subway Neon',
    genre: '90s Classic Boom-Bap',
    category: 'Rap',
    bpm: 90,
    description: 'Golden era boom-bap hip-hop, warm vinyl crackle, soulful Rhodes chords, and snappy acoustic snare.',
    icon: '🚇',
    audioUrl: '/music/rap/subway_neon.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Subway%20Neon.m4a',
    duration: 180,
  },
  {
    id: 'rap-midnight-velocity',
    title: 'Midnight Velocity',
    genre: 'Melodic Guitar Trap',
    category: 'Rap',
    bpm: 135,
    description: 'Emotional melodic rap beat, reverberant electric guitar loop, bouncy 808 bass, and late-night vibe.',
    icon: '🏎️',
    audioUrl: '/music/rap/midnight_velocity.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Midnight%20Velocity.m4a',
    duration: 180,
  },
  {
    id: 'rap-glacier-freestyle',
    title: 'Glacier Freestyle',
    genre: 'West Coast G-Funk Bounce',
    category: 'Rap',
    bpm: 98,
    description: 'West coast bounce, smooth synth bassline, high-pitched whistle synth, and laid-back cruising groove.',
    icon: '🌊',
    audioUrl: '/music/rap/glacier_freestyle.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Glacier%20Freestyle.m4a',
    duration: 180,
  },
  {
    id: 'rap-frostbyte-flow',
    title: 'Frostbyte Flow',
    genre: 'Cyberpunk Drill Beat',
    category: 'Rap',
    bpm: 142,
    description: 'UK drill style, sliding heavy 808 bass, stuttering syncopated hi-hats, and haunting bell melody.',
    icon: '⚡',
    audioUrl: '/music/rap/frostbyte_flow.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Frostbyte%20Flow.m4a',
    duration: 180,
  },
  {
    id: 'rap-chill-penguin-cafe',
    title: 'Chill Penguin Cafe',
    genre: 'Lo-Fi Study Hip-Hop',
    category: 'Rap',
    bpm: 82,
    description: 'Lo-fi chillhop, cozy mellow piano loops, tape saturation warmth, and relaxed jazz saxophone snippets.',
    icon: '☕',
    audioUrl: '/music/rap/chill_penguin_cafe.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Chill%20Penguin%20Cafe.m4a',
    duration: 180,
  },
  {
    id: 'rap-skyline-champions',
    title: 'Skyline Champions',
    genre: 'Stadium Arena Brass Anthem',
    category: 'Rap',
    bpm: 130,
    description: 'Victorious arena hip-hop, blaring cinematic brass horns, booming 808 bass, and heroic sports swagger.',
    icon: '🏆',
    audioUrl: '/music/rap/skyline_champions.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Skyline%20Champions.m4a',
    duration: 180,
    isVip: true,
    vipLevel: 'Platinum',
  },

  // --- POP & SYNTH TRACKS (6) ---
  {
    id: 'pop-starlight-horizon',
    title: 'Starlight Horizon',
    genre: '80s Synthwave Retro Pop',
    category: 'Pop',
    bpm: 124,
    description: '80s retro synthpop, pulsating analog bassline, shimmering bright synth brass, and gated reverb snare.',
    icon: '🌌',
    audioUrl: '/music/pop/starlight_horizon.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Starlight%20Horizon.m4a',
    duration: 180,
  },
  {
    id: 'pop-ice-pop-paradise',
    title: 'Ice Pop Paradise',
    genre: 'Upbeat Summer Dance-Pop',
    category: 'Pop',
    bpm: 126,
    description: 'Clean funky rhythm guitar, bouncy house bass, catchy vocal chop synths, and vibrant festival euphoria.',
    icon: '🍧',
    audioUrl: '/music/pop/ice_pop_paradise.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Ice%20Pop%20Paradise%203.m4a',
    duration: 180,
  },
  {
    id: 'pop-cloud-nine-waddle',
    title: 'Cloud Nine Waddle',
    genre: 'Indie Bedroom Pop',
    category: 'Pop',
    bpm: 105,
    description: 'Indie bedroom pop, soft ukulele strumming, bright glockenspiel bells, and cheerful playful melody.',
    icon: '☁️',
    audioUrl: '/music/pop/cloud_nine_waddle.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Cloud%20Nine%20Waddle.m4a',
    duration: 180,
  },
  {
    id: 'pop-electric-glacier',
    title: 'Electric Glacier',
    genre: 'Nu-Disco Funk Pop',
    category: 'Pop',
    bpm: 118,
    description: 'French nu-disco, slap bass groove, funky Chic-style guitar riffs, and sparkling Rhodes chords.',
    icon: '🪩',
    audioUrl: '/music/pop/electric_glacier.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Electric%20Glacier.m4a',
    duration: 180,
  },
  {
    id: 'pop-sunset-boulevard',
    title: 'Sunset Boulevard Glow',
    genre: 'Modern Tropical Pop',
    category: 'Pop',
    bpm: 108,
    description: 'Tropical pop, wooden marimba lead melody, warm plucks, ocean breeze acoustic guitar, and light bounce.',
    icon: '🌴',
    audioUrl: '/music/pop/sunset_boulevard_glow.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Sunset%20Boulevard%20Glow.m4a',
    duration: 180,
  },
  {
    id: 'pop-level-up-tonight',
    title: 'Level Up Tonight',
    genre: 'High-Energy Arcade Pop',
    category: 'Pop',
    bpm: 132,
    description: 'Electropop arcade hybrid, 8-bit chiptune arpeggios, massive modern synth drops, and pumping drums.',
    icon: '🚀',
    audioUrl: '/music/pop/level_up_tonight.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/level%20up%20tonight.m4a',
    duration: 180,
    isVip: true,
    vipLevel: 'Gold',
  },

  // --- POLAR EXCLUSIVES (2) ---
  {
    id: 'polar-pebbles-anthem',
    title: "Pebbles' Polar Anthem",
    genre: 'Orchestral Video Game Anthem',
    category: 'Polar',
    bpm: 128,
    description: 'Epic brass fanfare, cute marimba, bright strings, and adventurous polar exploration soundtrack.',
    icon: '🐧',
    audioUrl: '/music/polar/pebbles_polar_anthem.m4a',
    fallbackUrl: "https://raw.githubusercontent.com/penguin-tech1/songs/main/Pebbles'%20Polar%20Anthem.m4a",
    duration: 180,
    isVip: true,
    vipLevel: 'Diamond',
  },
  {
    id: 'polar-iceberg-drift',
    title: 'Iceberg Drift',
    genre: 'Deep Polar Ambient Chill',
    category: 'Polar',
    bpm: 75,
    description: 'Deep crystal chime textures, gentle warm pads, slow organic beat, and serene icy relaxation.',
    icon: '🧊',
    audioUrl: '/music/polar/iceberg_drift.m4a',
    fallbackUrl: 'https://raw.githubusercontent.com/penguin-tech1/songs/main/Iceberg%20Drift.m4a',
    duration: 180,
  },
];

class BackgroundMusicEngine {
  private isPlaying: boolean = false;
  private currentTrackId: string = 'country-dust-on-tailgate';
  private volume: number = 0.45;
  private isMuted: boolean = false;
  private onStateChangeCallbacks: Array<() => void> = [];
  private audioEl: HTMLAudioElement | null = null;
  private currentTime: number = 0;
  private duration: number = 180;
  private isLooping: boolean = true;
  private isShuffled: boolean = false;

  constructor() {
    try {
      const savedVol = localStorage.getItem('gameland_bgm_volume');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
      const savedMute = localStorage.getItem('gameland_bgm_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedTrack = localStorage.getItem('gameland_bgm_track');
      if (savedTrack && MUSIC_TRACKS.some((t) => t.id === savedTrack)) {
        this.currentTrackId = savedTrack;
      }
    } catch {
      // Fallback defaults
    }
  }

  private ensureAudioElement(): HTMLAudioElement {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';
      this.audioEl.loop = this.isLooping;
      this.audioEl.volume = this.isMuted ? 0 : this.volume;

      this.audioEl.addEventListener('timeupdate', () => {
        if (this.audioEl) {
          this.currentTime = this.audioEl.currentTime;
          if (this.audioEl.duration && !isNaN(this.audioEl.duration)) {
            this.duration = this.audioEl.duration;
          }
          this.notify();
        }
      });

      this.audioEl.addEventListener('ended', () => {
        if (!this.isLooping) {
          this.nextTrack();
        }
      });

      this.audioEl.addEventListener('error', () => {
        const tr = this.getCurrentTrack();
        if (tr?.fallbackUrl && this.audioEl && this.audioEl.src !== tr.fallbackUrl) {
          console.warn('Local audio fallback to GitHub raw source:', tr.fallbackUrl);
          this.audioEl.src = tr.fallbackUrl;
          if (this.isPlaying) {
            this.audioEl.play().catch(() => {});
          }
        }
      });
    }
    return this.audioEl;
  }

  public subscribe(callback: () => void) {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== callback);
    };
  }

  private notify() {
    this.onStateChangeCallbacks.forEach((cb) => cb());
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public play() {
    this.isPlaying = true;
    const track = this.getCurrentTrack();
    const audio = this.ensureAudioElement();
    audio.volume = this.isMuted ? 0 : this.volume;
    audio.loop = this.isLooping;

    const resolvedSrc = resolveAudioUrl(track.audioUrl);
    const currentSrcPath = audio.src ? new URL(audio.src, window.location.href).pathname : '';
    if (!audio.src || !currentSrcPath.endsWith(track.audioUrl)) {
      audio.src = resolvedSrc;
    }

    audio.play().catch((err) => {
      console.log('Audio playback deferred until user interaction:', err);
    });

    this.updateMediaSession(track);
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.notify();
  }

  public setTrack(trackId: string) {
    if (this.currentTrackId === trackId && this.isPlaying) return;
    this.currentTrackId = trackId;
    try {
      localStorage.setItem('gameland_bgm_track', trackId);
    } catch {
      // ignore
    }
    const track = this.getCurrentTrack();

    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = resolveAudioUrl(track.audioUrl);
      this.currentTime = 0;
    }

    if (this.isPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public nextTrack() {
    if (this.isShuffled) {
      this.shuffle();
      return;
    }
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.currentTrackId);
    const nextIdx = (idx + 1) % MUSIC_TRACKS.length;
    this.setTrack(MUSIC_TRACKS[nextIdx].id);
  }

  public prevTrack() {
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.currentTrackId);
    const prevIdx = (idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    this.setTrack(MUSIC_TRACKS[prevIdx].id);
  }

  public shuffle() {
    const pool = MUSIC_TRACKS.filter((t) => t.id !== this.currentTrackId);
    if (pool.length === 0) return;
    const randomIdx = Math.floor(Math.random() * pool.length);
    this.setTrack(pool[randomIdx].id);
  }

  public toggleShuffle(): boolean {
    this.isShuffled = !this.isShuffled;
    this.notify();
    return this.isShuffled;
  }

  public toggleLoop(): boolean {
    this.isLooping = !this.isLooping;
    if (this.audioEl) {
      this.audioEl.loop = this.isLooping;
    }
    this.notify();
    return this.isLooping;
  }

  public getIsLooping(): boolean {
    return this.isLooping;
  }

  public getIsShuffled(): boolean {
    return this.isShuffled;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public seek(seconds: number) {
    if (this.audioEl && !isNaN(seconds)) {
      this.audioEl.currentTime = seconds;
      this.currentTime = seconds;
      this.notify();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('gameland_bgm_volume', this.volume.toString());
    } catch {
      // ignore
    }
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('gameland_bgm_muted', this.isMuted.toString());
    } catch {
      // ignore
    }
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    this.notify();
    return this.isMuted;
  }

  private updateMediaSession(track: TrackInfo) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: 'GameLand Penguin',
          album: `${track.category} • ${track.genre}`,
          artwork: [
            {
              src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=512',
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ],
        });
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
      } catch {
        // ignore
      }
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public getVolume() {
    return this.volume;
  }

  public getCurrentTrack(): TrackInfo {
    return MUSIC_TRACKS.find((t) => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
  }
}

export const bgMusicEngine = new BackgroundMusicEngine();
