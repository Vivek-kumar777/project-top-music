const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const likeBtn = document.getElementById('like');
const autoplayBtn = document.getElementById('autoplay');
const progress = document.getElementById('progress');
const progressContainer = document.querySelector('.progress-container');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlistEl = document.getElementById('playlist');
const tabBtns = document.querySelectorAll('.tab-btn');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Set canvas size to match display size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio visualization setup with Web Audio API
let animationId;
let isPlaying = false;
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let source;
let isAudioContextSetup = false;

function setupAudioContext() {
    if (isAudioContextSetup) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    isAudioContextSetup = true;
}

function getWaveGradient() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(0.55, '#7c3aed');
    gradient.addColorStop(1, '#ef476f');
    return gradient;
}

function drawVisualizer() {
    if (!isAudioContextSetup) {
        return;
    }

    if (!isPlaying) {
        // Keep the last frame frozen when paused
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    const binCount = dataArray.length;
    // define bar width and gap
    const gap = 1;
    const barWidth = Math.max(1, (width / binCount) - gap);

    ctx.fillStyle = getWaveGradient();

    for (let i = 0; i < binCount; i++) {
        const value = dataArray[i];
        const amp = value / 255;
        const barHeight = amp * height;
        const x = i * (barWidth + gap);

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    }

    animationId = requestAnimationFrame(drawVisualizer);
}

// Language notice: always show modal on page load (no reopen/info button)
const noticeEl = document.getElementById('language-notice');
const noticeCloseBtn = document.getElementById('notice-close');
const containerEl = document.querySelector('.container');

if (noticeEl && noticeCloseBtn) {
    // always display the notice each visit
    noticeEl.style.display = 'flex';
    if (containerEl) containerEl.classList.add('blurred');

    noticeCloseBtn.addEventListener('click', () => {
        noticeEl.style.display = 'none';
        if (containerEl) containerEl.classList.remove('blurred');
    });
}

let songs = [];
let currentSongIndex = 0;
let autoplay = true;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [29];
const defaultCreatorsChoice = [0, 1, 2, 4, 8, 11, 13, 15, 16, 19, 22, 26, 29, 30, 37, 39, 40, 41, 45, 47, 49, 51, 53, 54, 55, 58, 59, 60];
let creatorsChoice = defaultCreatorsChoice;
localStorage.setItem('creatorsChoice', JSON.stringify(defaultCreatorsChoice));
let currentTab = 'all';

// Load songs from songs.json
fetch('songs.json')
    .then(response => response.json())
    .then(data => {
        songs = data.songs;
        loadSong(currentSongIndex);
        createPlaylist();
        // Initialize visualizer
        drawVisualizer();
    })
    .catch(error => {
        console.error('Error loading songs:', error);
        songTitle.textContent = 'Error loading playlist';
        songArtist.textContent = 'Check songs.json file';
    });

function loadSong(index) {
    if (songs.length === 0) return;
    
    const song = songs[index];
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    // allow cross-origin audio so the Web Audio API can analyze it
    audio.crossOrigin = 'anonymous';
    audio.src = song.url;
    updateLikeButton();
}

function playSong() {
    if (!isAudioContextSetup) {
        setupAudioContext();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    playBtn.textContent = '⏸️';
    audio.play();
    isPlaying = true;
    drawVisualizer();
}

function pauseSong() {
    playBtn.textContent = '▶️';
    audio.pause();
    isPlaying = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

function getActivePlaylist() {
    if (currentTab === 'all') {
        return songs.map((_, i) => i);
    } else if (currentTab === 'creators-choice') {
        return creatorsChoice.filter(i => i >= 0 && i < songs.length);
    } else if (currentTab === 'favorites') {
        return favorites.filter(i => i >= 0 && i < songs.length);
    }
    return songs.map((_, i) => i);
}

function prevSong() {
    const playlist = getActivePlaylist();
    const currentPos = playlist.indexOf(currentSongIndex);
    
    if (currentPos > 0) {
        currentSongIndex = playlist[currentPos - 1];
    } else {
        currentSongIndex = playlist[playlist.length - 1];
    }
    
    loadSong(currentSongIndex);
    playSong();
    updatePlaylistActive();
}

function nextSong() {
    const playlist = getActivePlaylist();
    const currentPos = playlist.indexOf(currentSongIndex);
    
    if (currentPos >= 0 && currentPos < playlist.length - 1) {
        currentSongIndex = playlist[currentPos + 1];
    } else {
        currentSongIndex = playlist[0];
    }
    
    loadSong(currentSongIndex);
    playSong();
    updatePlaylistActive();
}

function updateProgress() {
    const { duration, currentTime } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    if (duration) {
        durationEl.textContent = formatTime(duration);
    }
}

function setProgress(e) {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX || (e.touches ? e.touches[0].clientX - progressContainer.getBoundingClientRect().left : 0);
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function createPlaylist() {
    playlistEl.innerHTML = '';
    
    let displaySongs = [];
    let songIndices = [];
    
    if (currentTab === 'all') {
        displaySongs = songs;
        songIndices = songs.map((_, i) => i);
    } else if (currentTab === 'creators-choice') {
        // Filter out any invalid indices and map to songs
        songIndices = creatorsChoice.filter(i => i >= 0 && i < songs.length);
        displaySongs = songIndices.map(i => songs[i]);
        console.log('Creator\'s Choice - Indices:', songIndices, 'Display Songs:', displaySongs.length);
    } else if (currentTab === 'favorites') {
        // Filter out any invalid indices and map to songs
        songIndices = favorites.filter(i => i >= 0 && i < songs.length);
        displaySongs = songIndices.map(i => songs[i]);
    }
    
    if (displaySongs.length === 0 && currentTab === 'creators-choice') {
        playlistEl.innerHTML = '<div class="empty-message">No Creator\'s Choice songs yet!<br>⭐ Add songs to Creator\'s Choice</div>';
        return;
    }
    
    if (displaySongs.length === 0 && currentTab === 'favorites') {
        playlistEl.innerHTML = '<div class="empty-message">No favorite songs yet!<br>❤️ Click the heart to add favorites</div>';
        return;
    }
    
    displaySongs.forEach((song, displayIndex) => {
        const actualIndex = songIndices[displayIndex];
        const li = document.createElement('li');
        const isFavorite = favorites.includes(actualIndex);
        
        li.innerHTML = `
            <span class="song-name">${song.title} - ${song.artist}</span>
            <span class="song-like" data-index="${actualIndex}">${isFavorite ? '❤️' : '🤍'}</span>
        `;
        
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('song-like')) {
                toggleFavorite(parseInt(e.target.dataset.index));
            } else {
                currentSongIndex = actualIndex;
                loadSong(currentSongIndex);
                playSong();
                updatePlaylistActive();
            }
        });
        
        playlistEl.appendChild(li);
    });
    updatePlaylistActive();
}

function updatePlaylistActive() {
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item) => {
        const likeBtn = item.querySelector('.song-like');
        if (likeBtn && parseInt(likeBtn.dataset.index) === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function toggleFavorite(index) {
    const favIndex = favorites.indexOf(index);
    if (favIndex > -1) {
        favorites.splice(favIndex, 1);
    } else {
        favorites.push(index);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    createPlaylist();
    updateLikeButton();
}

function updateLikeButton() {
    if (favorites.includes(currentSongIndex)) {
        likeBtn.textContent = '❤️';
        likeBtn.classList.add('liked');
    } else {
        likeBtn.textContent = '🤍';
        likeBtn.classList.remove('liked');
    }
}

function toggleAutoplay() {
    autoplay = !autoplay;
    if (autoplay) {
        autoplayBtn.classList.add('active');
    } else {
        autoplayBtn.classList.remove('active');
    }
    localStorage.setItem('autoplay', autoplay);
}



// Event Listeners
playBtn.addEventListener('click', () => {
    const isPlaying = !audio.paused;
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);
progressContainer.addEventListener('touchstart', (e) => {
    setProgress(e);
});
progressContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    setProgress(e);
});
audio.addEventListener('ended', () => {
    if (autoplay) {
        nextSong();
    } else {
        pauseSong();
    }
});

likeBtn.addEventListener('click', () => {
    toggleFavorite(currentSongIndex);
});

autoplayBtn.addEventListener('click', toggleAutoplay);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        createPlaylist();
    });
});

// Load autoplay preference
const savedAutoplay = localStorage.getItem('autoplay');
if (savedAutoplay !== null) {
    autoplay = savedAutoplay === 'true';
    if (!autoplay) {
        autoplayBtn.classList.remove('active');
    }
}
