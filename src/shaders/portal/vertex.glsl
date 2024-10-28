uniform float uTime;

varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    modelPosition.z += sin(uTime + position.x * 2.0) * 0.02;
    modelPosition.z += sin(uTime + position.y * 1.0) * 0.03;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
}

