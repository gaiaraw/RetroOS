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
            player: null,
            baseUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/',
            playlist: [
                {
                    id: '25132104',
                    title: 'Hometown',
                    artist: 'French 79'
                },
                {
                    id: '21559550',
                    title: 'Salzburg',
                    artist: 'Worakls'
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
            return this.playlist[this.currentTrackIndex];
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
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.initPlayer();
            this.player.bind(SC.Widget.Events.READY, () => {
                this.player.play();
            });
        },
        previousTrack() {
            if (!this.player) return;
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
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
        }
    },
    mounted() {
        // Charger le thème sauvegardé s'il existe
        const savedTheme = localStorage.getItem('retroos-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
    }
});
