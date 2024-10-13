import { ref, onMounted, onBeforeUnmount } from 'vue';
import { SpotifyApi, Track, Episode } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const APP_PORT = 5173;

const useTestData = true;

export function useSpotify() {
    const playingNow = ref<null|{
        itemId: string,
        artist: string,
        title: string,
        image: string,
        artistImage: string,
    }>(null);

    const sdk = SpotifyApi.withUserAuthorization(CLIENT_ID, `http://localhost:${APP_PORT}`, ['user-read-playback-state']);

    let intervalId: ReturnType<typeof setInterval>|null = null;

    onMounted(() => {
        if (useTestData) {
            playingNow.value = {
                itemId: '1',
                artist: 'Eminem',
                title: 'Business',
                image: 'https://i.scdn.co/image/ab67616d0000b273a8877f56d674a1bbdf618e5c',
                artistImage: 'https://ca.billboard.com/media-library/eminem.jpg?id=52518021&width=980',
            };

            return;
        }

        intervalId = setInterval(() => {
            sdk.player.getPlaybackState().then(response => {
                if (! response?.item) {
                    playingNow.value = null;

                    return;
                }

                if (response.item.id === playingNow.value?.itemId) {
                    return;
                }

                if (response.item.type === 'track') {
                    const item = response.item as Track;
                    
                    sdk.artists.get(item.artists[0].id).then(artist => {
                        playingNow.value = {
                            itemId: item.id,
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
                    itemId: item.id,
                    artistImage: item.show.images[0].url,
                    artist: item.show.publisher,
                    title: item.name,
                    image: item.images[0].url,
                };

                return;
            });
        }, 5000);
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

