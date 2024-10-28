<script setup lang="ts">
import { Suspense, defineProps } from 'vue';
import { OrbitControls } from '@tresjs/cientos';
import Portal from './models/Portal.vue';
import Fireflies from './Fireflies.vue';

const props = defineProps({
    title: String,
    artist: String,
    artistImage: String,
    album: String,
    image: String,
    paused: Boolean,
    backgroundColor: String,
});
</script>

<template>
    <OrbitControls
        :enablePan="false"
        :maxAzimuthAngle="Math.PI * 0.35"
        :minAzimuthAngle="Math.PI * -0.35"
        :maxPolarAngle="Math.PI * 0.35"
        :minPolarAngle="Math.PI * 0.1"
        :maxDistance="8"
        :minDistance="4"
    />

    <TresPerspectiveCamera
        :position="[1, 3, 6]"
        :look-at="[0, 0, 0]"
    />

    <Fireflies />
    
    <Suspense>
        <Portal
            :portalImage="props.image"
        />
    </Suspense>
</template>

<style scoped></style>

