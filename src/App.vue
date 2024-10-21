<script setup lang="ts">
import { ref, Suspense, computed, watch } from 'vue';
import { TresCanvas } from '@tresjs/core';
import Scene from './components/Scene.vue';
import { useSpotify } from './composables/useSpotify';
import { FastAverageColor } from 'fast-average-color';
import spotifyLogo from './assets/spotify.png';

const { playerState, playerControls, logOut } = useSpotify();

const backgroundColor = ref('#000000');
const foregroundColor = ref('#ffffff');

function formatTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000) % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const progress = computed(() => {
    return playerState.value.position / playerState.value.duration * 100;
});

const elapsed = computed(() => {
    return formatTime(playerState.value.position);
});

const remaining = computed(() => {
    return formatTime(playerState.value.duration - playerState.value.position);
});

const songTitle = computed(() => {
    if (! playerState.value.ready) {
        return 'Connecting to Spotify...';
    } 

    if (! playerState.value.track) {
        return 'No Song Playing';
    }

    return playerState.value.track.name;
});

watch(() => playerState.value.track, () => {
    if (! playerState.value.track?.image) {
        backgroundColor.value = '#000000';
        return;
    }

    const fac = new FastAverageColor();
    fac.getColorAsync(playerState.value.track.image)
        .then(color => {
            backgroundColor.value = color.hex;
            foregroundColor.value = color.isDark ? '#ffffff' : '#000000';
        });
});
</script>

<template>
    <main>
        <div>
            <TresCanvas
                clear-color="#000000"
            >
                <Scene 
                    :title="songTitle"
                    :artist="playerState.track?.artist"
                    :image="playerState.track?.image ?? spotifyLogo"
                    :artistImage="playerState.track?.image ?? spotifyLogo"
                    :paused="playerState.paused"
                    :backgroundColor="backgroundColor"
                />
            </TresCanvas>
        </div>
        <div
            v-if="false"
            :style="{
                backgroundColor: backgroundColor,
                color: foregroundColor,
            }"
        >
            <button
                @click="logOut"
            >Logout</button>

            <img :src="playerState.track?.image ?? spotifyLogo" alt="Album Cover" />
            <h2>{{ playerState.track?.artists?.join(',') ?? 'Spotify 3D' }}</h2>
            <h1>{{ songTitle }}</h1>

            <div class="progress">
                <div :style="{ width: `${progress}%` }"></div>
                <div>
                    <span>{{ elapsed }}</span>
                    <span>-{{ remaining }}</span>
                </div>
            </div>

            <div class="controls">
                <button
                    @click="playerControls.previous"
                >⏮︎</button>
                <button
                    @click="playerControls.togglePlay"
                >{{ playerState.paused ? '&#9658;' : '⏸︎' }}</button>
                <button
                    @click="playerControls.next"
                >⏭︎</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    height: 100vh;
}

main > * {
    flex: 1;
}

main > div:nth-child(1) {
    background-color: gray;
} 

main > div:nth-child(2) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    background-size: cover;
    gap: 1rem;
}

main > div:nth-child(2) > img {
    width: 100%;
    max-width: 300px;
    border-radius: .4rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
}

main > div:nth-child(2) > button:first-of-type {
    position: absolute;
    top: 1rem;
    left: 1rem;
}

.progress {
    width: 100%;
    height: .4rem;
    background-color: #191919;
    margin-top: 1rem;
    border-radius: 0.5rem;
}

.progress > div:first-child {
    position: relative;
    width: 0%;
    height: 100%;
    background-color: #FFFFFF;
    transition: width 0.2s;
    border-radius: 0.5rem;
}

.progress > div:first-child::after {
    position: absolute;
    right: 0;
    content: '';
    display: block;
    width: 1rem;
    height: 1rem;
    background-color: inherit;
    border-radius: 50%;
    transform: translate(50%, -25%);
}

.progress > div:nth-child(2) {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding-top: .4rem;
}

.controls {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.controls > button {
    padding: 0.5rem;
    width: 4rem;
    height: 4rem;
    font-size: 1.8rem;
    border: none;
    border-radius: 50%;
    background-color: #1DB954;
    color: #000;
    cursor: pointer;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
}
</style>

