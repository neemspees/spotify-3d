<script setup lang="ts">
import fragmentShader from '../../shaders/practice/fragment.glsl';
import vertexShader from '../../shaders/practice/vertex.glsl';
</script>

<template> 
    <TresShaderMaterial
        :fragment-shader="fragmentShader"
        :vertex-shader="vertexShader"
    />
</template>

