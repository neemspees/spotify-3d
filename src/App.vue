<script setup lang="ts">
import { ref, Suspense, computed, watch } from 'vue';
import { TresCanvas } from '@tresjs/core';
import Scene from './components/Scene.vue';
import { useSpotify } from './composables/useSpotify';
import { FastAverageColor } from 'fast-average-color';

const { playingNow } = useSpotify();

const changeUrl = () => {
    songInfo.value.image = 'https://play-lh.googleusercontent.com/eN0IexSzxpUDMfFtm-OyM-nNs44Y74Q3k51bxAMhTvrTnuA4OGnTi_fodN4cl-XxDQc';
};

const backgroundColor = ref('#000000');
const foregroundColor = ref('#ffffff');

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
                    :image="playingNow?.image"
                    :artistImage="playingNow?.artistImage"
                />
            </TresCanvas>
        </div>
        <div
            @click="changeUrl"
            :style="{
                backgroundColor: backgroundColor,
                color: foregroundColor,
            }"
        >
            <img :src="playingNow?.image" alt="Album Cover" />
            <h2>{{ playingNow?.artist }}</h2>
            <h1>{{ playingNow?.title }}</h1>
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
    padding: 1rem;
    background-size: cover;
    gap: 1rem;
}

main > div:nth-child(2) > img {
    width: 100%;
    max-width: 300px;
    border-radius: 4rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
}
</style>

