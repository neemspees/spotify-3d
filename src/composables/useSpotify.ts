import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { SpotifyApi, Track, Episode } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const APP_PORT = 5173;

export function useSpotify() {
    const isReady = ref(false);

    const playingNow = ref<null|{
        itemId: string,
        artist: string,
        title: string,
        image: string,
        artistImage: string,
        paused: boolean,
        duration: number,
        position: number,
    }>(null);
    
    let player: Spotify.Player|null = null;
    let progressInterval: ReturnType<typeof setInterval>|null = null;

    const sdk = SpotifyApi.withUserAuthorization(CLIENT_ID, `http://localhost:${APP_PORT}`, ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state']);

    function load(): Promise<void> {
        return new Promise(res => {
            window.onSpotifyWebPlaybackSDKReady = () => {
                res();
            };

            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
        });
    };

    function unload(): void {
        window.onSpotifyWebPlaybackSDKReady = () => {};
        document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')?.remove();
    };

    function startProgress(): void {
        if (progressInterval) {
            return;
        }

        progressInterval = setInterval(() => {
            if (!playingNow.value) {
                return;
            }

            if (playingNow.value.paused) {
                return;
            }

            playingNow.value.position += 500;
        }, 500);
    }

    function stopProgress(): void {
        if (!progressInterval) {
            return;
        }

        clearInterval(progressInterval);
        progressInterval = null;
    }

    onMounted(() => {
        load().then(() => {
            player = new window.Spotify.Player({
                name: 'Spotify 3D',
                getOAuthToken: (cb) => {
                    sdk.authenticate().then(() => {
                        sdk.getAccessToken().then(token => {
                            if (!token) {
                                throw new Error('No token');
                            }

                            cb(token.access_token);
                        });
                    });
                },
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                isReady.value = true;
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
                isReady.value = false;
            });

            player.addListener('player_state_changed', state => {
                console.log('Player state changed', state);

            
                playingNow.value = {
                    itemId: state.playback_id,
                    artist: state.track_window.current_track.artists.map(a => a.name).join(', '),
                    title: state.track_window.current_track.name,
                    image: state.track_window.current_track.album.images[0].url,
                    artistImage: state.track_window.current_track.album.images[1].url,
                    paused: state.paused,
                    duration: state.duration,
                    position: state.position,
                };

                if (state.paused) {
                    stopProgress();
                } else {
                    startProgress();
                }
            });

            player.connect();
        });
    });

    onUnmounted(() => {
        unload();
    });

    const logOut = () => {
        sdk.logOut();
        console.log('Logged out');
    }

    return {
        isReady,
        playingNow,
        logOut,
        controls: {
            togglePlay: () => player?.togglePlay(),
            next: () => player?.nextTrack(),
            previous: () => player?.previousTrack(),
        },
    };
}

