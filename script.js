new Vue({
    el: '#app',
    data() {
        return {
            loaded: false,
            musicPlayerOpen: false,
            themesOpen: false,
            currentTheme: 'theme-default',
            isPlaying: false,
            currentTrackIndex: 0,
            currentPlaylistIndex: 0,
            isPlaylistDropdownOpen: false,
            player: null,
            baseUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/',
            playlists: [
                {
                    name: 'Metaphorical Music',
                    tracks: [
                        { id: '91429724', title: 'Blessing It Remix', artist: 'Nujabes' },
                        { id: '91430033', title: 'Horn In The Middle', artist: 'Nujabes' },
                        { id: '91430129', title: 'Lady Brown Feat. Cise Starr', artist: 'Nujabes' },
                        { id: '91430785', title: 'Kumomi', artist: 'Nujabes' },
                        { id: '91535099', title: 'Highs 2 Lows Feat. Cise Starr', artist: 'Nujabes' },
                        { id: '91538561', title: 'Beat Laments the World', artist: 'Nujabes' },
                        { id: '91539248', title: 'Letter form Yokosuka', artist: 'Nujabes' },
                        { id: '91539425', title: 'Think Different Feat. Substant', artist: 'Nujabes' },
                        { id: '91540824', title: 'A Day by Atmosphere Supreme', artist: 'Nujabes' },
                        { id: '91541248', title: 'Next View Feat. Uyama Hiroto', artist: 'Nujabes' },
                        { id: '91541928', title: 'Latitude Remix Feat. Five Deez', artist: 'Nujabes' },
                        { id: '91542590', title: 'F.I.L.O. Feat. Shing02', artist: 'Nujabes' },
                        { id: '91542844', title: 'Summer Gypsy', artist: 'Nujabes' },
                        { id: '91543793', title: 'The Final View', artist: 'Nujabes' },
                        { id: '49939510', title: 'Peaceland', artist: 'Nujabes' }
                    ]
                }
            ],
            windowPos: {
                x: 100,
                y: 100
            },
            themesPos: {
                x: 150,
                y: 150
            },
            isDragging: false,
            isThemesDragging: false,
            dragOffset: { x: 0, y: 0 }
        }
    },
    computed: {
        currentTrack() {
            return this.playlists[this.currentPlaylistIndex].tracks[this.currentTrackIndex];
        }
    },
    methods: {
        getTrackUrl(id) {
            return this.baseUrl + id;
        },
        finishLoading() {
            this.loaded = true;
        },
        openMusicPlayer() {
            this.musicPlayerOpen = true;
            this.$nextTick(() => {
                this.initPlayer();
            });
        },
        closeMusicPlayer() {
            if (this.player) {
                this.player.pause();
                this.isPlaying = false;
                this.player = null;
            }
            this.musicPlayerOpen = false;
        },
        openThemes() {
            this.themesOpen = true;
        },
        closeThemes() {
            this.themesOpen = false;
        },
        setTheme(theme) {
            this.currentTheme = theme;
            // Sauvegarder le thème dans localStorage pour le conserver
            localStorage.setItem('retroos-theme', theme);
        },
        initPlayer() {
            if (!this.musicPlayerOpen) return;
            
            const container = document.getElementById('soundcloud-player');
            if (!container) return;

            const iframe = document.createElement('iframe');
            iframe.src = this.getTrackUrl(this.currentTrack.id);
            iframe.width = "100%";
            iframe.height = "166";
            iframe.allow = 'autoplay';
            iframe.style.display = 'none';
            
            container.innerHTML = '';
            container.appendChild(iframe);
            
            this.player = SC.Widget(iframe);
            
            this.player.bind(SC.Widget.Events.READY, () => {
                this.player.bind(SC.Widget.Events.FINISH, () => {
                    this.nextTrack();
                });
                
                this.player.bind(SC.Widget.Events.PLAY, () => {
                    this.isPlaying = true;
                });
                
                this.player.bind(SC.Widget.Events.PAUSE, () => {
                    this.isPlaying = false;
                });
            });
        },
        togglePlay() {
            if (!this.player) {
                this.initPlayer();
                this.player.bind(SC.Widget.Events.READY, () => {
                    this.player.play();
                });
                return;
            }
            
            if (this.isPlaying) {
                this.player.pause();
            } else {
                this.player.play();
            }
        },
        nextTrack() {
            if (!this.player) return;
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlists[this.currentPlaylistIndex].tracks.length;
            this.initPlayer();
            this.player.bind(SC.Widget.Events.READY, () => {
                this.player.play();
            });
        },
        previousTrack() {
            if (!this.player) return;
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlists[this.currentPlaylistIndex].tracks.length) % this.playlists[this.currentPlaylistIndex].tracks.length;
            this.initPlayer();
            this.player.bind(SC.Widget.Events.READY, () => {
                this.player.play();
            });
        },
        startDragging(e) {
            this.isDragging = true;
            this.dragOffset.x = e.clientX - this.windowPos.x;
            this.dragOffset.y = e.clientY - this.windowPos.y;

            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDragging);
        },
        startDraggingThemes(e) {
            this.isThemesDragging = true;
            this.dragOffset.x = e.clientX - this.themesPos.x;
            this.dragOffset.y = e.clientY - this.themesPos.y;
            document.addEventListener('mousemove', this.onDragThemes);
            document.addEventListener('mouseup', this.stopDraggingThemes);
        },
        onDrag(e) {
            if (!this.isDragging) return;
            
            this.windowPos.x = e.clientX - this.dragOffset.x;
            this.windowPos.y = e.clientY - this.dragOffset.y;
        },
        onDragThemes(e) {
            if (!this.isThemesDragging) return;
            
            this.themesPos.x = e.clientX - this.dragOffset.x;
            this.themesPos.y = e.clientY - this.dragOffset.y;
        },
        stopDragging() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDragging);
        },
        stopDraggingThemes() {
            this.isThemesDragging = false;
            document.removeEventListener('mousemove', this.onDragThemes);
            document.removeEventListener('mouseup', this.stopDraggingThemes);
        },
        handleKeydown(event) {
            switch (event.key) {
                case ' ': // Espace
                    event.preventDefault(); // Empêche le défilement de la page
                    this.togglePlay(); // Joue ou met en pause
                    break;
                case 'ArrowRight': // Flèche droite
                    this.nextTrack(); // Passe à la piste suivante
                    break;
                case 'ArrowLeft': // Flèche gauche
                    this.previousTrack(); // Revient à la piste précédente
                    break;
            }
        },
        togglePlaylistDropdown() {
            this.isPlaylistDropdownOpen = !this.isPlaylistDropdownOpen;
        },
        selectPlaylist(index) {
            this.currentPlaylistIndex = index;
            this.isPlaylistDropdownOpen = false;
            this.currentTrackIndex = 0;
            this.initPlayer();
        },
        updatePlaylist(event) {
            const selectedPlaylistName = event.target.value;
            const selectedPlaylist = this.playlists.find(playlist => playlist.name === selectedPlaylistName);
            this.currentTrackIndex = 0; // Réinitialiser l'index de la piste
            this.playlist = selectedPlaylist.tracks; // Mettre à jour la playlist actuelle
            this.initPlayer(); // Initialiser le lecteur avec la nouvelle playlist
        }
    },
    mounted() {
        // Charger le thème sauvegardé s'il existe
        const savedTheme = localStorage.getItem('retroos-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        // Écoute des événements de touches
        document.addEventListener('keydown', this.handleKeydown);
    }
});
