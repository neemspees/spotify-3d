<script setup lang="ts">
import { useTexture, useLoop } from '@tresjs/core'; 
import { useGLTF } from '@tresjs/cientos';
import * as THREE from 'three';
import { watch, defineProps } from 'vue';
import vertexShader from '../../shaders/portal/vertex.glsl';
import fragmentShader from '../../shaders/portal/fragment.glsl';

const props = defineProps({
    portalImage: String,
});

const { onBeforeRender } = useLoop();

const { nodes } = await useGLTF('/models/portal/scene.glb');

const { map } = await useTexture({ map: '/models/portal/baked.jpg' });
map.flipY = false;
map.colorSpace = THREE.SRGBColorSpace;

const bakedMaterial = new THREE.MeshBasicMaterial({
    map,
});

const poleLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffe5,

});

const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uTexture: { value: null },
    },
});

nodes.Scene.children.forEach((child) => {
    if (! child.isMesh) {
        return;
    }

    if (child.name === 'baked') {
        child.material = bakedMaterial;
    }

    if (child.name.startsWith('poleLight')) {
        child.material = poleLightMaterial;
    }

    if (child.name === 'portalLight') {
        child.material = portalLightMaterial;
    }

    if (child.name === 'axeHead') {
        child.material = bakedMaterial;
    }

    if (child.name === 'axeHandle') {
        child.material = bakedMaterial;
    }
});

async function updatePortalTexture() {
    if (! props.portalImage) {
        return;
    }

    const { map } = await useTexture({ map: props.portalImage });

    portalLightMaterial.uniforms.uTexture.value = map;
    portalLightMaterial.needsUpdate = true;
}

await updatePortalTexture();

watch(props, async () => {
    await updatePortalTexture();
});

onBeforeRender(({ elapsed }) => {
    portalLightMaterial.uniforms.uTime.value = elapsed;
});
</script>

<template>
    <primitive :object="nodes.Scene" />
</template>

