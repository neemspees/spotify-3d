<script setup lang="ts">
import { ref, shallowRef, defineProps, watchEffect, onMounted, reactive, computed } from 'vue';
import { useTexture, useLoop, onAfterRender } from '@tresjs/core';
import { Reflector, OrbitControls } from '@tresjs/cientos';
import TestShaderMaterial from './materials/TestShaderMaterial.vue';
import { Pane } from 'tweakpane';

const props = defineProps({
    title: String,
    artist: String,
    artistImage: String,
    album: String,
    image: String,
    paused: Boolean,
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
        y: -4,
        z: -4,
    },
});
const testShaderState = reactive({
    speed: 1,
    scale: 1,
    frequency: 1,
    color: '#FF00FF',
    texture: null,
});

const pane = new Pane();
pane.addBinding(boxState, 'size', { label: 'Size' });
pane.addBinding(boxState.position, 'x', { label: 'X' });
pane.addBinding(boxState.position, 'y', { label: 'Y' });
pane.addBinding(boxState.position, 'z', { label: 'Z' });

const testShaderFolder = pane.addFolder({ title: 'Test Shader' });
testShaderFolder.addBinding(testShaderState, 'speed', { label: 'Speed' });
testShaderFolder.addBinding(testShaderState, 'scale', { label: 'Scale' });
testShaderFolder.addBinding(testShaderState, 'frequency', { label: 'Frequency' });
testShaderFolder.addBinding(testShaderState, 'color');

async function loadTextures() {
    const response = await useTexture({ map: props.image });

    boxRef.value.material.map = response.map;
    boxRef.value.material.emissiveMap = response.map;
    boxRef.value.material.needsUpdate = true;

    testShaderState.texture = response.map;

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
    boxState.size = Math.sin(elapsed * .7) * .5 + 6;

    if (props.paused) {
        boxRef.value.rotation.y += delta * .1;
        return;
    }

    boxRef.value.rotation.y += delta * .2;
    boxRef.value.rotation.x += delta * 0.2;
});
</script>

<template>
    <OrbitControls/>
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
            :emissiveIntensity="0.2"
            :toneMapped="false"
            :opacity="0.9"
            :transparent="true"
            emissive="#d2f1dd"
            color="#fefefe"
        />
    </TresMesh>
    
    <TresMesh
        ref="shadedRef"
        :position="[0, 3, 0]"
    >
        <TresBoxGeometry
            :args="[5, 5, 5, 32, 32, 32]"
        />
        <TestShaderMaterial
            :speed="testShaderState.speed"
            :scale="testShaderState.scale"
            :frequency="testShaderState.frequency"
            :color="testShaderState.color"
            :texture="testShaderState.texture"
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
            v-if="artistImage"
            color="#3a3a3a"
            :roughness="0.5"
        />
        <TresMeshPhongMaterial
            v-else
            color="#797979"
            :roughness="0.2"
            :shininess="30"
            specular="#179443"
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

