<script setup lang="ts">
import { ref, shallowRef, defineProps, watchEffect, onMounted } from 'vue';
import { useTexture, useLoop } from '@tresjs/core';
import * as THREE from 'three';

// TODO - I was setting up reflections but its not working yet
// The cube camera should be rendered on the render target
// which in turn should be used as a texture for the reflection material.
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_cubemap_dynamic.html
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
cubeRenderTarget.texture.type = THREE.HalffloatType;
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

const props = defineProps({
    title: String,
    artist: String,
    artistImage: String,
    album: String,
    image: String,
});

const { onBeforeRender } = useLoop();

const texture = ref(null);
const artistTexture = ref(null);
const boxRef = shallowRef(null);
const reflectionTexture = ref(null);

async function loadTextures() {
    const response = await useTexture({ map: props.image });

    texture.value = response.map;

    const artistResponse = await useTexture({ map: props.artistImage });

    artistTexture.value = artistResponse.map;
}

watchEffect(() => {
    loadTextures();
});

onMounted(() => {
    loadTextures();
    reflectionTexture.value = cubeRenderTarget.texture;
});

onBeforeRender(({ delta, elapsed, renderer, scene }) => {
    boxRef.value.rotation.y += delta * .3;
    boxRef.value.rotation.x = Math.sin(elapsed) * 0.2;
    cubeCamera.update(renderer, scene);
});
</script>

<template>
    <TresPerspectiveCamera
      :position="[1.3, 1, 5]"
      :look-at="[0, 0, 0]"
    />

    <TresMesh
        ref="boxRef"
    >
        <TresBoxGeometry />
        <TresMeshPhongMaterial
            v-if="texture"
            :map="texture"
            :metalness="0.5"
            :emissiveMap="texture"
            :emissiveIntensity="0.5"
            color="#fefefe"
        />
    </TresMesh>
<!--
    <TresMesh
        :position="[0, 1, 0]"
    >
        <TresBoxGeometry />
        <TresMeshStandardMaterial
            :map="reflectionTexture"
            :metalness="1"
            :roughness="0.05"
        />
    </TresMesh>
-->
    
    <TresMesh
        :position="[0, 0, -20]"
        :rotation="[0, 0, 0]"
            v-if="artistTexture"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
        <TresMeshBasicMaterial
            color="#3a3a3a"
            :map="artistTexture"
            :roughness="0.5"
        />
    </TresMesh>
    
    <TresMesh
        :position="[-10, 0, -10]"
        :rotation="[0, Math.PI / 2, 0]"
    >
        <TresPlaneGeometry
            :args="[20, 20]"
        />
        <TresMeshBasicMaterial color="#2a2a2a" />
    </TresMesh>

    <TresMesh
        :position="[0, -5, -10]"
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

