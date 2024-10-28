uniform float uPixelRatio;
uniform float uTime;

attribute float aScale;

varying vec3 vPosition;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.z += sin(modelPosition.x * 10.0 + uTime * 2.0) * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = 40.0 * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vPosition = modelPosition.xyz;
}

