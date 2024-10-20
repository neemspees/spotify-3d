import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { SpotifyApi, Track, Episode } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const APP_PORT = 5173;

type Track = {
    id: string,
    name: string,
    artists: string[],
    image: string,
};

type PlayerState = {
    name: string,
    ready: boolean,
    paused: boolean,
    duration: number,
    position: number,
    track: Track|null,
};

export function useSpotify() {
    const playerState = ref<PlayerState>({
        name: 'Spotify 3D',
        ready: false,
        paused: true,
        duration: 0,
        position: 0,
        track: null,
    });
    
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
            if (playerState.value.paused) {
                return;
            }

            playerState.value.position += 500;
        }, 500);
    }

    function stopProgress(): void {
        if (!progressInterval) {
            return;
        }

        clearInterval(progressInterval);
        progressInterval = null;
    }

    function updateState(newState: Spotify.PlaybackState): void {
        playerState.value.paused = newState.paused;
        playerState.value.duration = newState.duration;
        playerState.value.position = newState.position;

        playerState.value.track = {
            id: newState.track_window.current_track.uid,
            name: newState.track_window.current_track.name,
            artists: newState.track_window.current_track.artists.map(a => a.name),
            image: newState.track_window.current_track.album.images[0].url,
        };

        if (newState.paused) {
            stopProgress();
        } else {
            startProgress();
        }
    }

    onMounted(() => {
        load().then(() => {
            player = new window.Spotify.Player({
                name: playerState.value.name,
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
                playerState.value.ready = true;

            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
                playerState.value.ready = false;
            });

            player.addListener('player_state_changed', newState => {
                console.log('Player state changed', newState);

                updateState(newState);
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
        window.location.reload();
    }

    return {
        playerState,
        logOut,
        playerControls: {
            togglePlay: () => player?.togglePlay(),
            next: () => player?.nextTrack(),
            previous: () => player?.previousTrack(),
        },
    };
}

