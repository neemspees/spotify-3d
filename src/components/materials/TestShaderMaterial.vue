<script setup lang="ts">
import { useLoop } from '@tresjs/core';
import { shallowRef, ref, watchEffect } from 'vue';
import fragmentShader from '../../shaders/test/fragment.glsl';
import vertexShader from '../../shaders/test/vertex.glsl';
import * as THREE from 'three';

const props = defineProps({
    scale: {
        type: Number,
        default: 1,
    },
    frequency: {
        type: Number,
        default: 1,
    },
    speed: {
        type: Number,
        default: 1,
    },
    color: {
        type: String,
        default: '#FF00FF',
    },
    texture: {
        type: Object as THREE.Texture | null,
        default: null,
    },
});

const { onBeforeRender } = useLoop();

const materialRef = shallowRef(null);

watchEffect(() => {
    if (!materialRef.value) {
        return;
    }

    materialRef.value.uniforms.uFrequency.value = props.frequency;
    materialRef.value.uniforms.uScale.value = props.scale;
    materialRef.value.uniforms.uSpeed.value = props.speed;
    materialRef.value.uniforms.uColor.value = new THREE.Color(props.color);

    if (props.texture) {
        materialRef.value.uniforms.uTexture.value = props.texture;
    }
});

onBeforeRender(({ elapsed }) => {
    materialRef.value.uniforms.uTime.value = elapsed;
});
</script>

<template> 
    <TresShaderMaterial
        ref="materialRef"
        :fragment-shader="fragmentShader"
        :vertex-shader="vertexShader"
        :transparent="true"
        :uniforms="{ 
            uTime: { value: 0 },
            uSpeed: { value: 1 },
            uScale: { value: 1 },
            uFrequency: { value: 1 },
            uColor: { value: null },
            uTexture: { value: null },
        }"
    />
</template>

