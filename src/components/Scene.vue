<script setup lang="ts">
import { ref, shallowRef, defineProps, watchEffect, onMounted, reactive, computed } from 'vue';
import { useTexture, useLoop, onAfterRender } from '@tresjs/core';
import { Reflector, OrbitControls } from '@tresjs/cientos';
import { Pane } from 'tweakpane';
import * as THREE from 'three';

const props = defineProps({
    title: String,
    artist: String,
    artistImage: String,
    album: String,
    image: String,
    backgroundColor: String,
});

const { onBeforeRender } = useLoop();

const boxRef = shallowRef(null);
const backWallRef = shallowRef(null);
const reflectionTexture = ref(null);
const boxState = reactive({
    size: 5,
    position: {
        x: -4,
        y: 0,
        z: -4,
    },
});

const pane = new Pane();
pane.addBinding(boxState, 'size', { label: 'Size' });
pane.addBinding(boxState.position, 'x', { label: 'X' });
pane.addBinding(boxState.position, 'y', { label: 'Y' });
pane.addBinding(boxState.position, 'z', { label: 'Z' });

async function loadTextures() {
    const response = await useTexture({ map: props.image });

    boxRef.value.material.map = response.map;
    boxRef.value.material.emissiveMap = response.map;
    boxRef.value.material.needsUpdate = true;

    const artistResponse = await useTexture({ map: props.artistImage });

    backWallRef.value.material.map = artistResponse.map;
    backWallRef.value.material.needsUpdate = true;
}

watchEffect(() => {
    loadTextures();
});

onMounted(() => {
    loadTextures();
});

onBeforeRender(({ delta, elapsed, renderer, scene }) => {
    boxRef.value.rotation.y += delta * .3;
    boxRef.value.rotation.x = Math.sin(elapsed) * 0.2;
    boxRef.value.position.y = Math.cos(elapsed) * 2;
});
</script>

<template>
    <TresPerspectiveCamera
        :position="[14, 1, 14]"
        :look-at="[0, 0, 0]"
    />

    <TresPerspectiveCamera
        ref="leftWallReflectionCameraRef"
        :look-at="[0, 0, 0]"
    />

    <TresMesh
        ref="boxRef"
        :position="[boxState.position.x, boxState.position.y, boxState.position.z]"
    >
        <TresBoxGeometry
            :args="[boxState.size, boxState.size, boxState.size]"
        />
        <TresMeshPhongMaterial
            :metalness="0.5"
            :emissiveIntensity="0.2"
            :toneMapped="false"
            emissive="#fefefe"
            color="#fefefe"
        />
    </TresMesh>
    
    <TresMesh
        ref="backWallRef"
        :position="[0, 0, -10]"
        :rotation="[0, 0, 0]"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
        <TresMeshBasicMaterial
            color="#3a3a3a"
            :roughness="0.5"
        />
    </TresMesh>

    <Reflector
        :position="[-10, 0, 0]"
        :rotation="[0, Math.PI / 2, 0]"
        color="#f7f7f7"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
    </Reflector>

    <TresMesh
        :position="[0, -10, 0]"
        :rotation="[-Math.PI / 2, 0, 0]"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
        <TresMeshPhongMaterial
            :shininess="200"
            :roughness="0.2"
            :metalness="0.5"
            specular="#ffffff"
            color="#ffffff"
        />
    </TresMesh>

    <TresMesh
        :position="[0, 10, 0]"
        :rotation="[Math.PI / 2, 0, 0]"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
        <TresMeshPhongMaterial
            :shininess="200"
            :roughness="0.2"
            :metalness="0.5"
            specular="#ffffff"
            color="#ffffff"
        />
    </TresMesh>

    <TresAmbientLight
        color="#ffffff"
        :intensity="0.1"
    />

    <TresPointLight
        :position="[1, 2, 3]"
        :intensity="20"
    />
</template>

<style scoped></style>

