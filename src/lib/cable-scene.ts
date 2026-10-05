// Parametric tube samples are shared by three independently animated 3D cables.
export function createCableTube(segments = 128, sides = 16) {
  const samples = new Float32Array((segments + 1) * sides * 2);
  const indices = new Uint16Array(segments * sides * 6);
  for (let ring = 0; ring <= segments; ring++) {
    for (let side = 0; side < sides; side++) {
      const offset = (ring * sides + side) * 2;
      samples[offset] = ring / segments;
      samples[offset + 1] = (side / sides) * Math.PI * 2;
    }
  }
  let offset = 0;
  for (let ring = 0; ring < segments; ring++) {
    for (let side = 0; side < sides; side++) {
      const a = ring * sides + side;
      const b = ring * sides + ((side + 1) % sides);
      const c = a + sides;
      const d = b + sides;
      indices.set([a, c, b, b, c, d], offset);
      offset += 6;
    }
  }
  return { samples, indices };
}

export const cableVertexShader = `
precision highp float;
attribute vec2 aSample;
uniform float uTime;
uniform float uPhase;
uniform float uAspect;
uniform vec2 uPointer;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vSample;
vec3 orient(vec3 p) {
  float a = .57; float b = .23 + uPointer.x*.65; float c = uPointer.y*.5;
  vec3 q = vec3(cos(a)*p.x-sin(a)*p.y, sin(a)*p.x+cos(a)*p.y, p.z);
  vec3 r = vec3(cos(b)*q.x+sin(b)*q.z, q.y, -sin(b)*q.x+cos(b)*q.z);
  return vec3(r.x, cos(c)*r.y-sin(c)*r.z, sin(c)*r.y+cos(c)*r.z);
}
void main() {
  float s = aSample.x;
  float wave = s*6.283185 + uPhase - uTime*.27;
  vec3 center = vec3((s-.5)*6., .82*sin(wave), .82*cos(wave));
  vec3 tangent = normalize(vec3(6., .82*6.283185*cos(wave), -.82*6.283185*sin(wave)));
  vec3 side = normalize(cross(tangent, vec3(0.,0.,1.)));
  vec3 up = normalize(cross(side, tangent));
  vec3 normal = side*cos(aSample.y)+up*sin(aSample.y);
  float radius = mix(.18, .11, smoothstep(.88,.9,s));
  vec3 position = orient(center + radius*normal);
  vNormal = orient(normal); vView = vec3(0.,0.,7.) - position;
  vSample = aSample;
  float depth = 7. - position.z;
  gl_Position = vec4(position.x*2.05/uAspect, position.y*2.05, 1.00669*depth-.20067, depth);
}`;

export const cableFragmentShader = `
precision highp float;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vSample;
vec3 palette(float t) {
  vec3 blue = vec3(.025,.31,.82);
  vec3 yellow = vec3(1.,.69,.012);
  vec3 green = vec3(.025,.57,.24);
  float p = mod(t,3.);
  if(p < 1.) return mix(blue,yellow,smoothstep(0.,1.,p));
  if(p < 2.) return mix(yellow,green,smoothstep(1.,2.,p));
  return mix(green,blue,smoothstep(2.,3.,p));
}
void main() {
  vec3 normal = normalize(vNormal); vec3 eye = normalize(vView);
  vec3 light = normalize(vec3(-.6,1.1,2.));
  vec3 color = uColor;
  float metal = smoothstep(.885,.9,vSample.x);
  float strands = .88+.12*sin(vSample.y*9.+vSample.x*95.);
  color = mix(color,vec3(.78,.39,.16)*strands,metal);
  float diffuse = max(dot(normal,light),0.);
  float shine = pow(max(dot(normal,normalize(light+eye)),0.),48.);
  float rim = pow(1.-max(dot(normal,eye),0.),3.);
  gl_FragColor = vec4(color*(.35+.8*diffuse)+vec3(.75,.86,1.)*shine*.5+color*rim*.22,1.);
}`;
