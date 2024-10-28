<script setup lang="ts">
import * as THREE from 'three';
import vertexShader from '../shaders/fireflies/vertex.glsl';
import fragmentShader from '../shaders/fireflies/fragment.glsl';
import { computed, shallowRef } from 'vue';
import { useLoop } from '@tresjs/core';

const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = Math.random() * 4 - 2;
    positionArray[i * 3 + 1] = Math.random() * 2;
    positionArray[i * 3 + 2] = Math.random() * 4 - 2;

    scaleArray[i] = Math.random() * 2;
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

const { onBeforeRender } = useLoop();

const shaderRef = shallowRef(null);

const pixelRatio = computed(() => {
    return Math.min(window.devicePixelRatio, 2);
});

onBeforeRender(({ elapsed }) => {
    if (! shaderRef.value) {
        return;
    }

    shaderRef.value.uniforms.uTime.value = elapsed;
    shaderRef.value.needsUpdate = true;
});
</script>

<template>
    <TresPoints
        :geometry="firefliesGeometry"
    >
        <TresShaderMaterial
            ref="shaderRef"
            :transparent="true"
            :vertexShader="vertexShader"
            :fragmentShader="fragmentShader"
            :blending="THREE.AdditiveBlending"
            :uniforms="{
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(pixelRatio, 2) },
            }"
        />
    </TresPoints>
</template>

