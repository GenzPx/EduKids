/*
  EduKids — Teman Belajar Si Kecil
  File: app.js
  Version: 1.0.0
  Author: GenzPx / artaDev / Xternalz
  Description: Full application logic — Sound engine, constants, i18n, definitions,
               storage, utilities, SVG generators, App object, Game engine, Events
  License: MIT
*/

/* ================================================
   SECTION 1: SOUND ENGINE (Internal Static Module)
   ================================================ */

const Sound = (() => {
  let ctx = null;
  let enabled = true;
  let initialized = false;

  function _getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        enabled = false;
        return null;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function _playTone(freq, duration, type, startTime, gainVal, rampDown) {
    const c = _getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal || 0.15, startTime);
    if (rampDown !== false) {
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    }
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function _playMulti(notes) {
    const c = _getCtx();
    if (!c) return;
    const now = c.currentTime;
    notes.forEach(n => {
      _playTone(n.freq, n.dur || 0.15, n.type || 'sine', now + (n.delay || 0), n.gain || 0.12, n.ramp !== undefined ? n.ramp : true);
    });
  }

  const SOUNDS = {
    correct() {
      _playMulti([
        { freq: 523.25, dur: 0.1, delay: 0, gain: 0.15, type: 'sine' },
        { freq: 659.25, dur: 0.1, delay: 0.08, gain: 0.14, type: 'sine' },
        { freq: 783.99, dur: 0.18, delay: 0.16, gain: 0.13, type: 'sine' }
      ]);
    },
    wrong() {
      _playMulti([
        { freq: 329.63, dur: 0.2, delay: 0, gain: 0.1, type: 'triangle' },
        { freq: 220.00, dur: 0.3, delay: 0.12, gain: 0.08, type: 'triangle' }
      ]);
    },
    complete() {
      _playMulti([
        { freq: 523.25, dur: 0.12, delay: 0, gain: 0.14, type: 'sine' },
        { freq: 659.25, dur: 0.12, delay: 0.1, gain: 0.13, type: 'sine' },
        { freq: 783.99, dur: 0.12, delay: 0.2, gain: 0.12, type: 'sine' },
        { freq: 1046.50, dur: 0.4, delay: 0.3, gain: 0.15, type: 'sine' },
        { freq: 523.25, dur: 0.4, delay: 0.3, gain: 0.06, type: 'triangle' }
      ]);
    },
    levelup() {
      _playMulti([
        { freq: 392.00, dur: 0.1, delay: 0, gain: 0.12, type: 'sine' },
        { freq: 523.25, dur: 0.1, delay: 0.08, gain: 0.12, type: 'sine' },
        { freq: 659.25, dur: 0.1, delay: 0.16, gain: 0.12, type: 'sine' },
        { freq: 783.99, dur: 0.1, delay: 0.24, gain: 0.12, type: 'sine' },
        { freq: 1046.50, dur: 0.12, delay: 0.32, gain: 0.13, type: 'sine' },
        { freq: 1318.51, dur: 0.12, delay: 0.4, gain: 0.13, type: 'sine' },
        { freq: 1567.98, dur: 0.5, delay: 0.48, gain: 0.15, type: 'sine' },
        { freq: 783.99, dur: 0.5, delay: 0.48, gain: 0.06, type: 'triangle' }
      ]);
    },
    click() {
      _playMulti([
        { freq: 800, dur: 0.06, delay: 0, gain: 0.08, type: 'square' },
        { freq: 400, dur: 0.04, delay: 0.03, gain: 0.05, type: 'square' }
      ]);
    },
    streak() {
      _playMulti([
        { freq: 1046.50, dur: 0.08, delay: 0, gain: 0.1, type: 'sine' },
        { freq: 1318.51, dur: 0.08, delay: 0.06, gain: 0.1, type: 'sine' },
        { freq: 1567.98, dur: 0.08, delay: 0.12, gain: 0.1, type: 'sine' },
        { freq: 2093.00, dur: 0.08, delay: 0.18, gain: 0.1, type: 'sine' },
        { freq: 2637.02, dur: 0.2, delay: 0.24, gain: 0.12, type: 'sine' }
      ]);
    }
  };

  return {
    init() { if (initialized) return; _getCtx(); initialized = true; },
    play(name) {
      if (!enabled) return;
      if (!initialized) this.init();
      if (SOUNDS[name]) { try { SOUNDS[name](); } catch (e) {} }
    },
    setEnabled(val) { enabled = !!val; },
    isEnabled() { return enabled; }
  };
})();

/* ================================================
   SECTION 2: CONSTANTS
   ================================================ */

const CATEGORIES = ['math', 'read', 'write', 'intro', 'logic', 'english', 'typing'];

const CAT_NAMES = {
  id: { math: 'Matematika', read: 'Membaca', write: 'Menulis', intro: 'Pengenalan', logic: 'Logika', english: 'English', typing: 'Mengetik' },
  en: { math: 'Math', read: 'Reading', write: 'Writing', intro: 'Introduction', logic: 'Logic', english: 'English', typing: 'Typing' }
};

const CAT_COLORS = { math: '#FF6B6B', read: '#4ECDC4', write: '#45B7D1', intro: '#96CEB4', logic: '#F0A500', english: '#9B59B6', typing: '#E74C8B' };

const ALL_LESSONS = [
  { id: 'math_numbers', cat: 'math', order: 1, name: { id: 'Mengenal Angka 0-10', en: 'Numbers 0-10' } },
  { id: 'math_counting', cat: 'math', order: 2, name: { id: 'Menghitung Benda', en: 'Counting Objects' } },
  { id: 'math_addition', cat: 'math', order: 3, name: { id: 'Penjumlahan Dasar', en: 'Basic Addition' } },
  { id: 'math_subtraction', cat: 'math', order: 4, name: { id: 'Pengurangan Dasar', en: 'Basic Subtraction' } },
  { id: 'math_comparison', cat: 'math', order: 5, name: { id: 'Besar dan Kecil', en: 'Big and Small' } },
  { id: 'math_patterns', cat: 'math', order: 6, name: { id: 'Pola Sederhana', en: 'Simple Patterns' } },
  { id: 'read_alphabet', cat: 'read', order: 1, name: { id: 'Huruf A-Z', en: 'Letters A-Z' } },
  { id: 'read_vowels', cat: 'read', order: 2, name: { id: 'Huruf Vokal', en: 'Vowels' } },
  { id: 'read_syllables', cat: 'read', order: 3, name: { id: 'Suku Kata', en: 'Syllables' } },
  { id: 'read_words', cat: 'read', order: 4, name: { id: 'Kata Sederhana', en: 'Simple Words' } },
  { id: 'read_sentences', cat: 'read', order: 5, name: { id: 'Kalimat Pendek', en: 'Short Sentences' } },
  { id: 'write_trace_letters', cat: 'write', order: 1, name: { id: 'Tracing Huruf', en: 'Letter Tracing' } },
  { id: 'write_trace_numbers', cat: 'write', order: 2, name: { id: 'Tracing Angka', en: 'Number Tracing' } },
  { id: 'write_arrange', cat: 'write', order: 3, name: { id: 'Susun Huruf Jadi Kata', en: 'Arrange Letters' } },
  { id: 'intro_colors', cat: 'intro', order: 1, name: { id: 'Warna', en: 'Colors' } },
  { id: 'intro_shapes', cat: 'intro', order: 2, name: { id: 'Bentuk', en: 'Shapes' } },
  { id: 'intro_animals', cat: 'intro', order: 3, name: { id: 'Hewan', en: 'Animals' } },
  { id: 'intro_fruits', cat: 'intro', order: 4, name: { id: 'Buah & Sayur', en: 'Fruits & Veggies' } },
  { id: 'intro_vehicles', cat: 'intro', order: 5, name: { id: 'Kendaraan', en: 'Vehicles' } },
  { id: 'intro_body', cat: 'intro', order: 6, name: { id: 'Anggota Tubuh', en: 'Body Parts' } },
  { id: 'intro_emotions', cat: 'intro', order: 7, name: { id: 'Emosi', en: 'Emotions' } },
  { id: 'logic_memory', cat: 'logic', order: 1, name: { id: 'Memory Match', en: 'Memory Match' } },
  { id: 'logic_matching', cat: 'logic', order: 2, name: { id: 'Cocokkan Gambar', en: 'Match Pictures' } },
  { id: 'logic_sequence', cat: 'logic', order: 3, name: { id: 'Urutan', en: 'Sequences' } },
  { id: 'logic_classify', cat: 'logic', order: 4, name: { id: 'Klasifikasi', en: 'Classification' } },
  { id: 'logic_puzzle', cat: 'logic', order: 5, name: { id: 'Puzzle Sederhana', en: 'Simple Puzzles' } },
  { id: 'eng_alphabet', cat: 'english', order: 1, name: { id: 'Alphabet', en: 'Alphabet' } },
  { id: 'eng_numbers', cat: 'english', order: 2, name: { id: 'Numbers 1-10', en: 'Numbers 1-10' } },
  { id: 'eng_colors', cat: 'english', order: 3, name: { id: 'Colors', en: 'Colors' } },
  { id: 'eng_animals', cat: 'english', order: 4, name: { id: 'Animals', en: 'Animals' } },
  { id: 'eng_words', cat: 'english', order: 5, name: { id: 'Simple Words', en: 'Simple Words' } },
  { id: 'typing_letters', cat: 'typing', order: 1, name: { id: 'Mengenal Keyboard', en: 'Know the Keyboard' } },
  { id: 'typing_words', cat: 'typing', order: 2, name: { id: 'Ketik Kata Sederhana', en: 'Type Simple Words' } },
  { id: 'typing_speed', cat: 'typing', order: 3, name: { id: 'Ketik Cepat', en: 'Speed Typing' } },
  { id: 'typing_rank', cat: 'typing', order: 4, name: { id: 'Peringkat Kecepatan', en: 'Speed Rank' } },
  { id: 'typing_creative', cat: 'typing', order: 5, name: { id: 'Ketik Kalimat Pendek', en: 'Type Short Sentences' } }
];

const NON_TYPING_COUNT = ALL_LESSONS.filter(l => l.cat !== 'typing').length;

const XP_TABLE = [
  0, 100, 220, 360, 520, 700, 900, 1120, 1360, 1620,
  1900, 2200, 2520, 2860, 3220, 3600, 4000, 4420, 4860, 5320,
  5800, 6300, 6820, 7360, 7920, 8500, 9100, 9720, 10360, 11020,
  11700, 12400, 13120, 13860, 14620, 15400, 16200, 17020, 17860, 18720,
  19600, 20500, 21420, 22360, 23320, 24300, 25300, 26320, 27360, 28420
];

const LEVEL_NAMES = {
  id: ['Penjelajah Kecil','Penjelajah Kecil','Penjelajah Kecil','Penjelajah Kecil','Penjelajah Kecil','Bintang Belajar','Bintang Belajar','Bintang Belajar','Bintang Belajar','Bintang Belajar','Petualang Pintar','Petualang Pintar','Petualang Pintar','Petualang Pintar','Petualang Pintar','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Jagoan Cerdas','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Master Cilik','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda','Jenius Muda'],
  en: ['Little Explorer','Little Explorer','Little Explorer','Little Explorer','Little Explorer','Learning Star','Learning Star','Learning Star','Learning Star','Learning Star','Smart Adventurer','Smart Adventurer','Smart Adventurer','Smart Adventurer','Smart Adventurer','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Clever Champion','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Master','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius','Young Genius']
};

const KEYS = { profile: 'edukids_profile', progress: 'edukids_progress', achievements: 'edukids_achievements', stickers: 'edukids_stickers', outfits: 'edukids_outfits', settings: 'edukids_settings', calendar: 'edukids_calendar' };

/* ================================================
   SECTION 3: i18n
   ================================================ */

const LANG = {
  id: {
    setup_name_title:'Halo! Siapa namamu?', setup_name_sub:'Dacorta ingin berkenalan denganmu!', setup_age_title:'Berapa umurmu?', btn_next:'Lanjut',
    age_toddler:'Balita', age_preschool:'Pra-Sekolah', age_primary:'SD Awal',
    greeting_morning:'Selamat Pagi', greeting_afternoon:'Selamat Siang', greeting_evening:'Selamat Sore', greeting_night:'Selamat Malam',
    greeting_sub:'Ayo belajar hari ini!', home_categories:'Kategori Belajar', btn_continue:'Lanjutkan Belajar',
    stat_stars:'Bintang', stat_streak:'Streak', stat_lessons:'Pelajaran', daily_goal:'Target Harian',
    nav_home:'Beranda', nav_learn:'Belajar', nav_progress:'Kemajuan', nav_collection:'Koleksi', nav_settings:'Pengaturan',
    btn_clear:'Hapus', btn_check:'Periksa', btn_hint:'Petunjuk',
    feedback_correct:'Benar!', feedback_wrong:'Belum Tepat', feedback_great:'Hebat sekali!', feedback_try:'Ayo coba lagi!', feedback_answer_was:'Jawaban yang benar:',
    result_title_3:'Luar Biasa!', result_title_2:'Bagus Sekali!', result_title_1:'Lumayan!', result_title_0:'Ayo Coba Lagi!',
    result_score:'Skor', result_correct:'Benar', result_combo:'Kombo Terbaik', btn_retry:'Ulangi', btn_next_lesson:'Selanjutnya',
    stat_total_stars:'Total Bintang', stat_completed:'Selesai', stat_longest_streak:'Rekor Streak', stat_total_xp:'Total XP',
    progress_by_category:'Kemajuan per Kategori', progress_calendar:'Kalender Belajar',
    tab_badges:'Lencana', tab_stickers:'Stiker', tab_outfits:'Kostum',
    setting_name:'Nama', setting_age:'Usia', setting_language:'Bahasa', setting_theme:'Tema', setting_sound:'Suara',
    setting_about:'Tentang', setting_credits:'Kredit', setting_credits_sub:'Tim pengembang',
    setting_reset:'Hapus Semua Data', setting_reset_sub:'Progress akan hilang',
    theme_light:'Terang', theme_dark:'Gelap', sound_on:'Aktif', sound_off:'Nonaktif',
    modal_edit_name:'Ganti Nama', modal_edit_age:'Ganti Usia',
    modal_reset_title:'Hapus Semua Data?', modal_reset_desc:'Semua progress, lencana, stiker, dan kostum akan hilang. Tindakan ini tidak bisa dibatalkan.',
    modal_exit_title:'Keluar dari Pelajaran?', modal_exit_desc:'Progress di pelajaran ini akan hilang. Yakin ingin keluar?',
    btn_cancel:'Batal', btn_save:'Simpan', btn_reset:'Hapus Data', btn_stay:'Lanjut Belajar', btn_exit:'Keluar',
    btn_awesome:'Keren!', btn_later:'Nanti', btn_equip:'Pakai!',
    levelup_title:'Naik Level!', badge_unlocked:'Lencana Baru!', chest_title:'Peti Hadiah!', outfit_unlocked:'Kostum Baru!',
    about_desc:'Aplikasi edukasi interaktif untuk anak usia 2-7 tahun. Belajar sambil bermain bersama Dacorta si Panda!',
    about_f1:'7 Modul Pembelajaran', about_f2:'666 Soal Interaktif', about_f3:'100% Offline', about_f4:'Aman untuk Anak',
    months:['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    days_short:['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
    toast_name_saved:'Nama berhasil disimpan!', toast_age_saved:'Usia berhasil diubah!', toast_data_reset:'Semua data telah dihapus.',
    toast_outfit_equipped:'Kostum dipasang!', toast_lesson_locked:'Selesaikan pelajaran sebelumnya dulu!',
    toast_typing_locked:'Selesaikan semua 31 pelajaran untuk membuka Mengetik!',
    tf_true:'Benar', tf_false:'Salah', locked:'Terkunci', completed:'Selesai', available:'Tersedia', lesson_of:'dari'
  },
  en: {
    setup_name_title:"Hello! What's your name?", setup_name_sub:'Dacorta wants to meet you!', setup_age_title:'How old are you?', btn_next:'Next',
    age_toddler:'Toddler', age_preschool:'Preschool', age_primary:'Early Primary',
    greeting_morning:'Good Morning', greeting_afternoon:'Good Afternoon', greeting_evening:'Good Evening', greeting_night:'Good Night',
    greeting_sub:"Let's learn today!", home_categories:'Learning Categories', btn_continue:'Continue Learning',
    stat_stars:'Stars', stat_streak:'Streak', stat_lessons:'Lessons', daily_goal:'Daily Goal',
    nav_home:'Home', nav_learn:'Learn', nav_progress:'Progress', nav_collection:'Collection', nav_settings:'Settings',
    btn_clear:'Clear', btn_check:'Check', btn_hint:'Hint',
    feedback_correct:'Correct!', feedback_wrong:'Not Quite', feedback_great:'Great job!', feedback_try:'Try again!', feedback_answer_was:'The correct answer:',
    result_title_3:'Amazing!', result_title_2:'Great Job!', result_title_1:'Not Bad!', result_title_0:'Try Again!',
    result_score:'Score', result_correct:'Correct', result_combo:'Best Combo', btn_retry:'Retry', btn_next_lesson:'Next',
    stat_total_stars:'Total Stars', stat_completed:'Completed', stat_longest_streak:'Best Streak', stat_total_xp:'Total XP',
    progress_by_category:'Progress by Category', progress_calendar:'Learning Calendar',
    tab_badges:'Badges', tab_stickers:'Stickers', tab_outfits:'Outfits',
    setting_name:'Name', setting_age:'Age', setting_language:'Language', setting_theme:'Theme', setting_sound:'Sound',
    setting_about:'About', setting_credits:'Credits', setting_credits_sub:'Dev team',
    setting_reset:'Delete All Data', setting_reset_sub:'Progress will be lost',
    theme_light:'Light', theme_dark:'Dark', sound_on:'On', sound_off:'Off',
    modal_edit_name:'Change Name', modal_edit_age:'Change Age',
    modal_reset_title:'Delete All Data?', modal_reset_desc:'All progress, badges, stickers, and outfits will be lost. This cannot be undone.',
    modal_exit_title:'Leave Lesson?', modal_exit_desc:'Progress in this lesson will be lost. Are you sure?',
    btn_cancel:'Cancel', btn_save:'Save', btn_reset:'Delete', btn_stay:'Keep Learning', btn_exit:'Leave',
    btn_awesome:'Awesome!', btn_later:'Later', btn_equip:'Equip!',
    levelup_title:'Level Up!', badge_unlocked:'New Badge!', chest_title:'Treasure Chest!', outfit_unlocked:'New Outfit!',
    about_desc:'Interactive educational app for kids age 2-7. Learn while playing with Dacorta the Panda!',
    about_f1:'7 Learning Modules', about_f2:'666 Interactive Questions', about_f3:'100% Offline', about_f4:'Child Safe',
    months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    days_short:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    toast_name_saved:'Name saved!', toast_age_saved:'Age updated!', toast_data_reset:'All data has been deleted.',
    toast_outfit_equipped:'Outfit equipped!', toast_lesson_locked:'Complete the previous lesson first!',
    toast_typing_locked:'Complete all 31 lessons to unlock Typing!',
    tf_true:'True', tf_false:'False', locked:'Locked', completed:'Completed', available:'Available', lesson_of:'of'
  }
};

/* ================================================
   SECTION 4: DEFINITIONS
   ================================================ */

const BADGES = [
  { id:'first_step', name:{id:'Langkah Pertama',en:'First Step'}, desc:{id:'Selesaikan 1 pelajaran',en:'Complete 1 lesson'}, icon:'footprint', check:(p)=>p.totalLessonsCompleted>=1 },
  { id:'streak_3', name:{id:'Rajin 3 Hari',en:'3-Day Streak'}, desc:{id:'Streak 3 hari',en:'3-day streak'}, icon:'fire', check:(p)=>p.streak.longest>=3 },
  { id:'streak_7', name:{id:'Rajin Seminggu',en:'Week Warrior'}, desc:{id:'Streak 7 hari',en:'7-day streak'}, icon:'fire', check:(p)=>p.streak.longest>=7 },
  { id:'streak_14', name:{id:'Rajin 2 Minggu',en:'2-Week Streak'}, desc:{id:'Streak 14 hari',en:'14-day streak'}, icon:'fire', check:(p)=>p.streak.longest>=14 },
  { id:'streak_30', name:{id:'Rajin Sebulan',en:'Monthly Hero'}, desc:{id:'Streak 30 hari',en:'30-day streak'}, icon:'fire', check:(p)=>p.streak.longest>=30 },
  { id:'first_star3', name:{id:'Bintang Pertama',en:'First 3 Stars'}, desc:{id:'Dapat 3 bintang',en:'Get 3 stars'}, icon:'star3', check:(p)=>{ for(let k in p.lessons){ if(p.lessons[k].stars>=3) return true; } return false; } },
  { id:'stars_50', name:{id:'Kolektor Bintang',en:'Star Collector'}, desc:{id:'50 bintang',en:'50 stars'}, icon:'stars', check:(p)=>p.totalStars>=50 },
  { id:'stars_100', name:{id:'Penuh Bintang',en:'Star Master'}, desc:{id:'100 bintang',en:'100 stars'}, icon:'stars', check:(p)=>p.totalStars>=100 },
  { id:'math_master', name:{id:'Ahli Matematika',en:'Math Master'}, icon:'calculator', check:(p)=>_catDone(p,'math') },
  { id:'bookworm', name:{id:'Kutu Buku',en:'Bookworm'}, icon:'book', check:(p)=>_catDone(p,'read') },
  { id:'writer', name:{id:'Penulis Cilik',en:'Young Writer'}, icon:'pencil', check:(p)=>_catDone(p,'write') },
  { id:'color_artist', name:{id:'Seniman Warna',en:'Color Artist'}, icon:'palette', check:(p)=>p.lessons.intro_colors&&p.lessons.intro_colors.completed },
  { id:'animal_friend', name:{id:'Sahabat Hewan',en:'Animal Friend'}, icon:'paw', check:(p)=>p.lessons.intro_animals&&p.lessons.intro_animals.completed },
  { id:'brain', name:{id:'Otak Encer',en:'Big Brain'}, icon:'brain', check:(p)=>_catDone(p,'logic') },
  { id:'polyglot', name:{id:'Poliglot Cilik',en:'Little Polyglot'}, icon:'globe', check:(p)=>_catDone(p,'english') },
  { id:'level_10', name:{id:'Level 10',en:'Level 10'}, icon:'badge10', check:(p)=>p.level>=10 },
  { id:'level_25', name:{id:'Level 25',en:'Level 25'}, icon:'badge25', check:(p)=>p.level>=25 },
  { id:'level_50', name:{id:'Level 50',en:'Level 50'}, icon:'badge50', check:(p)=>p.level>=50 },
  { id:'explorer', name:{id:'Penjelajah',en:'Explorer'}, icon:'compass', check:(p)=>{ const c=new Set(); for(let k in p.lessons){ if(p.lessons[k].completed){ const l=ALL_LESSONS.find(x=>x.id===k); if(l) c.add(l.cat); } } return c.size>=7; } },
  { id:'perfect', name:{id:'Sempurna',en:'Perfectionist'}, icon:'trophy', check:(p)=>{ for(let k in p.lessons){ if(p.lessons[k].bestScore>=100) return true; } return false; } },
  { id:'speed', name:{id:'Kilat',en:'Lightning'}, icon:'lightning', check:(p)=>{ for(let k in p.lessons){ if(p.lessons[k].bestTime&&p.lessons[k].bestTime<=60) return true; } return false; } },
  { id:'combo_king', name:{id:'Raja Kombo',en:'Combo King'}, icon:'flame', check:(p)=>{ for(let k in p.lessons){ if(p.lessons[k].bestCombo>=10) return true; } return false; } },
  { id:'best_friend', name:{id:'Sahabat Dacorta',en:"Dacorta's Best Friend"}, icon:'heart', check:(p)=>p.totalLessonsCompleted>=37 }
];

function _catDone(p,cat){ return ALL_LESSONS.filter(l=>l.cat===cat).every(l=>p.lessons[l.id]&&p.lessons[l.id].completed); }

const STICKERS = [
  {id:'stk_cat',name:{id:'Kucing',en:'Cat'},icon:'cat'},{id:'stk_dog',name:{id:'Anjing',en:'Dog'},icon:'dog'},
  {id:'stk_rabbit',name:{id:'Kelinci',en:'Rabbit'},icon:'rabbit'},{id:'stk_bear',name:{id:'Beruang',en:'Bear'},icon:'bear'},
  {id:'stk_elephant',name:{id:'Gajah',en:'Elephant'},icon:'elephant'},{id:'stk_lion',name:{id:'Singa',en:'Lion'},icon:'lion'},
  {id:'stk_bird',name:{id:'Burung',en:'Bird'},icon:'bird'},{id:'stk_fish',name:{id:'Ikan',en:'Fish'},icon:'fish'},
  {id:'stk_butterfly',name:{id:'Kupu-kupu',en:'Butterfly'},icon:'butterfly'},{id:'stk_turtle',name:{id:'Kura-kura',en:'Turtle'},icon:'turtle'},
  {id:'stk_apple',name:{id:'Apel',en:'Apple'},icon:'apple'},{id:'stk_banana',name:{id:'Pisang',en:'Banana'},icon:'banana'},
  {id:'stk_strawberry',name:{id:'Stroberi',en:'Strawberry'},icon:'strawberry'},{id:'stk_watermelon',name:{id:'Semangka',en:'Watermelon'},icon:'watermelon'},
  {id:'stk_grape',name:{id:'Anggur',en:'Grape'},icon:'grape'},{id:'stk_star',name:{id:'Bintang',en:'Star'},icon:'starSticker'},
  {id:'stk_moon',name:{id:'Bulan',en:'Moon'},icon:'moon'},{id:'stk_sun',name:{id:'Matahari',en:'Sun'},icon:'sun'},
  {id:'stk_rainbow',name:{id:'Pelangi',en:'Rainbow'},icon:'rainbow'},{id:'stk_cloud',name:{id:'Awan',en:'Cloud'},icon:'cloud'},
  {id:'stk_heart',name:{id:'Hati',en:'Heart'},icon:'heartSticker'},{id:'stk_diamond',name:{id:'Berlian',en:'Diamond'},icon:'diamond'},
  {id:'stk_rocket',name:{id:'Roket',en:'Rocket'},icon:'rocket'},{id:'stk_planet',name:{id:'Planet',en:'Planet'},icon:'planet'},
  {id:'stk_flower',name:{id:'Bunga',en:'Flower'},icon:'flower'},{id:'stk_tree',name:{id:'Pohon',en:'Tree'},icon:'tree'},
  {id:'stk_car',name:{id:'Mobil',en:'Car'},icon:'car'},{id:'stk_airplane',name:{id:'Pesawat',en:'Airplane'},icon:'airplane'},
  {id:'stk_boat',name:{id:'Kapal',en:'Boat'},icon:'boat'},{id:'stk_crown',name:{id:'Mahkota',en:'Crown'},icon:'crownSticker'}
];

const OUTFITS = [
  {id:'none',name:{id:'Biasa',en:'Default'},level:0},{id:'graduation',name:{id:'Wisuda',en:'Graduation'},level:3},
  {id:'glasses',name:{id:'Kacamata',en:'Glasses'},level:5},{id:'crown',name:{id:'Mahkota',en:'Crown'},level:8},
  {id:'cape',name:{id:'Jubah',en:'Cape'},level:12},{id:'wizard',name:{id:'Penyihir',en:'Wizard'},level:16},
  {id:'headband',name:{id:'Bandana',en:'Headband'},level:20},{id:'bowtie',name:{id:'Dasi Kupu',en:'Bowtie'},level:24},
  {id:'superhero',name:{id:'Superhero',en:'Superhero'},level:30},{id:'astronaut',name:{id:'Astronaut',en:'Astronaut'},level:35},
  {id:'king',name:{id:'Raja',en:'King'},level:42},{id:'legend',name:{id:'Legenda',en:'Legend'},level:50}
];

const TRACE_PATHS = {
  'A':[[[.15,.95],[.5,.05],[.85,.95]],[[.3,.55],[.7,.55]]],'B':[[[.2,.95],[.2,.05],[.65,.05],[.75,.15],[.75,.25],[.65,.38],[.2,.38]],[[.2,.38],[.7,.38],[.8,.5],[.8,.65],[.7,.78],[.65,.82],[.2,.82]]],'C':[[[.8,.2],[.65,.08],[.45,.05],[.3,.12],[.2,.3],[.18,.5],[.2,.7],[.3,.85],[.45,.92],[.65,.92],[.8,.8]]],'D':[[[.2,.95],[.2,.05],[.5,.05],[.7,.15],[.82,.35],[.82,.65],[.7,.85],[.5,.95],[.2,.95]]],'E':[[[.75,.05],[.2,.05],[.2,.5],[.65,.5]],[[.2,.5],[.2,.95],[.75,.95]]],'F':[[[.75,.05],[.2,.05],[.2,.5],[.6,.5]],[[.2,.5],[.2,.95]]],'G':[[[.8,.2],[.6,.05],[.4,.05],[.25,.15],[.18,.35],[.18,.65],[.25,.85],[.4,.95],[.65,.95],[.8,.8],[.8,.5],[.55,.5]]],'H':[[[.2,.05],[.2,.95]],[[.8,.05],[.8,.95]],[[.2,.5],[.8,.5]]],'I':[[[.35,.05],[.65,.05]],[[.5,.05],[.5,.95]],[[.35,.95],[.65,.95]]],'J':[[[.4,.05],[.75,.05]],[[.6,.05],[.6,.75],[.5,.9],[.35,.95],[.25,.85]]],'K':[[[.2,.05],[.2,.95]],[[.75,.05],[.2,.5],[.75,.95]]],'L':[[[.2,.05],[.2,.95],[.75,.95]]],'M':[[[.15,.95],[.15,.05],[.5,.5],[.85,.05],[.85,.95]]],'N':[[[.2,.95],[.2,.05],[.8,.95],[.8,.05]]],'O':[[[.5,.05],[.3,.08],[.18,.25],[.15,.5],[.18,.75],[.3,.92],[.5,.95],[.7,.92],[.82,.75],[.85,.5],[.82,.25],[.7,.08],[.5,.05]]],'P':[[[.2,.95],[.2,.05],[.6,.05],[.78,.15],[.78,.32],[.6,.45],[.2,.45]]],'Q':[[[.5,.05],[.3,.08],[.18,.25],[.15,.5],[.18,.75],[.3,.88],[.5,.9],[.7,.88],[.82,.75],[.85,.5],[.82,.25],[.7,.08],[.5,.05]],[[.6,.75],[.85,.98]]],'R':[[[.2,.95],[.2,.05],[.6,.05],[.78,.15],[.78,.32],[.6,.45],[.2,.45]],[[.55,.45],[.8,.95]]],'S':[[[.75,.15],[.6,.05],[.4,.05],[.22,.15],[.2,.3],[.25,.42],[.5,.5],[.75,.58],[.8,.72],[.75,.88],[.6,.95],[.4,.95],[.25,.85]]],'T':[[[.15,.05],[.85,.05]],[[.5,.05],[.5,.95]]],'U':[[[.2,.05],[.2,.7],[.3,.88],[.5,.95],[.7,.88],[.8,.7],[.8,.05]]],'V':[[[.15,.05],[.5,.95],[.85,.05]]],'W':[[[.1,.05],[.3,.95],[.5,.4],[.7,.95],[.9,.05]]],'X':[[[.15,.05],[.85,.95]],[[.85,.05],[.15,.95]]],'Y':[[[.15,.05],[.5,.5],[.85,.05]],[[.5,.5],[.5,.95]]],'Z':[[[.15,.05],[.85,.05],[.15,.95],[.85,.95]]],'0':[[[.5,.05],[.3,.08],[.18,.25],[.15,.5],[.18,.75],[.3,.92],[.5,.95],[.7,.92],[.82,.75],[.85,.5],[.82,.25],[.7,.08],[.5,.05]],[[.3,.2],[.7,.8]]],'1':[[[.35,.2],[.5,.05],[.5,.95]],[[.3,.95],[.7,.95]]],'2':[[[.2,.2],[.3,.08],[.5,.05],[.7,.08],[.78,.2],[.78,.35],[.2,.95],[.8,.95]]],'3':[[[.2,.1],[.4,.05],[.65,.05],[.78,.15],[.78,.32],[.65,.45],[.45,.48]],[[.45,.48],[.65,.52],[.82,.65],[.82,.82],[.65,.95],[.4,.95],[.2,.88]]],'4':[[[.65,.95],[.65,.05],[.15,.65],[.85,.65]]],'5':[[[.75,.05],[.25,.05],[.2,.45],[.5,.4],[.72,.48],[.8,.65],[.72,.85],[.5,.95],[.3,.9]]],'6':[[[.7,.1],[.5,.05],[.3,.12],[.18,.35],[.15,.6],[.2,.8],[.35,.95],[.55,.95],[.72,.85],[.75,.65],[.68,.5],[.5,.45],[.3,.5],[.2,.6]]],'7':[[[.15,.05],[.85,.05],[.45,.95]]],'8':[[[.5,.48],[.3,.38],[.22,.22],[.3,.08],[.5,.05],[.7,.08],[.78,.22],[.7,.38],[.5,.48]],[[.5,.48],[.28,.6],[.18,.75],[.25,.9],[.5,.95],[.75,.9],[.82,.75],[.72,.6],[.5,.48]]],'9':[[[.75,.4],[.68,.22],[.5,.05],[.32,.08],[.22,.22],[.2,.38],[.28,.5],[.5,.55],[.72,.48],[.82,.35],[.82,.6],[.75,.85],[.55,.95],[.35,.9]]],'10':[[[.15,.2],[.25,.05],[.25,.95]],[[.55,.05],[.45,.1],[.4,.3],[.4,.7],[.45,.9],[.55,.95],[.65,.95],[.75,.9],[.8,.7],[.8,.3],[.75,.1],[.65,.05],[.55,.05]]]
};

/* ================================================
   SECTION 5: STORAGE & UTILITIES
   ================================================ */

const Store = {
  get(key){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):null; }catch(e){ return null; } },
  set(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} },
  del(key){ try{ localStorage.removeItem(key); }catch(e){} },
  nuke(){ Object.values(KEYS).forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} }); }
};

function $(sel){ return document.querySelector(sel); }
function $$(sel){ return document.querySelectorAll(sel); }
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function greetingKey(){ const h=new Date().getHours(); if(h<11) return 'greeting_morning'; if(h<15) return 'greeting_afternoon'; if(h<18) return 'greeting_evening'; return 'greeting_night'; }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function levelFromXP(xp){ for(let i=XP_TABLE.length-1;i>=0;i--){ if(xp>=XP_TABLE[i]) return i+1; } return 1; }
function xpForLevel(lv){ return XP_TABLE[lv]||XP_TABLE[XP_TABLE.length-1]; }
function xpForCurrentLevel(lv){ return lv<=1?0:(XP_TABLE[lv-1]||0); }
function calcStars(pct){ if(pct>=90) return 3; if(pct>=70) return 2; if(pct>=50) return 1; return 0; }
function optionCount(tier){ if(tier==='toddler') return 2; if(tier==='preschool') return 3; return 4; }
function lessonsForCat(cat){ return ALL_LESSONS.filter(l=>l.cat===cat).sort((a,b)=>a.order-b.order); }
function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }

function defaultProfile(){ return { name:'', ageTier:'preschool', createdAt:todayStr() }; }
function defaultProgress(){ return { xp:0, level:1, totalStars:0, totalLessonsCompleted:0, streak:{current:0,longest:0,lastDate:''}, dailyGoal:{target:1,completed:0,date:todayStr()}, lessons:{}, categories:{} }; }
function defaultSettings(){ let t='light'; if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches) t='dark'; return { language:'id', theme:t, sound:true, setupDone:false }; }
function defaultAchievements(){ return BADGES.map(b=>({id:b.id,unlocked:false,unlockedAt:null})); }
function defaultStickers(){ return STICKERS.map(s=>({id:s.id,name:s.name,unlocked:false,unlockedAt:null})); }
function defaultOutfits(){ return OUTFITS.map(o=>({id:o.id,name:o.name,unlocked:o.id==='none',equipped:o.id==='none',unlockedAt:o.id==='none'?todayStr():null})); }
function defaultCalendar(){ return []; }

function isLessonUnlocked(lid,prog){
  const ls=ALL_LESSONS.find(l=>l.id===lid); if(!ls) return false;
  if(ls.cat==='typing'){ if(prog.totalLessonsCompleted<NON_TYPING_COUNT) return false; if(ls.order===1) return true; const pv=ALL_LESSONS.find(l=>l.cat==='typing'&&l.order===ls.order-1); return pv&&prog.lessons[pv.id]&&prog.lessons[pv.id].completed; }
  if(ls.order===1) return true;
  const pv=ALL_LESSONS.find(l=>l.cat===ls.cat&&l.order===ls.order-1);
  return pv&&prog.lessons[pv.id]&&prog.lessons[pv.id].completed;
}

function getNextLesson(prog){
  for(const l of ALL_LESSONS){ if(l.cat==='typing') continue; if(!prog.lessons[l.id]||!prog.lessons[l.id].completed){ if(isLessonUnlocked(l.id,prog)) return l; } }
  for(const l of ALL_LESSONS.filter(x=>x.cat==='typing')){ if(!prog.lessons[l.id]||!prog.lessons[l.id].completed){ if(isLessonUnlocked(l.id,prog)) return l; } }
  return null;
}

function getNextLessonAfter(cid){
  const c=ALL_LESSONS.find(l=>l.id===cid); if(!c) return null;
  const cl=lessonsForCat(c.cat); const i=cl.findIndex(l=>l.id===cid);
  return (i>=0&&i<cl.length-1)?cl[i+1]:null;
}

function updateStreak(prog){
  const today=todayStr(); if(prog.streak.lastDate===today) return;
  const y=new Date(); y.setDate(y.getDate()-1);
  const yS=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  if(prog.streak.lastDate===yS) prog.streak.current+=1;
  else prog.streak.current=1;
  if(prog.streak.current>prog.streak.longest) prog.streak.longest=prog.streak.current;
  prog.streak.lastDate=today;
}

function updateDailyGoal(prog){ const t=todayStr(); if(prog.dailyGoal.date!==t){ prog.dailyGoal.date=t; prog.dailyGoal.completed=0; } prog.dailyGoal.completed+=1; }
function updateCalendar(cal,xp){ const t=todayStr(); const e=cal.find(c=>c.date===t); if(e){ e.lessonsCompleted+=1; e.xpEarned+=xp; } else cal.push({date:t,lessonsCompleted:1,xpEarned:xp}); }

/* ================================================
   SECTION 6: SVG GENERATORS (Dacorta + Icons)
   ================================================ */

const Dacorta = {
  svg(expr,outfit){
    expr=expr||'happy'; outfit=outfit||'none';
    const e=this._expr[expr]||this._expr.happy;
    const o=this._outfit[outfit]||'';
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="90" rx="32" ry="25" fill="#FFF" stroke="#2D2D2D" stroke-width="2"/><ellipse cx="60" cy="88" rx="18" ry="14" fill="#F5F5F5"/><ellipse cx="30" cy="82" rx="12" ry="8" fill="#2D2D2D" transform="rotate(-20 30 82)"/><ellipse cx="90" cy="82" rx="12" ry="8" fill="#2D2D2D" transform="rotate(20 90 82)"/><ellipse cx="45" cy="110" rx="10" ry="7" fill="#2D2D2D"/><ellipse cx="75" cy="110" rx="10" ry="7" fill="#2D2D2D"/><circle cx="60" cy="48" r="30" fill="#FFF" stroke="#2D2D2D" stroke-width="2"/><circle cx="36" cy="22" r="12" fill="#2D2D2D"/><circle cx="36" cy="22" r="6" fill="#E0E0E0"/><circle cx="84" cy="22" r="12" fill="#2D2D2D"/><circle cx="84" cy="22" r="6" fill="#E0E0E0"/><ellipse cx="46" cy="44" rx="11" ry="10" fill="#2D2D2D" transform="rotate(-5 46 44)"/><ellipse cx="74" cy="44" rx="11" ry="10" fill="#2D2D2D" transform="rotate(5 74 44)"/>${e.eyes}<ellipse cx="60" cy="55" rx="4" ry="3" fill="#2D2D2D"/>${e.mouth}${e.cheeks||''}${o}</svg>`;
  },
  _expr: {
    happy: { eyes:`<circle cx="46" cy="43" r="4.5" fill="#FFF"/><circle cx="47" cy="42" r="2" fill="#FFF"/><circle cx="74" cy="43" r="4.5" fill="#FFF"/><circle cx="75" cy="42" r="2" fill="#FFF"/>`, mouth:`<path d="M52 59 Q60 67 68 59" fill="none" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"/>`, cheeks:`<circle cx="38" cy="55" r="5" fill="#FFB3B3" opacity="0.5"/><circle cx="82" cy="55" r="5" fill="#FFB3B3" opacity="0.5"/>` },
    sad: { eyes:`<circle cx="46" cy="44" r="4" fill="#FFF"/><circle cx="47" cy="45" r="1.5" fill="#FFF"/><circle cx="74" cy="44" r="4" fill="#FFF"/><circle cx="75" cy="45" r="1.5" fill="#FFF"/><ellipse cx="40" cy="52" rx="2" ry="3" fill="#87CEEB" opacity="0.7"/><ellipse cx="80" cy="52" rx="2" ry="3" fill="#87CEEB" opacity="0.7"/>`, mouth:`<path d="M52 63 Q60 57 68 63" fill="none" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"/>`, cheeks:'' },
    proud: { eyes:`<path d="M42 42 Q46 38 50 42" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round"/><path d="M70 42 Q74 38 78 42" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>`, mouth:`<path d="M48 58 Q60 70 72 58" fill="#FF8C8C" stroke="#2D2D2D" stroke-width="1.5"/>`, cheeks:`<circle cx="38" cy="55" r="6" fill="#FFB3B3" opacity="0.6"/><circle cx="82" cy="55" r="6" fill="#FFB3B3" opacity="0.6"/><g fill="#FFD700"><polygon points="22,30 24,26 26,30"/><polygon points="96,28 98,24 100,28"/></g>` },
    idle: { eyes:`<path d="M42 44 L50 44" stroke="#FFF" stroke-width="3" stroke-linecap="round"/><path d="M70 44 L78 44" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>`, mouth:`<path d="M54 60 Q60 62 66 60" fill="none" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round"/><g fill="#A0A0C0" opacity="0.6"><text x="88" y="32" font-size="10" font-weight="bold">z</text><text x="95" y="24" font-size="8" font-weight="bold">z</text><text x="100" y="18" font-size="6" font-weight="bold">z</text></g>`, cheeks:'' }
  },
  _outfit: {
    none:'',
    graduation:`<rect x="38" y="12" width="44" height="5" rx="1" fill="#2D2D2D"/><polygon points="60,2 38,14 82,14" fill="#333"/><line x1="75" y1="14" x2="80" y2="25" stroke="#FFD700" stroke-width="1.5"/><circle cx="80" cy="26" r="3" fill="#FFD700"/>`,
    glasses:`<circle cx="46" cy="44" r="13" fill="none" stroke="#8B4513" stroke-width="2.5"/><circle cx="74" cy="44" r="13" fill="none" stroke="#8B4513" stroke-width="2.5"/><line x1="59" y1="44" x2="61" y2="44" stroke="#8B4513" stroke-width="2.5"/><line x1="33" y1="42" x2="28" y2="36" stroke="#8B4513" stroke-width="2"/><line x1="87" y1="42" x2="92" y2="36" stroke="#8B4513" stroke-width="2"/>`,
    crown:`<polygon points="40,20 43,8 50,16 55,4 60,18 65,4 70,16 77,8 80,20" fill="#FFD700" stroke="#DAA520" stroke-width="1"/><circle cx="55" cy="10" r="2" fill="#F44"/><circle cx="65" cy="10" r="2" fill="#4169E1"/><circle cx="60" cy="6" r="2.5" fill="#32CD32"/>`,
    cape:`<path d="M32 75 Q28 95 20 115 L60 105 L100 115 Q92 95 88 75" fill="#DC143C" stroke="#8B0000" stroke-width="1.5" opacity="0.9"/>`,
    wizard:`<polygon points="60,0 35,28 85,28" fill="#4B0082" stroke="#6A0DAD" stroke-width="1.5"/><ellipse cx="60" cy="28" rx="28" ry="5" fill="#4B0082"/><circle cx="55" cy="12" r="2" fill="#FFD700"/><circle cx="65" cy="8" r="1.5" fill="#FFD700"/><circle cx="58" cy="18" r="2.5" fill="#FFD700"/>`,
    headband:`<path d="M32 38 Q60 30 88 38" fill="none" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/><circle cx="38" cy="34" r="4" fill="#F44"/><circle cx="82" cy="34" r="4" fill="#F44"/>`,
    bowtie:`<polygon points="48,72 60,68 60,76 48,72" fill="#FF6347"/><polygon points="72,72 60,68 60,76 72,72" fill="#FF6347"/><circle cx="60" cy="72" r="3" fill="#FF4500"/>`,
    superhero:`<path d="M30 75 Q25 100 15 118 L60 108 L105 118 Q95 100 90 75" fill="#1E90FF"/><path d="M36 40 Q42 34 48 40 L50 44 Q46 48 42 44Z" fill="#1E90FF"/><path d="M84 40 Q78 34 72 40 L70 44 Q74 48 78 44Z" fill="#1E90FF"/><circle cx="60" cy="85" r="8" fill="#FFD700"/><text x="56" y="89" font-size="12" font-weight="bold" fill="#1E90FF">S</text>`,
    astronaut:`<circle cx="60" cy="46" r="34" fill="none" stroke="#C0C0C0" stroke-width="3"/><path d="M42 38 Q50 32 62 36" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/><line x1="60" y1="12" x2="60" y2="4" stroke="#C0C0C0" stroke-width="2"/><circle cx="60" cy="3" r="3" fill="#F44"/>`,
    king:`<polygon points="38,18 42,4 48,14 54,0 60,16 66,0 72,14 78,4 82,18" fill="#FFD700" stroke="#B8860B" stroke-width="1.5"/><rect x="38" y="16" width="44" height="6" rx="2" fill="#FFD700"/><circle cx="50" cy="19" r="2.5" fill="red"/><circle cx="60" cy="18" r="3" fill="#4169E1"/><circle cx="70" cy="19" r="2.5" fill="#32CD32"/><path d="M28 72 Q22 100 12 118 L60 106 L108 118 Q98 100 92 72" fill="#800080"/>`,
    legend:`<ellipse cx="60" cy="65" rx="52" ry="55" fill="none" stroke="#FFD700" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 3"/><path d="M20 75 Q0 55 10 35 Q20 50 30 65 Q22 55 15 40 Q25 55 32 70" fill="#FFE4B5" stroke="#DAA520" stroke-width="1" opacity="0.8"/><path d="M100 75 Q120 55 110 35 Q100 50 90 65 Q98 55 105 40 Q95 55 88 70" fill="#FFE4B5" stroke="#DAA520" stroke-width="1" opacity="0.8"/><ellipse cx="60" cy="14" rx="16" ry="5" fill="none" stroke="#FFD700" stroke-width="2.5" opacity="0.8"/><g fill="#FFD700"><polygon points="14,50 16,46 18,50"/><polygon points="104,48 106,44 108,48"/><polygon points="60,0 61,4 62,0"/></g>`
  }
};

const Icons = {
  star(f,s){ s=s||24; const c=f?'#FFD700':'var(--star-empty,#E0D5C0)'; const st=f?'#DAA520':c; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${c}" stroke="${st}" stroke-width="1" stroke-linejoin="round"/></svg>`; },
  check(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="11" fill="#4CAF50"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`; },
  cross(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="11" fill="#FF7043"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/></svg>`; },
  lock(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><rect x="5" y="11" width="14" height="10" rx="2" fill="var(--text-tertiary,#999)" opacity="0.5"/><path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="var(--text-tertiary,#999)" stroke-width="2" opacity="0.5"/></svg>`; },
  fire(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 23c-4.97 0-7-3.22-7-7 0-3.5 2.5-6.5 4-8 .3 2.5 2 4 3.5 5 1.5-2 2.5-5 2.5-8 2 3 4 6.5 4 11 0 3.78-2.03 7-7 7z" fill="#FF6B35"/><path d="M12 23c-2.5 0-4-1.8-4-4 0-2 1.5-3.5 2.5-4.5.2 1.5 1.2 2.5 2 3 1-1.2 1.5-3 1.5-5 1.2 1.8 2 3.8 2 6.5 0 2.2-1.5 4-4 4z" fill="#FFD700"/></svg>`; },
  book(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" fill="none" stroke="var(--accent,#FF8C42)" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill="none" stroke="var(--accent,#FF8C42)" stroke-width="2"/></svg>`; },
  xpIcon(s){ s=s||24; return `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="#7C4DFF" opacity="0.9"/></svg>`; },
  catIcon(cat,s){ s=s||28; const m={math:`<text x="14" y="19" text-anchor="middle" font-size="14" font-weight="bold" fill="${CAT_COLORS.math}">+1</text>`,read:`<text x="14" y="19" text-anchor="middle" font-size="13" font-weight="bold" fill="${CAT_COLORS.read}" font-family="serif">Aa</text>`,write:`<path d="M8 20L18 6" stroke="${CAT_COLORS.write}" stroke-width="2.5" stroke-linecap="round"/><path d="M17 5l3 1-2 3" fill="${CAT_COLORS.write}"/>`,intro:`<circle cx="14" cy="12" r="5" fill="none" stroke="${CAT_COLORS.intro}" stroke-width="2"/><path d="M14 19v3M10 24h8" stroke="${CAT_COLORS.intro}" stroke-width="2" stroke-linecap="round"/>`,logic:`<circle cx="10" cy="11" r="4" fill="none" stroke="${CAT_COLORS.logic}" stroke-width="2"/><circle cx="18" cy="17" r="4" fill="none" stroke="${CAT_COLORS.logic}" stroke-width="2"/>`,english:`<text x="14" y="19" text-anchor="middle" font-size="13" font-weight="bold" fill="${CAT_COLORS.english}">EN</text>`,typing:`<rect x="5" y="10" width="18" height="12" rx="2" fill="none" stroke="${CAT_COLORS.typing}" stroke-width="2"/><line x1="9" y1="14" x2="11" y2="14" stroke="${CAT_COLORS.typing}" stroke-width="1.5"/><line x1="13" y1="14" x2="15" y2="14" stroke="${CAT_COLORS.typing}" stroke-width="1.5"/><line x1="8" y1="18" x2="20" y2="18" stroke="${CAT_COLORS.typing}" stroke-width="1.5"/>`}; return `<svg viewBox="0 0 28 28" width="${s}" height="${s}"><rect x="3" y="3" width="22" height="22" rx="4" fill="${CAT_COLORS[cat]||CAT_COLORS.math}" opacity="0.15"/>${m[cat]||m.math}</svg>`; },
  badgeIcon(icon,s){ s=s||48; const b={footprint:`<circle cx="24" cy="24" r="22" fill="#E8F5E9" stroke="#4CAF50" stroke-width="2"/><ellipse cx="20" cy="28" rx="5" ry="7" fill="#4CAF50"/><ellipse cx="30" cy="26" rx="4" ry="6" fill="#4CAF50"/><circle cx="15" cy="19" r="3" fill="#4CAF50"/><circle cx="22" cy="16" r="2.5" fill="#4CAF50"/><circle cx="29" cy="16" r="2.5" fill="#4CAF50"/><circle cx="35" cy="19" r="3" fill="#4CAF50"/>`,fire:`<circle cx="24" cy="24" r="22" fill="#FFF3E0" stroke="#FF6B35" stroke-width="2"/><path d="M24 38c-6 0-9-4-9-9 0-4.5 3-8 5-10 .3 3 2.5 5 4.5 6.5 2-2.5 3-6 3-10 2.5 3.5 5.5 8 5.5 13.5 0 5-2.5 9-9 9z" fill="#FF6B35"/><path d="M24 38c-3 0-5-2.2-5-5 0-2.5 2-4.5 3-5.5.2 2 1.5 3 2.5 4 1.2-1.5 2-3.8 2-6.5 1.5 2.2 2.5 5 2.5 8 0 3-2 5-5 5z" fill="#FFD700"/>`,star3:`<circle cx="24" cy="24" r="22" fill="#FFFDE7" stroke="#FFD700" stroke-width="2"/><polygon points="24,8 28,18 38,18 30,24 33,34 24,28 15,34 18,24 10,18 20,18" fill="#FFD700"/>`,stars:`<circle cx="24" cy="24" r="22" fill="#FFFDE7" stroke="#FFC107" stroke-width="2"/><polygon points="16,12 18,18 24,18 19,22 21,28 16,24 11,28 13,22 8,18 14,18" fill="#FFD700"/><polygon points="32,12 34,18 40,18 35,22 37,28 32,24 27,28 29,22 24,18 30,18" fill="#FFD700"/>`,calculator:`<circle cx="24" cy="24" r="22" fill="#FFEBEE" stroke="#FF6B6B" stroke-width="2"/><rect x="14" y="10" width="20" height="28" rx="3" fill="#FF6B6B" opacity="0.2"/><rect x="16" y="12" width="16" height="8" rx="2" fill="#FF6B6B"/>`,book:`<circle cx="24" cy="24" r="22" fill="#E0F7FA" stroke="#4ECDC4" stroke-width="2"/><rect x="14" y="12" width="20" height="24" rx="2" fill="#4ECDC4" opacity="0.3"/><line x1="18" y1="18" x2="30" y2="18" stroke="#4ECDC4" stroke-width="2"/>`,pencil:`<circle cx="24" cy="24" r="22" fill="#E1F5FE" stroke="#45B7D1" stroke-width="2"/><path d="M14 34L30 10" stroke="#45B7D1" stroke-width="4" stroke-linecap="round"/>`,palette:`<circle cx="24" cy="24" r="22" fill="#F3E5F5" stroke="#9B59B6" stroke-width="2"/><ellipse cx="24" cy="24" rx="14" ry="12" fill="#E1BEE7"/><circle cx="18" cy="20" r="3" fill="#FF6B6B"/><circle cx="26" cy="18" r="3" fill="#4ECDC4"/><circle cx="30" cy="24" r="3" fill="#FFD700"/>`,paw:`<circle cx="24" cy="24" r="22" fill="#E8F5E9" stroke="#96CEB4" stroke-width="2"/><ellipse cx="24" cy="30" rx="8" ry="6" fill="#96CEB4"/><circle cx="16" cy="22" r="4" fill="#96CEB4"/><circle cx="32" cy="22" r="4" fill="#96CEB4"/>`,brain:`<circle cx="24" cy="24" r="22" fill="#FFF8E1" stroke="#F0A500" stroke-width="2"/><path d="M24 38V22M18 16c-4 0-6 4-6 8s4 8 6 10M30 16c4 0 6 4 6 8s-4 8-6 10" fill="none" stroke="#F0A500" stroke-width="2.5" stroke-linecap="round"/>`,globe:`<circle cx="24" cy="24" r="22" fill="#EDE7F6" stroke="#9B59B6" stroke-width="2"/><circle cx="24" cy="24" r="13" fill="none" stroke="#9B59B6" stroke-width="2"/><ellipse cx="24" cy="24" rx="6" ry="13" fill="none" stroke="#9B59B6" stroke-width="1.5"/>`,badge10:`<circle cx="24" cy="24" r="22" fill="#E3F2FD" stroke="#2196F3" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#2196F3">10</text>`,badge25:`<circle cx="24" cy="24" r="22" fill="#E8EAF6" stroke="#3F51B5" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#3F51B5">25</text>`,badge50:`<circle cx="24" cy="24" r="22" fill="#FCE4EC" stroke="#E91E63" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#E91E63">50</text>`,compass:`<circle cx="24" cy="24" r="22" fill="#E0F2F1" stroke="#009688" stroke-width="2"/><circle cx="24" cy="24" r="13" fill="none" stroke="#009688" stroke-width="2"/><polygon points="24,12 27,24 24,28 21,24" fill="#FF5722"/><polygon points="24,36 21,24 24,20 27,24" fill="#009688"/>`,trophy:`<circle cx="24" cy="24" r="22" fill="#FFFDE7" stroke="#FFC107" stroke-width="2"/><path d="M16 12h16v8c0 5-4 10-8 10s-8-5-8-10v-8z" fill="#FFD700"/>`,lightning:`<circle cx="24" cy="24" r="22" fill="#FFF9C4" stroke="#FDD835" stroke-width="2"/><polygon points="26,8 14,26 22,26 18,40 34,20 26,20" fill="#FDD835"/>`,flame:`<circle cx="24" cy="24" r="22" fill="#FBE9E7" stroke="#FF5722" stroke-width="2"/><path d="M24 38c-7 0-10-4.5-10-10 0-5 3.5-9 5.5-11 .5 3.5 3 5.5 5 7 2-2.8 3-6.5 3-11 3 4 6 9 6 15 0 5.5-3 10-9.5 10z" fill="#FF5722"/>`,heart:`<circle cx="24" cy="24" r="22" fill="#FCE4EC" stroke="#E91E63" stroke-width="2"/><path d="M24 36C14 28 8 22 8 16 8 12 12 8 16 8c3 0 5 1.5 8 5 3-3.5 5-5 8-5 4 0 8 4 8 8 0 6-6 12-16 20z" fill="#E91E63"/>`}; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}">${b[icon]||b.footprint}</svg>`; },
  stickerIcon(icon,s){ s=s||48; const st={cat:`<circle cx="24" cy="28" r="14" fill="#FFB74D"/><polygon points="12,16 14,6 20,14" fill="#FFB74D"/><polygon points="36,16 34,6 28,14" fill="#FFB74D"/><circle cx="19" cy="25" r="2.5" fill="#5D4037"/><circle cx="29" cy="25" r="2.5" fill="#5D4037"/><ellipse cx="24" cy="30" rx="2" ry="1.5" fill="#E91E63"/>`,dog:`<circle cx="24" cy="28" r="14" fill="#A1887F"/><ellipse cx="14" cy="18" rx="6" ry="10" fill="#8D6E63" transform="rotate(-15 14 18)"/><ellipse cx="34" cy="18" rx="6" ry="10" fill="#8D6E63" transform="rotate(15 34 18)"/><circle cx="19" cy="25" r="2.5" fill="#3E2723"/><circle cx="29" cy="25" r="2.5" fill="#3E2723"/>`,rabbit:`<circle cx="24" cy="30" r="13" fill="#F5F5F5"/><ellipse cx="18" cy="10" rx="5" ry="14" fill="#F5F5F5"/><ellipse cx="18" cy="10" rx="3" ry="10" fill="#FFCDD2"/><ellipse cx="30" cy="10" rx="5" ry="14" fill="#F5F5F5"/><ellipse cx="30" cy="10" rx="3" ry="10" fill="#FFCDD2"/><circle cx="19" cy="27" r="2" fill="#E91E63"/><circle cx="29" cy="27" r="2" fill="#E91E63"/>`,bear:`<circle cx="24" cy="28" r="14" fill="#8D6E63"/><circle cx="14" cy="16" r="6" fill="#8D6E63"/><circle cx="34" cy="16" r="6" fill="#8D6E63"/><circle cx="19" cy="25" r="2.5" fill="#3E2723"/><circle cx="29" cy="25" r="2.5" fill="#3E2723"/>`,elephant:`<circle cx="24" cy="26" r="15" fill="#90A4AE"/><circle cx="12" cy="20" r="8" fill="#90A4AE"/><circle cx="36" cy="20" r="8" fill="#90A4AE"/><circle cx="19" cy="22" r="2" fill="#37474F"/><circle cx="29" cy="22" r="2" fill="#37474F"/>`,lion:`<circle cx="24" cy="26" r="18" fill="#FF8F00"/><circle cx="24" cy="28" r="12" fill="#FFB74D"/><circle cx="19" cy="25" r="2.5" fill="#5D4037"/><circle cx="29" cy="25" r="2.5" fill="#5D4037"/>`,bird:`<ellipse cx="24" cy="26" rx="12" ry="14" fill="#4FC3F7"/><circle cx="20" cy="22" r="2" fill="#1A237E"/><polygon points="14,26 6,24 14,28" fill="#FF8F00"/>`,fish:`<ellipse cx="22" cy="24" rx="14" ry="10" fill="#42A5F5"/><polygon points="36,24 46,16 46,32" fill="#42A5F5"/><circle cx="16" cy="22" r="2.5" fill="#FFF"/>`,butterfly:`<ellipse cx="16" cy="18" rx="10" ry="8" fill="#E040FB" opacity="0.7"/><ellipse cx="32" cy="18" rx="10" ry="8" fill="#7C4DFF" opacity="0.7"/><ellipse cx="16" cy="32" rx="8" ry="7" fill="#FF4081" opacity="0.7"/><ellipse cx="32" cy="32" rx="8" ry="7" fill="#448AFF" opacity="0.7"/><ellipse cx="24" cy="26" rx="2" ry="10" fill="#5D4037"/>`,turtle:`<ellipse cx="24" cy="28" rx="16" ry="12" fill="#66BB6A"/><ellipse cx="24" cy="28" rx="12" ry="8" fill="#81C784"/><circle cx="36" cy="22" r="5" fill="#A5D6A7"/><circle cx="37" cy="21" r="1.5" fill="#2E7D32"/>`,apple:`<path d="M24 40C14 40 8 32 8 24C8 16 14 10 20 10Q24 8 28 10C34 10 40 16 40 24C40 32 34 40 24 40" fill="#F44336"/><path d="M24 10Q26 4 30 6" stroke="#4CAF50" stroke-width="2" fill="none"/>`,banana:`<path d="M16 8Q10 20 14 32Q18 42 32 42Q28 36 26 28Q24 18 28 8Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/>`,strawberry:`<path d="M24 42C14 36 10 28 10 20Q10 12 24 10Q38 12 38 20C38 28 34 36 24 42" fill="#F44336"/><ellipse cx="24" cy="8" rx="8" ry="4" fill="#4CAF50"/>`,watermelon:`<path d="M6 32Q24 6 42 32Z" fill="#4CAF50"/><path d="M8 32Q24 10 40 32Z" fill="#F44336"/><circle cx="20" cy="24" r="1.5" fill="#2E7D32"/><circle cx="28" cy="24" r="1.5" fill="#2E7D32"/>`,grape:`<circle cx="20" cy="16" r="5" fill="#7B1FA2"/><circle cx="28" cy="16" r="5" fill="#7B1FA2"/><circle cx="16" cy="24" r="5" fill="#9C27B0"/><circle cx="24" cy="24" r="5" fill="#9C27B0"/><circle cx="32" cy="24" r="5" fill="#9C27B0"/><circle cx="20" cy="32" r="5" fill="#AB47BC"/><circle cx="28" cy="32" r="5" fill="#AB47BC"/>`,starSticker:`<polygon points="24,4 29,18 44,18 32,28 36,42 24,33 12,42 16,28 4,18 19,18" fill="#FFD700"/>`,moon:`<path d="M34 8A16 16 0 1 0 34 40A12 12 0 0 1 34 8" fill="#FDD835"/>`,sun:`<circle cx="24" cy="24" r="10" fill="#FFD54F"/><g stroke="#FFD54F" stroke-width="3" stroke-linecap="round"><line x1="24" y1="4" x2="24" y2="10"/><line x1="24" y1="38" x2="24" y2="44"/><line x1="4" y1="24" x2="10" y2="24"/><line x1="38" y1="24" x2="44" y2="24"/></g>`,rainbow:`<path d="M6 38A18 18 0 0 1 42 38" fill="none" stroke="#F44336" stroke-width="3"/><path d="M9 38A15 15 0 0 1 39 38" fill="none" stroke="#FF9800" stroke-width="3"/><path d="M12 38A12 12 0 0 1 36 38" fill="none" stroke="#FFEB3B" stroke-width="3"/><path d="M15 38A9 9 0 0 1 33 38" fill="none" stroke="#4CAF50" stroke-width="3"/>`,cloud:`<circle cx="20" cy="24" r="10" fill="#E3F2FD"/><circle cx="32" cy="24" r="8" fill="#E3F2FD"/><circle cx="26" cy="18" r="9" fill="#E3F2FD"/><rect x="10" y="24" width="30" height="10" rx="5" fill="#E3F2FD"/>`,heartSticker:`<path d="M24 40C12 30 4 24 4 16C4 10 10 6 16 6c4 0 6 2 8 5 2-3 4-5 8-5 6 0 12 4 12 10 0 8-8 14-20 24z" fill="#E91E63"/>`,diamond:`<polygon points="24,4 40,18 24,44 8,18" fill="#4FC3F7" stroke="#0288D1" stroke-width="1.5"/>`,rocket:`<path d="M24 4C18 12 16 24 16 32L24 36L32 32C32 24 30 12 24 4z" fill="#E0E0E0"/><circle cx="24" cy="20" r="4" fill="#42A5F5"/><path d="M20 36Q24 44 28 36" fill="#FF5722"/>`,planet:`<circle cx="24" cy="24" r="14" fill="#7E57C2"/><ellipse cx="24" cy="24" rx="22" ry="6" fill="none" stroke="#B39DDB" stroke-width="2.5" transform="rotate(-20 24 24)"/>`,flower:`<circle cx="24" cy="16" r="6" fill="#F48FB1"/><circle cx="16" cy="22" r="6" fill="#F48FB1"/><circle cx="32" cy="22" r="6" fill="#F48FB1"/><circle cx="18" cy="30" r="6" fill="#F48FB1"/><circle cx="30" cy="30" r="6" fill="#F48FB1"/><circle cx="24" cy="24" r="5" fill="#FFD54F"/>`,tree:`<rect x="20" y="32" width="8" height="12" rx="1" fill="#795548"/><polygon points="24,4 8,22 16,22 6,34 42,34 32,22 40,22" fill="#4CAF50"/>`,car:`<rect x="4" y="22" width="40" height="14" rx="4" fill="#F44336"/><path d="M12 22L18 12L30 12L36 22" fill="#42A5F5"/><circle cx="14" cy="36" r="5" fill="#424242"/><circle cx="34" cy="36" r="5" fill="#424242"/>`,airplane:`<ellipse cx="24" cy="24" rx="6" ry="16" fill="#90A4AE" transform="rotate(-30 24 24)"/><path d="M6 28L22 22L18 28Z" fill="#78909C"/><path d="M42 20L26 26L30 20Z" fill="#78909C"/>`,boat:`<path d="M4 32L10 40L38 40L44 32Z" fill="#795548"/><rect x="20" y="16" width="3" height="16" fill="#8D6E63"/><polygon points="23,10 23,28 40,28" fill="#F44336"/>`,crownSticker:`<polygon points="6,36 10,12 18,24 24,6 30,24 38,12 42,36" fill="#FFD700" stroke="#F9A825" stroke-width="1.5"/>`}; return `<svg viewBox="0 0 48 48" width="${s}" height="${s}">${st[icon]||st.cat}</svg>`; },
  objectIcon(type,s){ s=s||40; const o={apple:`<path d="M20 34C12 34 6 28 6 20C6 12 12 8 18 8Q20 6 22 8C28 8 34 12 34 20C34 28 28 34 20 34" fill="#F44336"/>`,star:`<polygon points="20,4 24,14 36,14 27,22 30,32 20,26 10,32 13,22 4,14 16,14" fill="#FFD700"/>`,circle:`<circle cx="20" cy="20" r="14" fill="#42A5F5"/>`,heart:`<path d="M20 34C10 26 4 20 4 14C4 8 8 6 12 6c3 0 5 2 8 5 3-3 5-5 8-5 4 0 8 2 8 8 0 6-6 12-16 20z" fill="#E91E63"/>`,flower:`<circle cx="20" cy="14" r="5" fill="#F48FB1"/><circle cx="14" cy="20" r="5" fill="#F48FB1"/><circle cx="26" cy="20" r="5" fill="#F48FB1"/><circle cx="20" cy="20" r="4" fill="#FFD54F"/>`,fish:`<ellipse cx="18" cy="20" rx="12" ry="8" fill="#42A5F5"/><polygon points="30,20 38,14 38,26" fill="#42A5F5"/><circle cx="12" cy="18" r="2" fill="#FFF"/>`,ball:`<circle cx="20" cy="20" r="14" fill="#FF9800"/>`,pencil:`<rect x="16" y="4" width="8" height="28" rx="1" fill="#FFD54F"/><polygon points="16,32 20,38 24,32" fill="#FFB74D"/>`}; return `<svg viewBox="0 0 40 40" width="${s}" height="${s}">${o[type]||o.apple}</svg>`; },
  logo(s){ s=s||120; return `<svg viewBox="0 0 120 120" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="85" width="60" height="20" rx="4" fill="#FF8C42" opacity="0.9"/><rect x="32" y="87" width="28" height="16" rx="2" fill="#FFB380"/><rect x="62" y="87" width="26" height="16" rx="2" fill="#FFCCA0"/><line x1="60" y1="87" x2="60" y2="103" stroke="#E07030" stroke-width="2"/><circle cx="60" cy="45" r="28" fill="#FFF" stroke="#2D2D2D" stroke-width="2"/><circle cx="38" cy="22" r="10" fill="#2D2D2D"/><circle cx="38" cy="22" r="5" fill="#E0E0E0"/><circle cx="82" cy="22" r="10" fill="#2D2D2D"/><circle cx="82" cy="22" r="5" fill="#E0E0E0"/><ellipse cx="48" cy="42" rx="9" ry="8" fill="#2D2D2D"/><ellipse cx="72" cy="42" rx="9" ry="8" fill="#2D2D2D"/><circle cx="48" cy="41" r="3.5" fill="#FFF"/><circle cx="72" cy="41" r="3.5" fill="#FFF"/><ellipse cx="60" cy="52" rx="3.5" ry="2.5" fill="#2D2D2D"/><path d="M53 56Q60 63 67 56" fill="none" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round"/><circle cx="40" cy="52" r="4" fill="#FFB3B3" opacity="0.5"/><circle cx="80" cy="52" r="4" fill="#FFB3B3" opacity="0.5"/></svg>`; }
};

/* ================================================
   SECTION 7: APP OBJECT
   ================================================ */

const App = {
  // State
  profile: null,
  progress: null,
  achievements: null,
  stickers: null,
  outfitsData: null,
  settings: null,
  calendar: null,
  currentPage: 'home',
  currentCat: null,
  lessonData: null,
  lessonQuestions: [],
  lessonIndex: 0,
  lessonCorrect: 0,
  lessonCombo: 0,
  lessonMaxCombo: 0,
  lessonStartTime: 0,
  currentLessonId: null,
  allLessonsData: null,
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  pendingBadges: [],
  pendingOutfit: null,
  pendingSticker: null,
  _matchSelected: null,
  _memoryFlipped: [],
  _memoryMatched: 0,
  _memoryPairs: 0,
  _arrangeWord: [],
  _arrangeIdx: 0,
  _canvasDrawing: false,
  _canvasPoints: [],

  // i18n helpers
  lang(){ return (this.settings&&this.settings.language)||'id'; },
  t(key){ return (LANG[this.lang()]&&LANG[this.lang()][key])||key; },
  tObj(obj){ if(!obj) return ''; if(typeof obj==='string') return obj; return obj[this.lang()]||obj.id||obj.en||''; },

  /* ---- Init ---- */
  init(){
    this.settings = Store.get(KEYS.settings) || defaultSettings();
    this.profile = Store.get(KEYS.profile) || defaultProfile();
    this.progress = Store.get(KEYS.progress) || defaultProgress();
    this.achievements = Store.get(KEYS.achievements) || defaultAchievements();
    this.stickers = Store.get(KEYS.stickers) || defaultStickers();
    this.outfitsData = Store.get(KEYS.outfits) || defaultOutfits();
    this.calendar = Store.get(KEYS.calendar) || defaultCalendar();

    // Apply theme
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    Sound.setEnabled(this.settings.sound);

    // Load lessons.json
    this._loadLessons();
  },

  _loadLessons(){
    fetch('lessons.json').then(r=>r.json()).then(data=>{
      this.allLessonsData = data;
      this._onReady();
    }).catch(()=>{
      this.allLessonsData = {};
      this._onReady();
    });
  },

  _onReady(){
    // Splash
    const splash = $('#splash');
    const logo = $('#splashLogo');
    if(logo) logo.innerHTML = Icons.logo(120);

    setTimeout(()=>{
      if(splash) splash.classList.add('fade-out');
      setTimeout(()=>{
        if(splash) splash.hidden = true;
        if(!this.settings.setupDone){
          this._showSetupName();
        } else {
          this._showApp();
        }
      }, 600);
    }, 2000);
  },

  save(){
    Store.set(KEYS.profile, this.profile);
    Store.set(KEYS.progress, this.progress);
    Store.set(KEYS.achievements, this.achievements);
    Store.set(KEYS.stickers, this.stickers);
    Store.set(KEYS.outfits, this.outfitsData);
    Store.set(KEYS.settings, this.settings);
    Store.set(KEYS.calendar, this.calendar);
  },

  /* ---- Setup Flow ---- */
  _showSetupName(){
    $('#setupName').hidden = false;
    $('#setupNameMascot').innerHTML = Dacorta.svg('happy','none');
    this._applyI18n();
  },

  _submitName(){
    const name = $('#inputChildName').value.trim();
    if(!name) return;
    this.profile.name = name;
    Sound.play('click');
    $('#setupName').hidden = true;
    this._showSetupAge();
  },

  _showSetupAge(){
    $('#setupAge').hidden = false;
    $('#setupAgeMascot').innerHTML = Dacorta.svg('happy','none');
    const span = $('#setupAgeName');
    if(span) span.textContent = this.profile.name;
    this._applyI18n();
  },

  _selectAge(tier){
    this.profile.ageTier = tier;
    this.settings.setupDone = true;
    this.save();
    Sound.play('complete');
    $('#setupAge').hidden = true;
    this._showApp();
  },

  /* ---- Show App ---- */
  _showApp(){
    $('#appMain').hidden = false;
    $('#bottomNav').hidden = false;
    this.navigate('home');
  },

  /* ---- Theme, Language, Sound Toggles ---- */
  toggleTheme(){
    this.settings.theme = this.settings.theme==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    this.save();
    this._updateSettingsUI();
    Sound.play('click');
  },

  toggleLanguage(){
    this.settings.language = this.settings.language==='id'?'en':'id';
    this.save();
    this._applyI18n();
    this._updateSettingsUI();
    if(this.currentPage) this.navigate(this.currentPage);
    Sound.play('click');
  },

  toggleSound(){
    this.settings.sound = !this.settings.sound;
    Sound.setEnabled(this.settings.sound);
    this.save();
    this._updateSettingsUI();
    if(this.settings.sound) Sound.play('click');
  },

  /* ---- i18n Apply ---- */
  _applyI18n(){
    $$('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const txt = this.t(key);
      if(txt && txt !== key) el.textContent = txt;
    });
  },

  /* ---- Toast ---- */
  toast(msg, type){
    type = type || 'info';
    const container = $('#toastContainer');
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    const iconMap = { success: Icons.check(24), error: Icons.cross(24), info: Icons.star(true,24), xp: Icons.xpIcon(24) };
    div.innerHTML = `<div class="toast-icon">${iconMap[type]||iconMap.info}</div><span class="toast-text">${msg}</span>`;
    container.appendChild(div);
    setTimeout(()=>{ div.classList.add('toast-out'); setTimeout(()=>div.remove(), 300); }, 3000);
  },

  /* ---- Modal Helpers ---- */
  openModal(id){ const m=$('#'+id); if(m) m.hidden=false; },
  closeModal(id){ const m=$('#'+id); if(m) m.hidden=true; },

  /* ---- Navigation ---- */
  navigate(page){
    if(page === this.currentPage && page !== 'home') return;
    // Hide lesson/result pages if showing regular pages
    $('#pageLesson').hidden = true;
    $('#pageResult').hidden = true;
    // Hide all pages
    ['pageHome','pageLearn','pagePath','pageProgress','pageCollection','pageSettings'].forEach(p=>{
      const el=$('#'+p); if(el) el.hidden=true;
    });
    // Update nav
    $$('.nav-btn').forEach(b=>{
      const bp = b.getAttribute('data-page');
      b.classList.toggle('active', bp===page);
      b.setAttribute('aria-current', bp===page?'page':'false');
    });
    this.currentPage = page;
    switch(page){
      case 'home': $('#pageHome').hidden=false; this.updateHome(); break;
      case 'learn': $('#pageLearn').hidden=false; this.updateLearn(); break;
      case 'progress': $('#pageProgress').hidden=false; this.updateProgress(); break;
      case 'collection': $('#pageCollection').hidden=false; this.updateCollection(); break;
      case 'settings': $('#pageSettings').hidden=false; this.updateSettings(); break;
    }
    this._applyI18n();
    window.scrollTo(0,0);
  },

  /* ---- HOME ---- */
  updateHome(){
    const p = this.progress;
    const name = this.profile.name || 'Teman';
    $('#greetingText').textContent = `${this.t(greetingKey())}, ${name}!`;
    $('#greetingSub').textContent = this.t('greeting_sub');
    $('#homeMascot').innerHTML = Dacorta.svg('happy', this._equippedOutfit());

    // XP
    const lv = p.level;
    const curXP = xpForCurrentLevel(lv);
    const nxtXP = xpForLevel(lv);
    const pct = nxtXP>curXP ? ((p.xp - curXP)/(nxtXP - curXP))*100 : 100;
    $('#xpLevelLabel').textContent = 'Level ' + lv;
    $('#xpLevelName').textContent = (LEVEL_NAMES[this.lang()]||LEVEL_NAMES.id)[lv-1]||'';
    $('#xpBarFill').style.width = clamp(pct,0,100)+'%';
    $('#xpText').textContent = `${p.xp} / ${nxtXP} XP`;

    // Stats
    $('#statStarIcon').innerHTML = Icons.star(true, 28);
    $('#statStars').textContent = p.totalStars;
    $('#statStreakIcon').innerHTML = Icons.fire(28);
    $('#statStreak').textContent = p.streak.current;
    $('#statLessonIcon').innerHTML = Icons.book(28);
    $('#statLessons').textContent = p.totalLessonsCompleted;

    // Daily goal
    const dg = p.dailyGoal;
    if(dg.date !== todayStr()){ dg.completed = 0; dg.date = todayStr(); }
    $('#dailyGoalStatus').textContent = `${dg.completed} / ${dg.target}`;
    const dgPct = Math.min((dg.completed/dg.target)*100, 100);
    $('#dailyGoalFill').style.width = dgPct+'%';
    const dgCard = $('#dailyGoalCard');
    dgCard.classList.toggle('completed', dg.completed >= dg.target);

    // Continue button
    const next = getNextLesson(p);
    const btnCont = $('#btnContinue');
    if(next){ btnCont.hidden = false; btnCont.setAttribute('data-lesson', next.id); }
    else btnCont.hidden = true;

    // Category grid
    this._renderCategoryGrid();
  },

  _renderCategoryGrid(){
    const grid = $('#homeCategoryGrid');
    grid.innerHTML = '';
    CATEGORIES.forEach(cat=>{
      const lessons = lessonsForCat(cat);
      const done = lessons.filter(l=>this.progress.lessons[l.id]&&this.progress.lessons[l.id].completed).length;
      const locked = cat==='typing' && this.progress.totalLessonsCompleted < NON_TYPING_COUNT;
      const card = document.createElement('div');
      card.className = 'category-card' + (locked?' locked':'');
      card.setAttribute('data-cat', cat);
      card.innerHTML = `<div class="category-icon">${Icons.catIcon(cat,40)}</div><span class="category-name">${CAT_NAMES[this.lang()][cat]}</span><span class="category-progress-mini">${done}/${lessons.length}</span><div class="category-bar-mini"><div class="category-bar-fill" style="width:${lessons.length?((done/lessons.length)*100):0}%"></div></div>${locked?`<div class="lock-overlay">${Icons.lock(24)}</div>`:''}`;
      if(!locked){
        card.addEventListener('click', ()=>{ Sound.play('click'); this._showPath(cat); });
      } else {
        card.addEventListener('click', ()=>this.toast(this.t('toast_typing_locked'),'error'));
      }
      grid.appendChild(card);
    });
  },

  /* ---- LEARN ---- */
  updateLearn(){
    const list = $('#learnCategoryList');
    list.innerHTML = '';
    CATEGORIES.forEach(cat=>{
      const lessons = lessonsForCat(cat);
      const done = lessons.filter(l=>this.progress.lessons[l.id]&&this.progress.lessons[l.id].completed).length;
      const locked = cat==='typing' && this.progress.totalLessonsCompleted < NON_TYPING_COUNT;
      const item = document.createElement('div');
      item.className = 'category-list-item' + (locked?' locked':'');
      item.setAttribute('data-cat', cat);
      item.innerHTML = `<div class="cat-list-icon">${Icons.catIcon(cat,28)}</div><div class="cat-list-info"><div class="cat-list-name">${CAT_NAMES[this.lang()][cat]}</div><div class="cat-list-progress-text">${done} ${this.t('lesson_of')} ${lessons.length}</div><div class="cat-list-bar"><div class="cat-list-bar-fill" style="width:${lessons.length?((done/lessons.length)*100):0}%"></div></div></div>${locked?`<div class="cat-list-lock">${Icons.lock(20)}</div>`:`<svg class="cat-list-arrow" viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}`;
      if(!locked){
        item.addEventListener('click', ()=>{ Sound.play('click'); this._showPath(cat); });
      } else {
        item.addEventListener('click', ()=>this.toast(this.t('toast_typing_locked'),'error'));
      }
      list.appendChild(item);
    });
  },

  /* ---- LESSON PATH ---- */
  _showPath(cat){
    this.currentCat = cat;
    ['pageHome','pageLearn','pageProgress','pageCollection','pageSettings'].forEach(p=>{ const e=$('#'+p); if(e) e.hidden=true; });
    $('#pagePath').hidden = false;
    this.currentPage = 'path';
    this.renderPath();
    // Hide bottom nav active
    $$('.nav-btn').forEach(b=>b.classList.remove('active'));
  },

  renderPath(){
    const cat = this.currentCat;
    const lessons = lessonsForCat(cat);
    const done = lessons.filter(l=>this.progress.lessons[l.id]&&this.progress.lessons[l.id].completed).length;
    $('#pathTitle').textContent = CAT_NAMES[this.lang()][cat];
    $('#pathProgressText').textContent = `${done}/${lessons.length}`;

    const scroll = $('#pathScroll');
    scroll.innerHTML = '';

    lessons.forEach((lesson, i) => {
      const ld = this.progress.lessons[lesson.id];
      const completed = ld && ld.completed;
      const unlocked = isLessonUnlocked(lesson.id, this.progress);
      const status = completed ? 'completed' : (unlocked ? 'available' : 'locked');
      const stars = ld ? (ld.stars || 0) : 0;

      // Connector (except first)
      if(i > 0){
        const conn = document.createElement('div');
        conn.className = 'path-connector' + (completed?' completed':(unlocked?' active':''));
        scroll.appendChild(conn);
      }

      const node = document.createElement('div');
      node.className = `path-node ${status}`;
      const starsHtml = completed ? `<div class="path-node-stars">${Icons.star(stars>=1,14)}${Icons.star(stars>=2,14)}${Icons.star(stars>=3,14)}</div>` : '';
      const iconInner = completed ? Icons.check(28) : (unlocked ? `<span style="font-size:18px;font-weight:800;color:var(--accent)">${lesson.order}</span>` : Icons.lock(28));

      node.innerHTML = `<button class="path-node-btn" data-lid="${lesson.id}">${iconInner}${starsHtml}</button><div class="path-node-info"><div class="path-node-title">${this.tObj(lesson.name)}</div><div class="path-node-sub">${completed ? (this.t('completed')) : (unlocked ? this.t('available') : this.t('locked'))}</div></div>`;

      const btn = node.querySelector('.path-node-btn');
      if(unlocked || completed){
        btn.addEventListener('click', ()=>{
          Sound.play('click');
          this.startLesson(lesson.id);
        });
      } else {
        btn.addEventListener('click', ()=>this.toast(this.t('toast_lesson_locked'),'error'));
      }
      scroll.appendChild(node);
    });
  },

  /* ---- PROGRESS ---- */
  updateProgress(){
    const p = this.progress;
    const lv = p.level;
    const curXP = xpForCurrentLevel(lv);
    const nxtXP = xpForLevel(lv);
    const pct = nxtXP>curXP ? ((p.xp - curXP)/(nxtXP - curXP))*100 : 100;

    $('#progressMascot').innerHTML = Dacorta.svg('proud', this._equippedOutfit());
    $('#progressLevel').textContent = 'Level ' + lv;
    $('#progressLevelName').textContent = (LEVEL_NAMES[this.lang()]||LEVEL_NAMES.id)[lv-1]||'';
    $('#progressXpFill').style.width = clamp(pct,0,100)+'%';
    $('#progressXpText').textContent = `${p.xp} / ${nxtXP} XP`;

    // Stats
    $('#pStatStarIcon').innerHTML = Icons.star(true,28);
    $('#pStatStars').textContent = p.totalStars;
    $('#pStatLessonIcon').innerHTML = Icons.book(28);
    $('#pStatLessons').textContent = p.totalLessonsCompleted;
    $('#pStatStreakIcon').innerHTML = Icons.fire(28);
    $('#pStatStreak').textContent = p.streak.longest;
    $('#pStatXpIcon').innerHTML = Icons.xpIcon(28);
    $('#pStatXp').textContent = p.xp;

    // Category progress
    const cpList = $('#categoryProgressList');
    cpList.innerHTML = '';
    CATEGORIES.forEach(cat=>{
      const lessons = lessonsForCat(cat);
      const done = lessons.filter(l=>p.lessons[l.id]&&p.lessons[l.id].completed).length;
      const pctC = lessons.length ? ((done/lessons.length)*100) : 0;
      const item = document.createElement('div');
      item.className = 'cat-progress-item';
      item.innerHTML = `<div class="cat-progress-dot" style="background:${CAT_COLORS[cat]}"></div><div class="cat-progress-info"><div class="cat-progress-name">${CAT_NAMES[this.lang()][cat]}</div><div class="cat-progress-bar"><div class="cat-progress-bar-fill" style="width:${pctC}%;background:${CAT_COLORS[cat]}"></div></div></div><span class="cat-progress-text">${done}/${lessons.length}</span>`;
      cpList.appendChild(item);
    });

    this.renderCal();
  },

  renderCal(){
    const lang = this.lang();
    const months = LANG[lang].months;
    const days = LANG[lang].days_short;

    $('#calendarMonth').textContent = `${months[this.calMonth]} ${this.calYear}`;

    // Days header
    const dh = $('#calendarDaysHeader');
    dh.innerHTML = '';
    days.forEach(d=>{ const s=document.createElement('span'); s.className='calendar-day-name'; s.textContent=d; dh.appendChild(s); });

    // Grid
    const grid = $('#calendarGrid');
    grid.innerHTML = '';
    const firstDay = new Date(this.calYear, this.calMonth, 1).getDay();
    const offset = (firstDay + 6) % 7; // Monday start
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const today = todayStr();

    for(let i=0; i<offset; i++){
      const e = document.createElement('div');
      e.className = 'calendar-day empty';
      grid.appendChild(e);
    }

    for(let d=1; d<=daysInMonth; d++){
      const dateStr = this.calYear + '-' + String(this.calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      const entry = this.calendar.find(c=>c.date===dateStr);
      const isToday = dateStr === today;
      const active = entry && entry.lessonsCompleted > 0;
      const el = document.createElement('div');
      el.className = 'calendar-day' + (isToday?' today':'') + (active?' active':'');
      el.textContent = d;
      grid.appendChild(el);
    }
  },

  /* ---- COLLECTION ---- */
  updateCollection(){
    this.renderBadges();
    this.renderStickers();
    this.renderOutfits();
  },

  renderBadges(){
    const grid = $('#badgeGrid');
    grid.innerHTML = '';
    BADGES.forEach(badge=>{
      const ach = this.achievements.find(a=>a.id===badge.id);
      const unlocked = ach && ach.unlocked;
      const item = document.createElement('div');
      item.className = 'badge-item' + (unlocked?'':' locked');
      item.innerHTML = `<div class="badge-icon">${Icons.badgeIcon(badge.icon, 48)}</div><div class="badge-name">${this.tObj(badge.name)}</div>`;
      grid.appendChild(item);
    });
  },

  renderStickers(){
    const grid = $('#stickerGrid');
    grid.innerHTML = '';
    STICKERS.forEach(stk=>{
      const sd = this.stickers.find(s=>s.id===stk.id);
      const unlocked = sd && sd.unlocked;
      const item = document.createElement('div');
      item.className = 'sticker-item' + (unlocked?'':' locked');
      item.innerHTML = Icons.stickerIcon(stk.icon, 40);
      grid.appendChild(item);
    });
  },

  renderOutfits(){
    // Preview
    $('#outfitPreview').innerHTML = Dacorta.svg('happy', this._equippedOutfit());

    const grid = $('#outfitGrid');
    grid.innerHTML = '';
    OUTFITS.forEach(outfit=>{
      const od = this.outfitsData.find(o=>o.id===outfit.id);
      const unlocked = od && od.unlocked;
      const equipped = od && od.equipped;
      const item = document.createElement('div');
      item.className = 'outfit-item' + (unlocked?'':' locked') + (equipped?' equipped':'');
      item.innerHTML = `<div class="outfit-item-preview">${Dacorta.svg('happy', outfit.id)}</div><div class="outfit-item-name">${this.tObj(outfit.name)}</div>${!unlocked?`<div class="outfit-item-level">Lv.${outfit.level}</div>`:''}`;
      if(unlocked && !equipped){
        item.addEventListener('click', ()=>{
          this._equipOutfit(outfit.id);
          Sound.play('click');
        });
      }
      grid.appendChild(item);
    });
  },

  _equippedOutfit(){
    const eq = this.outfitsData.find(o=>o.equipped);
    return eq ? eq.id : 'none';
  },

  _equipOutfit(id){
    this.outfitsData.forEach(o=>o.equipped = (o.id === id));
    this.save();
    this.toast(this.t('toast_outfit_equipped'), 'success');
    this.renderOutfits();
  },

  /* ---- SETTINGS ---- */
  updateSettings(){
    this._updateSettingsUI();
  },

  _updateSettingsUI(){
    $('#settingNameValue').textContent = this.profile.name || '-';
    const ages = {toddler:'2-3',preschool:'4-5',primary:'6-7'};
    $('#settingAgeValue').textContent = (ages[this.profile.ageTier]||'4-5') + ' ' + (this.lang()==='id'?'tahun':'years');
    $('#settingLangValue').textContent = this.lang()==='id'?'Indonesia':'English';
    $('#langToggleLabel').textContent = this.lang()==='id'?'EN':'ID';
    $('#settingThemeValue').textContent = this.t(this.settings.theme==='dark'?'theme_dark':'theme_light');
    $('#settingSoundValue').textContent = this.t(this.settings.sound?'sound_on':'sound_off');
    $('#toggleTheme').checked = this.settings.theme==='dark';
    $('#toggleSound').checked = this.settings.sound;
  },

  /* ---- GAME ENGINE ---- */
  startLesson(lid){
    this.currentLessonId = lid;
    const questions = (this.allLessonsData && this.allLessonsData[lid]) ? [...this.allLessonsData[lid]] : [];
    if(!questions.length){
      this.toast('No questions loaded','error');
      return;
    }
    // Shuffle and pick based on age
    this.lessonQuestions = shuffle(questions).slice(0, Math.min(questions.length, 18));
    this.lessonIndex = 0;
    this.lessonCorrect = 0;
    this.lessonCombo = 0;
    this.lessonMaxCombo = 0;
    this.lessonStartTime = Date.now();

    // Show lesson page
    ['pageHome','pageLearn','pagePath','pageProgress','pageCollection','pageSettings'].forEach(p=>{ const e=$('#'+p); if(e) e.hidden=true; });
    $('#bottomNav').hidden = true;
    $('#pageLesson').hidden = false;
    $('#pageResult').hidden = true;
    $('#feedbackOverlay').hidden = true;
    $('#comboIndicator').hidden = true;
    $('#hintBubble').hidden = true;

    this.renderQ();
  },

  renderQ(){
    const q = this.lessonQuestions[this.lessonIndex];
    if(!q){ this.finishLesson(); return; }

    const total = this.lessonQuestions.length;
    const pct = ((this.lessonIndex)/total)*100;
    $('#lessonProgressFill').style.width = pct+'%';
    $('#lessonProgressText').textContent = `${this.lessonIndex+1}/${total}`;

    // Reset areas
    $('#lessonVisual').hidden = true;
    $('#lessonAnswers').innerHTML = '';
    $('#lessonAnswers').hidden = false;
    $('#lessonCanvasWrap').hidden = true;
    $('#lessonArrangeWrap').hidden = true;
    $('#lessonMatchWrap').hidden = true;
    $('#lessonMemoryWrap').hidden = true;
    $('#feedbackOverlay').hidden = true;
    $('#btnHint').hidden = !q.hint;

    // Mascot
    $('#lessonMascot').innerHTML = Dacorta.svg('happy', this._equippedOutfit());
    $('#lessonMascot').className = 'lesson-mascot';

    // Prompt
    $('#lessonPrompt').textContent = this.tObj(q.prompt);

    // Dispatch by type
    const type = q.type;
    if(type === 'multiple_choice') this._mc(q);
    else if(type === 'tap_correct') this._tap(q);
    else if(type === 'count_objects') this._count(q);
    else if(type === 'true_false') this._tf(q);
    else if(type === 'sequence') this._seq(q);
    else if(type === 'matching') this._match(q);
    else if(type === 'arrange_letters') this._arrange(q);
    else if(type === 'memory_card') this._memory(q);
    else if(type === 'trace') this._trace(q);
    else this._mc(q); // fallback
  },

  /* -- Multiple Choice -- */
  _mc(q){
    const container = $('#lessonAnswers');
    container.innerHTML = '';
    const opts = this._getOptions(q);
    const labels = ['A','B','C','D'];
    opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<span class="answer-btn-label">${labels[i]}</span><span class="answer-btn-text">${this.tObj(opt)}</span>`;
      btn.addEventListener('click', ()=> this._answer(this.tObj(opt) === this.tObj(q.answer), q, btn, container));
      container.appendChild(btn);
    });
  },

  /* -- Tap Correct -- */
  _tap(q){
    const container = $('#lessonAnswers');
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'answer-grid grid-' + Math.min(this._getOptions(q).length, 4);
    const opts = this._getOptions(q);
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-grid-btn';
      // If option has visual property, show SVG
      if(q.visual){
        btn.innerHTML = Icons.objectIcon(opt.icon||'apple', 36) + `<span>${this.tObj(opt)}</span>`;
      } else {
        btn.textContent = this.tObj(opt);
      }
      btn.addEventListener('click', ()=> this._answer(this.tObj(opt) === this.tObj(q.answer), q, btn, grid));
      grid.appendChild(btn);
    });
    container.innerHTML = '';
    container.appendChild(grid);
  },

  /* -- Count Objects -- */
  _count(q){
    // Show visual
    const vis = $('#lessonVisual');
    vis.hidden = false;
    vis.innerHTML = '';
    const count = q.objectCount || 3;
    const type = q.objectType || 'apple';
    for(let i=0; i<count; i++){
      const d = document.createElement('div');
      d.className = 'visual-item';
      d.style.animationDelay = (i*0.05)+'s';
      d.innerHTML = Icons.objectIcon(type, 40);
      vis.appendChild(d);
    }

    // Options
    const container = $('#lessonAnswers');
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'answer-grid grid-' + Math.min((q.options||[]).length, 4);
    const opts = this._getOptions(q);
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-grid-btn';
      btn.innerHTML = `<span style="font-size:1.5rem;font-weight:800">${opt}</span>`;
      btn.addEventListener('click', ()=> this._answer(String(opt) === String(q.answer), q, btn, grid));
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  },

  /* -- True/False -- */
  _tf(q){
    const container = $('#lessonAnswers');
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'tf-buttons';
    const trueBtn = document.createElement('button');
    trueBtn.className = 'tf-btn tf-true';
    trueBtn.innerHTML = `${Icons.check(40)}<span>${this.t('tf_true')}</span>`;
    trueBtn.addEventListener('click', ()=> this._answer(q.answer === true || q.answer === 'true', q, trueBtn, grid));

    const falseBtn = document.createElement('button');
    falseBtn.className = 'tf-btn tf-false';
    falseBtn.innerHTML = `${Icons.cross(40)}<span>${this.t('tf_false')}</span>`;
    falseBtn.addEventListener('click', ()=> this._answer(q.answer === false || q.answer === 'false', q, falseBtn, grid));

    grid.appendChild(trueBtn);
    grid.appendChild(falseBtn);
    container.appendChild(grid);
  },

  /* -- Sequence -- */
  _seq(q){
    // Show sequence display
    const vis = $('#lessonVisual');
    vis.hidden = false;
    vis.innerHTML = '';
    const seqDiv = document.createElement('div');
    seqDiv.className = 'sequence-display';
    (q.sequence || []).forEach((item, i) => {
      if(i > 0){
        const arrow = document.createElement('div');
        arrow.className = 'seq-arrow';
        arrow.innerHTML = `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M6 10h8M11 6l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        seqDiv.appendChild(arrow);
      }
      const si = document.createElement('div');
      si.className = 'seq-item' + (item === '?' ? ' blank' : '');
      si.textContent = item === '?' ? '?' : item;
      seqDiv.appendChild(si);
    });
    vis.appendChild(seqDiv);

    // Options
    const container = $('#lessonAnswers');
    container.innerHTML = '';
    const opts = this._getOptions(q);
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<span class="answer-btn-text" style="text-align:center;width:100%;font-size:1.2rem;font-weight:800">${opt}</span>`;
      btn.addEventListener('click', ()=> this._answer(String(opt) === String(q.answer), q, btn, container));
      container.appendChild(btn);
    });
  },

  /* -- Matching -- */
  _match(q){
    $('#lessonAnswers').hidden = true;
    const wrap = $('#lessonMatchWrap');
    wrap.hidden = false;
    const leftCol = $('#matchLeft');
    const rightCol = $('#matchRight');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';
    this._matchSelected = null;
    this._matchPairs = q.pairs ? [...q.pairs] : [];
    this._matchDone = 0;

    const leftItems = q.pairs.map(p=>({text:this.tObj(p.left), id:p.id||this.tObj(p.left)}));
    const rightItems = shuffle(q.pairs.map(p=>({text:this.tObj(p.right), id:p.id||this.tObj(p.left)})));

    leftItems.forEach(item=>{
      const el = document.createElement('button');
      el.className = 'match-item';
      el.textContent = item.text;
      el.setAttribute('data-match-id', item.id);
      el.setAttribute('data-side', 'left');
      el.addEventListener('click', ()=>this._onMatchClick(el, q));
      leftCol.appendChild(el);
    });

    rightItems.forEach(item=>{
      const el = document.createElement('button');
      el.className = 'match-item';
      el.textContent = item.text;
      el.setAttribute('data-match-id', item.id);
      el.setAttribute('data-side', 'right');
      el.addEventListener('click', ()=>this._onMatchClick(el, q));
      rightCol.appendChild(el);
    });
  },

  _onMatchClick(el, q){
    if(el.classList.contains('matched')) return;
    const side = el.getAttribute('data-side');

    if(!this._matchSelected){
      this._matchSelected = el;
      el.classList.add('selected');
    } else {
      const prevSide = this._matchSelected.getAttribute('data-side');
      if(prevSide === side){
        this._matchSelected.classList.remove('selected');
        this._matchSelected = el;
        el.classList.add('selected');
        return;
      }
      // Check match
      const id1 = this._matchSelected.getAttribute('data-match-id');
      const id2 = el.getAttribute('data-match-id');
      if(id1 === id2){
        // Correct match
        this._matchSelected.classList.remove('selected');
        this._matchSelected.classList.add('matched');
        el.classList.add('matched');
        Sound.play('correct');
        this._matchDone++;
        if(this._matchDone >= this._matchPairs.length){
          setTimeout(()=> this._answer(true, q, null, null), 500);
        }
      } else {
        // Wrong
        this._matchSelected.classList.add('wrong-match');
        el.classList.add('wrong-match');
        Sound.play('wrong');
        setTimeout(()=>{
          this._matchSelected.classList.remove('wrong-match','selected');
          el.classList.remove('wrong-match');
          this._matchSelected = null;
        }, 500);
        return;
      }
      this._matchSelected = null;
    }
  },

  /* -- Arrange Letters -- */
  _arrange(q){
    $('#lessonAnswers').hidden = true;
    const wrap = $('#lessonArrangeWrap');
    wrap.hidden = false;
    const slotsDiv = $('#arrangeSlots');
    const lettersDiv = $('#arrangeLetters');
    slotsDiv.innerHTML = '';
    lettersDiv.innerHTML = '';

    const word = (q.answer || '').toUpperCase();
    this._arrangeWord = word.split('');
    this._arrangeResult = [];
    this._arrangeIdx = 0;

    // Create slots
    for(let i=0; i<word.length; i++){
      const slot = document.createElement('div');
      slot.className = 'arrange-slot';
      slot.setAttribute('data-idx', i);
      slotsDiv.appendChild(slot);
    }

    // Create shuffled letters
    const shuffled = shuffle(word.split(''));
    shuffled.forEach((letter, i) => {
      const btn = document.createElement('button');
      btn.className = 'arrange-letter';
      btn.textContent = letter;
      btn.setAttribute('data-letter', letter);
      btn.setAttribute('data-aidx', i);
      btn.addEventListener('click', ()=> this._onArrangeTap(btn, q));
      lettersDiv.appendChild(btn);
    });
  },

  _onArrangeTap(btn, q){
    if(btn.classList.contains('used')) return;
    const letter = btn.getAttribute('data-letter');
    const idx = this._arrangeIdx;
    const slot = $(`#arrangeSlots .arrange-slot[data-idx="${idx}"]`);

    slot.textContent = letter;
    slot.classList.add('filled');
    btn.classList.add('used');
    this._arrangeResult.push(letter);
    this._arrangeIdx++;

    Sound.play('click');

    if(this._arrangeIdx >= this._arrangeWord.length){
      const correct = this._arrangeResult.join('') === this._arrangeWord.join('');
      // Color slots
      $$('#arrangeSlots .arrange-slot').forEach((s,i)=>{
        s.classList.add(this._arrangeResult[i]===this._arrangeWord[i]?'correct':'wrong');
      });
      setTimeout(()=> this._answer(correct, q, null, null), 600);
    }
  },

  /* -- Memory Card -- */
  _memory(q){
    $('#lessonAnswers').hidden = true;
    const wrap = $('#lessonMemoryWrap');
    wrap.hidden = false;
    const grid = $('#memoryGrid');
    grid.innerHTML = '';

    const pairs = q.pairs || [];
    this._memoryPairs = pairs.length;
    this._memoryMatched = 0;
    this._memoryFlipped = [];
    this._memoryLocked = false;

    // Create cards: each pair appears twice
    let cards = [];
    pairs.forEach(p=>{
      cards.push({id:p.id, text:this.tObj(p.text)||p.id, pairId:p.id});
      cards.push({id:p.id, text:this.tObj(p.text)||p.id, pairId:p.id});
    });
    cards = shuffle(cards);

    const cols = cards.length <= 8 ? 4 : (cards.length <= 12 ? 4 : 4);
    grid.className = 'memory-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.setAttribute('data-pair-id', card.pairId);
      el.setAttribute('data-cidx', i);
      el.innerHTML = `<div class="memory-card-inner"><div class="memory-card-front"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="currentColor"/></svg></div><div class="memory-card-back">${card.text}</div></div>`;
      el.addEventListener('click', ()=> this._onMemoryFlip(el, q));
      grid.appendChild(el);
    });
  },

  _onMemoryFlip(el, q){
    if(this._memoryLocked) return;
    if(el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    Sound.play('click');
    this._memoryFlipped.push(el);

    if(this._memoryFlipped.length === 2){
      this._memoryLocked = true;
      const [a, b] = this._memoryFlipped;
      const idA = a.getAttribute('data-pair-id');
      const idB = b.getAttribute('data-pair-id');

      if(idA === idB && a.getAttribute('data-cidx') !== b.getAttribute('data-cidx')){
        // Match!
        a.classList.add('matched');
        b.classList.add('matched');
        Sound.play('correct');
        this._memoryMatched++;
        this._memoryFlipped = [];
        this._memoryLocked = false;
        if(this._memoryMatched >= this._memoryPairs){
          setTimeout(()=> this._answer(true, q, null, null), 500);
        }
      } else {
        Sound.play('wrong');
        setTimeout(()=>{
          a.classList.remove('flipped');
          b.classList.remove('flipped');
          this._memoryFlipped = [];
          this._memoryLocked = false;
        }, 800);
      }
    }
  },

  /* -- Trace -- */
  _trace(q){
    $('#lessonAnswers').hidden = true;
    const wrap = $('#lessonCanvasWrap');
    wrap.hidden = false;
    const canvas = $('#lessonCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const size = rect.width;
    this._canvasPoints = [];
    this._canvasSize = size;
    this._traceQ = q;

    // Draw guide
    this._drawGuide(ctx, q, size);

    // Touch/mouse handlers
    this._canvasDrawing = false;
    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return { x: touch.clientX - r.left, y: touch.clientY - r.top };
    };

    const onStart = (e) => {
      e.preventDefault();
      this._canvasDrawing = true;
      const pos = getPos(e);
      this._canvasPoints.push(pos);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = 'var(--accent)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const onMove = (e) => {
      if(!this._canvasDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this._canvasPoints.push(pos);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const onEnd = () => { this._canvasDrawing = false; };

    // Remove old listeners
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    const nc = $('#lessonCanvas');
    const nctx = nc.getContext('2d');
    nc.width = canvas.width;
    nc.height = canvas.height;
    nctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    this._drawGuide(nctx, q, size);

    nc.addEventListener('mousedown', onStart);
    nc.addEventListener('mousemove', onMove);
    nc.addEventListener('mouseup', onEnd);
    nc.addEventListener('mouseleave', onEnd);
    nc.addEventListener('touchstart', onStart, {passive:false});
    nc.addEventListener('touchmove', onMove, {passive:false});
    nc.addEventListener('touchend', onEnd);
  },

  _drawGuide(ctx, q, size){
    const char = q.traceChar || 'A';
    const paths = TRACE_PATHS[char];
    if(!paths) return;

    ctx.clearRect(0, 0, size, size);

    // Background grid
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size/2, 0); ctx.lineTo(size/2, size);
    ctx.moveTo(0, size/2); ctx.lineTo(size, size/2);
    ctx.stroke();

    // Draw guide paths
    const pad = size * 0.1;
    const w = size - pad*2;
    paths.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([8, 8]);
      stroke.forEach((pt, i) => {
        const x = pad + pt[0]*w;
        const y = pad + pt[1]*w;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Start dot
    if(paths[0] && paths[0][0]){
      const sp = paths[0][0];
      ctx.beginPath();
      ctx.arc(pad + sp[0]*w, pad + sp[1]*w, 6, 0, Math.PI*2);
      ctx.fillStyle = 'var(--correct, #4CAF50)';
      ctx.fill();
    }
  },

  clearCanvas(){
    const canvas = $('#lessonCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = this._canvasSize || 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._canvasPoints = [];
    if(this._traceQ) this._drawGuide(ctx, this._traceQ, size);
  },

  checkTracing(){
    // Simple validation: check if enough points were drawn
    const q = this._traceQ;
    const ok = this._canvasPoints.length >= 15;
    this._answer(ok, q, null, null);
  },

  /* -- Option Helper -- */
  _getOptions(q){
    let opts = q.options ? [...q.options] : [];
    const tier = this.profile.ageTier;
    const count = optionCount(tier);
    // Ensure answer is in options
    if(opts.length > count){
      const ansStr = this.tObj(q.answer);
      let filtered = opts.filter(o=> this.tObj(o) === ansStr);
      let others = shuffle(opts.filter(o=> this.tObj(o) !== ansStr));
      opts = shuffle([...filtered, ...others.slice(0, count-1)]);
    }
    return opts;
  },

  /* -- Answer Handler -- */
  _answer(ok, q, btn, container){
    if(this._answered) return;
    this._answered = true;

    if(ok){
      this.lessonCorrect++;
      this.lessonCombo++;
      if(this.lessonCombo > this.lessonMaxCombo) this.lessonMaxCombo = this.lessonCombo;
      Sound.play('correct');
      if(btn) btn.classList.add('correct');
      // Mascot bounce
      const mascot = $('#lessonMascot');
      mascot.innerHTML = Dacorta.svg('happy', this._equippedOutfit());
      mascot.classList.add('bounce');

      // Combo indicator
      if(this.lessonCombo >= 2){
        const ci = $('#comboIndicator');
        ci.hidden = false;
        $('#comboCount').textContent = this.lessonCombo;
        ci.classList.remove('combo-pulse');
        void ci.offsetWidth;
        ci.classList.add('combo-pulse');
        if(this.lessonCombo >= 5) Sound.play('streak');
      }
    } else {
      this.lessonCombo = 0;
      Sound.play('wrong');
      if(btn) btn.classList.add('wrong');
      const mascot = $('#lessonMascot');
      mascot.innerHTML = Dacorta.svg('sad', this._equippedOutfit());
      mascot.classList.add('shake');
      $('#comboIndicator').hidden = true;
    }

    // Disable other buttons
    if(container){
      container.querySelectorAll('button').forEach(b=>b.classList.add('disabled'));
    }

    this._showFeedback(ok, q);
  },

  _showFeedback(ok, q){
    const overlay = $('#feedbackOverlay');
    overlay.hidden = false;
    const content = $('#feedbackContent');
    content.className = 'feedback-content ' + (ok?'correct-feedback':'wrong-feedback');
    $('#feedbackIcon').innerHTML = ok ? Icons.check(48) : Icons.cross(48);
    $('#feedbackText').textContent = ok ? this.t('feedback_correct') : this.t('feedback_wrong');

    let detail = '';
    if(ok){
      detail = q.successMessage ? this.tObj(q.successMessage) : this.t('feedback_great');
    } else {
      detail = this.t('feedback_answer_was') + ' ' + this.tObj(q.answer);
      if(q.failMessage) detail = this.tObj(q.failMessage) + ' ' + detail;
    }
    $('#feedbackDetail').textContent = detail;
  },

  _nextQ(){
    this._answered = false;
    this.lessonIndex++;
    $('#feedbackOverlay').hidden = true;
    this.renderQ();
  },

  finishLesson(){
    const total = this.lessonQuestions.length;
    const correct = this.lessonCorrect;
    const pct = total > 0 ? Math.round((correct/total)*100) : 0;
    const stars = calcStars(pct);
    const elapsed = Math.round((Date.now() - this.lessonStartTime)/1000);

    // Calculate XP
    let xp = correct * 10; // per correct
    xp += this.lessonMaxCombo * 5; // combo bonus
    xp += 50; // completion bonus
    if(stars === 3) xp += 30;

    // Update progress
    const lid = this.currentLessonId;
    const prev = this.progress.lessons[lid];
    const prevStars = prev ? (prev.stars||0) : 0;
    const newStars = Math.max(prevStars, stars);
    const starsDiff = newStars - prevStars;

    if(!this.progress.lessons[lid]) this.progress.lessons[lid] = {};
    const lp = this.progress.lessons[lid];
    if(!lp.completed){
      lp.completed = true;
      this.progress.totalLessonsCompleted++;
    }
    lp.stars = newStars;
    lp.bestScore = Math.max(lp.bestScore||0, pct);
    lp.bestTime = lp.bestTime ? Math.min(lp.bestTime, elapsed) : elapsed;
    lp.bestCombo = Math.max(lp.bestCombo||0, this.lessonMaxCombo);
    lp.attempts = (lp.attempts||0) + 1;

    this.progress.totalStars += starsDiff;
    const oldLevel = this.progress.level;
    this.progress.xp += xp;
    this.progress.level = levelFromXP(this.progress.xp);

    // Streak & daily
    updateStreak(this.progress);
    updateDailyGoal(this.progress);
    updateCalendar(this.calendar, xp);

    this.save();

    // Show result
    this._renderResult(pct, stars, xp, correct, total, this.lessonMaxCombo);

    // Check level up
    if(this.progress.level > oldLevel){
      setTimeout(()=>{
        Sound.play('levelup');
        this._showLevelUp(this.progress.level);
      }, 1500);
    }

    // Check badges
    setTimeout(()=>this._checkBadges(), 2000);

    // Check outfit unlock
    setTimeout(()=>this._checkOutfits(), 2500);

    // Check sticker chest
    setTimeout(()=>this._giveChest(), 3000);

    Sound.play('complete');
  },

  _renderResult(pct, stars, xp, correct, total, combo){
    $('#pageLesson').hidden = true;
    $('#pageResult').hidden = false;
    $('#comboIndicator').hidden = true;

    const titles = [this.t('result_title_0'), this.t('result_title_1'), this.t('result_title_2'), this.t('result_title_3')];
    $('#resultTitle').textContent = titles[stars] || titles[0];
    $('#resultMascot').innerHTML = Dacorta.svg(stars>=2?'proud':'happy', this._equippedOutfit());

    // Stars
    const starsDiv = $('#resultStars');
    starsDiv.innerHTML = '';
    for(let i=0; i<3; i++){
      const active = i < stars;
      const svgStr = Icons.star(active, 48);
      const wrap = document.createElement('span');
      wrap.innerHTML = svgStr;
      const svg = wrap.firstChild;
      if(active) svg.classList.add('star-active');
      starsDiv.appendChild(svg);
    }

    $('#resultScore').textContent = pct + '%';
    $('#resultXP').textContent = '+' + xp;
    $('#resultCorrect').textContent = correct + '/' + total;
    $('#resultCombo').textContent = combo;

    // Confetti for 3 stars
    if(stars >= 2) this.showConfetti();

    // Next button
    const nextLesson = getNextLessonAfter(this.currentLessonId);
    const btnNext = $('#btnResultNext');
    if(nextLesson && isLessonUnlocked(nextLesson.id, this.progress)){
      btnNext.hidden = false;
      btnNext.setAttribute('data-next-lid', nextLesson.id);
    } else {
      btnNext.hidden = true;
    }
  },

  showConfetti(){
    const canvas = $('#confettiCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#FF6B6B','#4ECDC4','#FFD700','#FF8C42','#9B59B6','#4CAF50','#FF4081'];
    const pieces = [];
    for(let i=0; i<80; i++){
      pieces.push({
        x: Math.random()*canvas.width,
        y: -Math.random()*canvas.height*0.5,
        w: 6+Math.random()*6,
        h: 4+Math.random()*4,
        color: colors[Math.floor(Math.random()*colors.length)],
        speed: 2+Math.random()*3,
        rot: Math.random()*360,
        rotSpeed: (Math.random()-0.5)*8,
        wobble: Math.random()*Math.PI*2
      });
    }
    let frame = 0;
    const maxFrames = 180;
    const animate = ()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pieces.forEach(p=>{
        p.y += p.speed;
        p.x += Math.sin(p.wobble + frame*0.02)*0.5;
        p.rot += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if(frame < maxFrames) requestAnimationFrame(animate);
      else ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    animate();
  },

  _showLevelUp(level){
    const name = (LEVEL_NAMES[this.lang()]||LEVEL_NAMES.id)[level-1]||'';
    $('#levelupMascot').innerHTML = Dacorta.svg('proud', this._equippedOutfit());
    $('#levelupLevel').textContent = 'Level ' + level;
    $('#levelupName').textContent = name;
    this.openModal('modalLevelUp');
  },

  _checkBadges(){
    const newBadges = [];
    BADGES.forEach(badge=>{
      const ach = this.achievements.find(a=>a.id===badge.id);
      if(ach && !ach.unlocked && badge.check(this.progress)){
        ach.unlocked = true;
        ach.unlockedAt = todayStr();
        newBadges.push(badge);
      }
    });
    this.save();
    if(newBadges.length > 0){
      this._showBadgeUnlock(newBadges[0]);
    }
  },

  _showBadgeUnlock(badge){
    const showcase = $('#badgeShowcase');
    showcase.innerHTML = `<div class="badge-icon">${Icons.badgeIcon(badge.icon, 80)}</div><div class="badge-name">${this.tObj(badge.name)}</div>`;
    Sound.play('streak');
    this.openModal('modalBadge');
  },

  _checkOutfits(){
    const level = this.progress.level;
    let unlocked = null;
    OUTFITS.forEach(outfit=>{
      if(outfit.level <= level){
        const od = this.outfitsData.find(o=>o.id===outfit.id);
        if(od && !od.unlocked){
          od.unlocked = true;
          od.unlockedAt = todayStr();
          unlocked = outfit;
        }
      }
    });
    this.save();
    if(unlocked){
      this._showOutfitUnlock(unlocked);
    }
  },

  _showOutfitUnlock(outfit){
    this.pendingOutfit = outfit.id;
    $('#outfitShowcase').innerHTML = Dacorta.svg('proud', outfit.id);
    $('#outfitShowcaseName').textContent = this.tObj(outfit.name);
    this.openModal('modalOutfit');
  },

  _giveChest(){
    // Give sticker every 5 lessons
    const total = this.progress.totalLessonsCompleted;
    if(total % 5 !== 0) return;

    const locked = this.stickers.filter(s=>!s.unlocked);
    if(locked.length === 0) return;

    const pick = locked[Math.floor(Math.random()*locked.length)];
    pick.unlocked = true;
    pick.unlockedAt = todayStr();
    this.save();

    const stkDef = STICKERS.find(s=>s.id===pick.id);
    if(stkDef){
      $('#chestSticker').innerHTML = Icons.stickerIcon(stkDef.icon, 80);
      Sound.play('streak');
      this.openModal('modalChest');
    }
  },

  _exitLesson(){
    $('#pageLesson').hidden = true;
    $('#pageResult').hidden = true;
    $('#comboIndicator').hidden = true;
    $('#hintBubble').hidden = true;
    $('#bottomNav').hidden = false;
    if(this.currentCat){
      this._showPath(this.currentCat);
    } else {
      this.navigate('home');
    }
  },

  _showHint(){
    const q = this.lessonQuestions[this.lessonIndex];
    if(!q || !q.hint) return;
    const bubble = $('#hintBubble');
    bubble.hidden = false;
    $('#hintText').textContent = this.tObj(q.hint);
    $('#hintMascot').innerHTML = Dacorta.svg('happy', this._equippedOutfit());
    Sound.play('click');
  }
};

/* ================================================
   SECTION 9: EVENT LISTENERS
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Setup name
  const nameInput = $('#inputChildName');
  if(nameInput){
    nameInput.addEventListener('input', ()=>{
      const v = nameInput.value.trim();
      $('#btnSubmitName').disabled = v.length === 0;
    });
  }
  $('#btnSubmitName').addEventListener('click', ()=> App._submitName());
  nameInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') App._submitName(); });

  // Age cards
  $$('.age-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      Sound.play('click');
      const tier = card.getAttribute('data-age');
      $$('.age-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(()=> App._selectAge(tier), 300);
    });
  });

  // Bottom nav
  $$('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const page = btn.getAttribute('data-page');
      Sound.play('click');
      App.navigate(page);
    });
  });

  // Path back
  $('#btnPathBack').addEventListener('click', ()=>{
    Sound.play('click');
    App.navigate('learn');
  });

  // Lesson close
  $('#btnLessonClose').addEventListener('click', ()=>{
    App.openModal('modalExitLesson');
    $('#modalExitMascot').innerHTML = Dacorta.svg('sad', App._equippedOutfit());
  });

  // Exit confirm
  $('#btnConfirmExit').addEventListener('click', ()=>{
    App.closeModal('modalExitLesson');
    App._exitLesson();
  });

  // Feedback next
  $('#btnFeedbackNext').addEventListener('click', ()=> App._nextQ());

  // Continue learning
  $('#btnContinue').addEventListener('click', ()=>{
    const lid = $('#btnContinue').getAttribute('data-lesson');
    if(lid) App.startLesson(lid);
  });

  // Result buttons
  $('#btnResultRetry').addEventListener('click', ()=>{
    Sound.play('click');
    App.startLesson(App.currentLessonId);
  });

  $('#btnResultNext').addEventListener('click', ()=>{
    Sound.play('click');
    const nextId = $('#btnResultNext').getAttribute('data-next-lid');
    if(nextId) App.startLesson(nextId);
    else App._exitLesson();
  });

  // Hint
  $('#btnHint').addEventListener('click', ()=> App._showHint());
  $('#hintClose').addEventListener('click', ()=>{ $('#hintBubble').hidden = true; });

  // Canvas controls
  $('#btnCanvasClear').addEventListener('click', ()=> App.clearCanvas());
  $('#btnCanvasCheck').addEventListener('click', ()=> App.checkTracing());

  // Settings
  $('#toggleTheme').addEventListener('change', ()=> App.toggleTheme());
  $('#toggleSound').addEventListener('change', ()=> App.toggleSound());
  $('#btnToggleLang').addEventListener('click', ()=> App.toggleLanguage());

  // Edit name
  $('#btnEditName').addEventListener('click', ()=>{
    $('#inputEditName').value = App.profile.name;
    App.openModal('modalEditName');
  });
  $('#btnSaveEditName').addEventListener('click', ()=>{
    const name = $('#inputEditName').value.trim();
    if(name){
      App.profile.name = name;
      App.save();
      App.closeModal('modalEditName');
      App.toast(App.t('toast_name_saved'), 'success');
      App.updateSettings();
      App.updateHome();
    }
  });

  // Edit age
  $('#btnEditAge').addEventListener('click', ()=> App.openModal('modalEditAge'));
  $$('[data-age-edit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      App.profile.ageTier = btn.getAttribute('data-age-edit');
      App.save();
      App.closeModal('modalEditAge');
      App.toast(App.t('toast_age_saved'), 'success');
      App.updateSettings();
    });
  });

  // About
  $('#btnAbout').addEventListener('click', ()=>{
    $('#modalAboutLogo').innerHTML = Icons.logo(64);
    App.openModal('modalAbout');
  });

  // Credits - open external page
  $('#btnCredits').addEventListener('click', ()=>{
    window.open('credits.html', '_self');
  });

  // Reset
  $('#btnResetData').addEventListener('click', ()=> App.openModal('modalReset'));
  $('#btnConfirmReset').addEventListener('click', ()=>{
    Store.nuke();
    App.closeModal('modalReset');
    App.toast(App.t('toast_data_reset'), 'error');
    setTimeout(()=> location.reload(), 1000);
  });

  // Equip outfit from modal
  $('#btnEquipOutfit').addEventListener('click', ()=>{
    if(App.pendingOutfit){
      App._equipOutfit(App.pendingOutfit);
      App.pendingOutfit = null;
    }
    App.closeModal('modalOutfit');
  });

  // Collection tabs
  $$('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      Sound.play('click');
      const tab = btn.getAttribute('data-tab');
      $$('.tab-btn').forEach(b=>{
        b.classList.toggle('active', b.getAttribute('data-tab')===tab);
        b.setAttribute('aria-selected', b.getAttribute('data-tab')===tab?'true':'false');
      });
      $$('.tab-content').forEach(tc=> tc.classList.toggle('active', tc.id === 'tab'+tab.charAt(0).toUpperCase()+tab.slice(1)));
    });
  });

  // Calendar nav
  $('#btnCalPrev').addEventListener('click', ()=>{
    App.calMonth--;
    if(App.calMonth < 0){ App.calMonth = 11; App.calYear--; }
    App.renderCal();
  });
  $('#btnCalNext').addEventListener('click', ()=>{
    App.calMonth++;
    if(App.calMonth > 11){ App.calMonth = 0; App.calYear++; }
    App.renderCal();
  });

  // Modal close buttons
  $$('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-close');
      App.closeModal(id);
    });
  });

  // Modal overlay click to close
  $$('.modal-overlay').forEach(overlay=>{
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) App.closeModal(overlay.id);
    });
  });

  // Prevent context menu on app (child safety)
  document.addEventListener('contextmenu', (e)=> e.preventDefault());

  // Init sound on first interaction
  document.addEventListener('click', ()=> Sound.init(), {once:true});
  document.addEventListener('touchstart', ()=> Sound.init(), {once:true});
});
