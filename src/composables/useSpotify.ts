import { ref, onMounted, onBeforeUnmount } from 'vue';
import { SpotifyApi, Track, Episode } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const APP_PORT = 5173;

export function useSpotify() {
    const playingNow = ref<null|{
        artist: string,
        title: string,
        image: string,
        artistImage: string,
    }>(null);

    const sdk = SpotifyApi.withUserAuthorization(CLIENT_ID, `http://localhost:${APP_PORT}`, ['user-read-playback-state']);

    let intervalId: ReturnType<typeof setInterval>|null = null;

    onMounted(() => {
        intervalId = setInterval(() => {
            sdk.player.getPlaybackState().then(response => {
                if (! response?.item) {
                    playingNow.value = null;

                    return;
                }

                if (response.item.type === 'track') {
                    const item = response.item as Track;
                    
                    sdk.artists.get(item.artists[0].id).then(artist => {
                        playingNow.value = {
                            artistImage: artist.images[0].url,
                            artist: item.artists.map(artist => artist.name).join(', '),
                            title: item.name,
                            image: item.album.images[0].url,
                        };
                    });

                    return;
                }

                const item = response.item as Episode;

                playingNow.value = {
                    artistImage: item.show.images[0].url,
                    artist: item.show.publisher,
                    title: item.name,
                    image: item.images[0].url,
                };

                return;
            });
        }, 1000);
    });

    onBeforeUnmount(() => {
        if (! intervalId) {
            return;
        }

        clearInterval(intervalId);
    });

    return {
        playingNow,
    };
}

