uniform float uTime;

varying vec3 vPosition;

void main()
{
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.2;
    float brightness = strength / distanceToCenter - strength * 2.0;
    brightness *= clamp(sin(uTime * vPosition.x * vPosition.y), 0.2, 1.0);

    gl_FragColor = vec4(vec3(1.0), brightness);
}

