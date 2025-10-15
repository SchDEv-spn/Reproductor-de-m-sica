// capturamos las varibles globales
const audioPlayer = document.getElementById('audio-player');
const currentSongTitle = document.getElementById('current-song-title');
const currentArtist = document.getElementById('current-artist');
const currentAlbumCover = document.getElementById('current-album-cover');
const playBtn = document.getElementById('play-btn');
const playlistPlayBtn = document.getElementById('playlist-play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const playlistProgressBar = document.getElementById('playlist-progress-bar');
const currentTime = document.getElementById('current-time');
const totalTime = document.getElementById('total-time');
const playlistCurrentTime = document.getElementById('playlist-current-time');
const playlistTotalTime = document.getElementById('playlist-total-time');
const songsList = document.getElementById('songs-list');
const songsCount = document.getElementById('songs-count');
const volumeLevel = document.getElementById('volume-level');

// -----------------------------------------------------------------------------
// Variables globales
// -----------------------------------------------------------------------------
let canciones = [];
let cancionActual = 0;
let estaReproduciendo = false;

// -----------------------------------------------------------------------------
// Carga inicial de datos
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    fetch('canciones.json')
        .then(response => response.json())
        .then(data => {
            canciones = data;
            mostrarPlaylist();
            cargarCancion(cancionActual);
            actualizarContadorCanciones();
        })
        .catch(err => console.error('Error al cargar las canciones:', err));
});

// -----------------------------------------------------------------------------
// Función: mostrarPlaylist
// Descripción: Crea dinámicamente la lista de canciones
// -----------------------------------------------------------------------------
function mostrarPlaylist() {
    songsList.innerHTML = '';
    
    canciones.forEach((cancion, index) => {
        const cancionItem = document.createElement('div');
        cancionItem.className = `song-item ${index === cancionActual ? 'active' : ''}`;
        cancionItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <img src="${cancion.portada}" alt="${cancion.titulo}" class="song-thumb">
            <div class="song-info">
                <div class="song-name">${cancion.titulo}</div>
                <div class="song-artist">${cancion.artista} • ${cancion.duracion}</div>
            </div>
            <div class="now-playing-indicator">▶</div>
        `;
        
        cancionItem.addEventListener('click', () => {
            cancionActual = index;
            cargarCancion(cancionActual);
            reproducir();
            actualizarPlaylist();
        });
        
        songsList.appendChild(cancionItem);
    });
}

// -----------------------------------------------------------------------------
// Función: cargarCancion
// Parámetros: indice - posición de la canción en el array
// Descripción: Carga la canción en el reproductor
// -----------------------------------------------------------------------------
function cargarCancion(indice) {
    const cancion = canciones[indice];
    
    audioPlayer.src = cancion.archivo;
    currentSongTitle.textContent = cancion.titulo;
    currentArtist.textContent = cancion.artista;
    currentAlbumCover.src = cancion.portada;
    currentAlbumCover.alt = cancion.titulo;
    
    // Actualizar la información de tiempo cuando se cargue la metadata
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatoTiempo(audioPlayer.duration);
        playlistTotalTime.textContent = formatoTiempo(audioPlayer.duration);
    });
    
    actualizarPlaylist();
}

// -----------------------------------------------------------------------------
// Función: reproducir
// Descripción: Reproduce o pausa la canción actual
// -----------------------------------------------------------------------------
function reproducir() {
    if (estaReproduciendo) {
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        playlistPlayBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    } else {
        audioPlayer.play();
        playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        playlistPlayBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    }
    estaReproduciendo = !estaReproduciendo;
}

// -----------------------------------------------------------------------------
// Función: formatoTiempo
// Parámetros: segundos - tiempo en segundos
// Descripción: Convierte segundos a formato mm:ss
// -----------------------------------------------------------------------------
function formatoTiempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

// -----------------------------------------------------------------------------
// Función: actualizarPlaylist
// Descripción: Actualiza los estilos de la playlist
// -----------------------------------------------------------------------------
function actualizarPlaylist() {
    const items = document.querySelectorAll('.song-item');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === cancionActual);
    });
}

// -----------------------------------------------------------------------------
// Función: actualizarContadorCanciones
// Descripción: Actualiza el contador de canciones
// -----------------------------------------------------------------------------
function actualizarContadorCanciones() {
    songsCount.textContent = `${canciones.length} canciones`;
}

// -----------------------------------------------------------------------------
// Event Listeners
// -----------------------------------------------------------------------------
// Botones de reproducción
playBtn.addEventListener('click', reproducir);
playlistPlayBtn.addEventListener('click', reproducir);

// Botones anterior/siguiente
prevBtn.addEventListener('click', () => {
    cancionActual = cancionActual > 0 ? cancionActual - 1 : canciones.length - 1;
    cargarCancion(cancionActual);
    if (estaReproduciendo) reproducir();
});

nextBtn.addEventListener('click', () => {
    cancionActual = cancionActual < canciones.length - 1 ? cancionActual + 1 : 0;
    cargarCancion(cancionActual);
    if (estaReproduciendo) reproducir();
});

// Actualizar barra de progreso
audioPlayer.addEventListener('timeupdate', () => {
    const progreso = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progreso}%`;
    playlistProgressBar.style.width = `${progreso}%`;
    
    currentTime.textContent = formatoTiempo(audioPlayer.currentTime);
    playlistCurrentTime.textContent = formatoTiempo(audioPlayer.currentTime);
});

// Click en barra de progreso para buscar
document.querySelectorAll('.progress-container').forEach(container => {
    container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });
});

