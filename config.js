/*
  EduKids — Teman Belajar Si Kecil
  File: config.js
  Version: 1.0.0
  Author: GenzPx / artaDev / Xternalz
  Description: Editable configuration — app info, social links, creator info, feature flags
  License: MIT
*/

const APP_CONFIG = {
  /* ---- App Info ---- */
  name: 'EduKids',
  version: '1.0.0',
  tagline: {
    id: 'Teman Belajar Si Kecil',
    en: "Your Little One's Learning Buddy"
  },
  description: {
    id: 'Aplikasi edukasi interaktif untuk anak usia 2-7 tahun. Belajar sambil bermain bersama Dacorta si Panda!',
    en: 'Interactive educational app for kids age 2-7. Learn while playing with Dacorta the Panda!'
  },

  /* ---- Creator Info ---- */
  creator: {
    name: 'GenzPx',
    alias: ['artaDev', 'Xternalz'],
    photo: 'foto.jpg',  // Place your photo file in the same directory
    bio: {
      id: 'Developer & kreator EduKids. Passionate tentang pendidikan anak dan teknologi.',
      en: 'Developer & creator of EduKids. Passionate about children education and technology.'
    }
  },

  /* ---- Social Links ---- */
  // Edit these URLs with your actual links
  social: {
    github: {
      label: 'GitHub',
      url: 'https://github.com/GenzPx',
      icon: 'github'
    },
    trakteer: {
      label: 'Trakteer',
      url: 'https://trakteer.id/GenzSenpai',
      icon: 'coffee'
    },
    saweria: {
      label: 'Saweria',
      url: 'https://saweria.co/Genzsenpai',
      icon: 'heart'
    },
    whatsapp: {
      label: 'WhatsApp Channel',
      url: 'https://whatsapp.com/channel/0029Vb5NMsa9Gv7QCAqh1T1z/116',
      icon: 'chat'
    }
  },

  /* ---- Feature Flags ---- */
  features: {
    soundEnabled: true,           // Default sound on/off
    darkModeAutoDetect: true,     // Auto-detect OS dark mode
    showSplash: true,             // Show splash screen on load
    splashDuration: 2000,         // Splash duration in ms
    dailyGoalTarget: 1,           // Lessons per day target
    maxLessonsPerSession: 99,     // Max lessons in one sitting
    showHints: true,              // Allow hint button
    enableConfetti: true,         // Confetti on high score
    enableComboIndicator: true,   // Show combo counter
    stickerChestInterval: 5,      // Give sticker every N lessons
    enableTypingModule: true      // Show typing module (unlocks after all others)
  },

  /* ---- Lock System ---- */
  lockSystem: {
    crossModule: false,           // false = modules unlocked independently
    withinModule: true,           // true = lessons within module are progressive
    minStarsToUnlock: 1           // Minimum stars to unlock next lesson (not enforced if 0)
  },

  /* ---- Lesson Config ---- */
  lessonConfig: {
    questionsPerLesson: 18,       // Max questions per lesson session
    xpPerCorrect: 10,             // XP per correct answer
    xpComboBonus: 5,              // XP bonus per combo step
    xpCompletionBonus: 50,        // XP for completing a lesson
    xpThreeStarBonus: 30,         // Extra XP for 3 stars
    starThresholds: {             // Percentage thresholds
      three: 90,
      two: 70,
      one: 50
    }
  },

  /* ---- Theming ---- */
  theme: {
    accentColor: '#FF8C42',
    correctColor: '#4CAF50',
    wrongColor: '#FF7043',
    starColor: '#FFD700',
    xpColor: '#7C4DFF'
  },

  /* ---- Content ---- */
  mascot: {
    name: 'Dacorta',
    species: 'Panda',
    personality: {
      id: 'Ceria, penyemangat, dan sabar',
      en: 'Cheerful, encouraging, and patient'
    }
  }
};

// Freeze config to prevent accidental modification at runtime
if (typeof Object.freeze === 'function') {
  Object.freeze(APP_CONFIG);
  Object.freeze(APP_CONFIG.creator);
  Object.freeze(APP_CONFIG.social);
  Object.freeze(APP_CONFIG.features);
  Object.freeze(APP_CONFIG.lockSystem);
  Object.freeze(APP_CONFIG.lessonConfig);
  Object.freeze(APP_CONFIG.theme);
  Object.freeze(APP_CONFIG.mascot);
}
