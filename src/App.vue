<script setup lang="ts">
import { ref, Suspense, computed, watch } from 'vue';
import { TresCanvas } from '@tresjs/core';
import Scene from './components/Scene.vue';
import { useSpotify } from './composables/useSpotify';
import { FastAverageColor } from 'fast-average-color';
import spotifyLogo from './assets/spotify.png';

const { playingNow, logOut, controls } = useSpotify();

const backgroundColor = ref('#000000');
const foregroundColor = ref('#ffffff');

function formatTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000) % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const progress = computed(() => {
    if (! playingNow.value) {
        return 0;
    }

    return playingNow.value.position / playingNow.value.duration * 100;
});

const elapsed = computed(() => {
    if (! playingNow.value) {
        return '00:00';
    }

    return formatTime(playingNow.value.position);
});

const remaining = computed(() => {
    if (! playingNow.value) {
        return '00:00';
    }

    return formatTime(playingNow.value.duration - playingNow.value.position);
});

watch(playingNow, () => {
    if (! playingNow.value?.image) {
        backgroundColor.value = '#000000';
        return;
    }

    const fac = new FastAverageColor();
    fac.getColorAsync(playingNow.value.image)
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
                    :title="playingNow?.title"
                    :artist="playingNow?.artist"
                    :image="playingNow?.image ?? spotifyLogo"
                    :artistImage="playingNow?.artistImage ?? spotifyLogo"
                    :paused="playingNow?.paused ?? true"
                    :backgroundColor="backgroundColor"
                />
            </TresCanvas>
        </div>
        <div
            :style="{
                backgroundColor: backgroundColor,
                color: foregroundColor,
            }"
        >
            <button
                @click="logOut"
            >Logout</button>

            <img :src="playingNow?.image ?? spotifyLogo" alt="Album Cover" />
            <h2>{{ playingNow?.artist ?? 'Spotify 3D' }}</h2>
            <h1>{{ playingNow?.title ?? 'Waiting for Connection' }}</h1>

            <div class="progress">
                <div :style="{ width: `${progress}%` }"></div>
                <div>
                    <span>{{ elapsed }}</span>
                    <span>-{{ remaining }}</span>
                </div>
            </div>

            <div class="controls">
                <button
                    @click="controls.previous"
                >⏮︎</button>
                <button
                    :disbaled="! playingNow"
                    @click="controls.togglePlay"
                >{{ playingNow?.paused ? '&#9658;' : '⏸︎' }}</button>
                <button
                    @click="controls.next"
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

