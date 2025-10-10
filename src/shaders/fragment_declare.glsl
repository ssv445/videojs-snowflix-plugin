#include <clipping_planes_pars_fragment>

//*** Rgb Filter

// The MIT License
// Copyright © 2014 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions: The above copyright
// notice and this permission notice shall be included in all copies or
// substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
// WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
// TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
// THE USE OR OTHER DEALINGS IN THE SOFTWARE.

uniform bool hueActive;
uniform float hue;

const float eps = 1e-9;

vec3 hsl2rgb(in vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
                   0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 rgb2hsl(vec3 col) {
  float minc = min(col.r, min(col.g, col.b));
  float maxc = max(col.r, max(col.g, col.b));
  vec3 mask = step(col.grr, col.rgb) * step(col.bbg, col.rgb);
  vec3 h = mask *
           (vec3(0.0, 2.0, 4.0) + (col.gbr - col.brg) / (maxc - minc + eps)) /
           6.0;
  return vec3(hue,                                                  // H
              (maxc - minc) / (1.0 - abs(minc + maxc - 1.0) + eps), // S
              (minc + maxc) * 0.5);                                 // L
}

vec4 rgb(vec4 originalColor) {
  vec3 hsl = rgb2hsl(originalColor.xyz);
  return vec4(hsl2rgb(hsl), 1.0);
}
//*************

//*** Desat filter.
uniform float saturation;

vec4 desat(vec4 originalColor) {
  vec3 gray = vec3(dot(originalColor.xyz, vec3(0.2126, 0.7152, 0.0722)));
  return vec4(mix(originalColor.xyz, gray, 1.0 - saturation), 1.0);
}
//*************

/* Toon-ish shader, Created by ghost in 2017-08-15
 * https://www.shadertoy.com/view/4djBDt
 * Inspired by non-photorealistic techniques,
 * I originally wanted to implement a
 * watercolor/brush-stroke shader...
 * Read some things decided I maybe didn't have time
 * for that -- I found a cool kuwahara filter implementation
 * https://www.shadertoy.com/view/MsXSz4
 *  who is the source of this...not me :)
 * https://en.wikipedia.org/wiki/Kuwahara_filter
 */

uniform bool isToon;
uniform bool isColors;
uniform bool isInverse;
uniform bool isContours;

uniform vec3 iResolution;
uniform vec3 contourColor;

//*** Using uniform toonSmear causes branching for-loop which crashes on iOS.
#define toonSmear 6

uniform float toonExposure;
uniform float toonContrast;
uniform float toonBrightness;
uniform float contourStrength;

// /* Sobel operator:
//  * Convolve image with horizontal and vertical filters
//  * that calculates the image gradient (directional change in the
//  * intensity or color) thereby detecting an edge
//  */
vec3 toonEdges(vec2 s) {
  //*** Sobel convolution kernels in the horizational and vertical directions
  mat3 h = mat3(-1, -2, -1, // first col h[0]
                0, 0, 0,    // second col h[1]
                1, 2, 1);

  mat3 v = mat3(1, 0, -1, // first col v[0]
                2, 0, -2, // second col v[1]
                1, 0, -1);

  //*** populate neighboring pixel box with neighboring pixels
  mat3 b;
  for (float i = 0.0; i < 3.0; i++) {
    for (float j = 0.0; j < 3.0; j++) {
      vec4 t = texture2D(map, vUv + vec2((i - 1.0) * s.x, (1.0 - j) * s.y));
      b[int(i)][int(j)] = length(t);
    }
  }

  //*** Convolve
  //*** Process can be described as "sliding the kernel over the input image"
  //*** For each position of the kernel, we multiply the overlapping values
  //*** of the kernel and image together, and add up the results.
  //*** This sum of products will be the value of the output image at the
  //*** point in the input image where the kernel is centered
  float gx = dot(h[0], b[0]) + dot(h[1], b[1]) + dot(h[2], b[2]);
  float gy = dot(v[0], b[0]) + dot(v[1], b[1]) + dot(v[2], b[2]);

  // magnitude of gradient
  float magnitude = clamp(sqrt((gx * gx) + (gy * gy)), 0.0, 1.0);
  if (magnitude >= contourStrength)
    return contourColor;
  else
    return vec3(1, 1, 1);
}

vec3 exposure(vec3 color) { return (1.0 + toonExposure) * color; }
vec3 contrast(vec3 color) { return 0.5 + (1.0 + toonContrast) * (color - 0.5); }
vec3 brightness(vec3 color) { return color + toonBrightness; }

vec3 inverseColor(vec3 color) {
  return vec3(1.0 - color.x, 1.0 - color.y, 1.0 - color.z);
}

void findMin(float s, inout float min_sigma, vec4 m, out vec4 c) {
  if (s < min_sigma) {
    min_sigma = s;
    c = vec4(m);
  }
}

vec4 toonKuwahara(vec2 s) {
  // size of region
  float size = pow(float(toonSmear + 1), 2.0);

  vec4 c;
  vec4 m0, m1, m2, m3, s0, s1, s2, s3;
  m0 = m1 = m2 = m3 = s0 = s1 = s2 = s3 = vec4(0.0);

  //*** 4 square regions with RADIUS pixels
  for (int j = -toonSmear; j <= 0; ++j) {
    for (int i = -toonSmear; i <= 0; ++i) {
      c = texture2D(map, vUv + vec2(i, j) * s);
      m0 += c;     // mean
      s0 += c * c; // std dev
    }
  }

  for (int j = -toonSmear; j <= 0; ++j) {
    for (int i = 0; i <= toonSmear; ++i) {
      c = texture2D(map, vUv + vec2(i, j) * s);
      m1 += c;
      s1 += c * c;
    }
  }

  for (int j = 0; j <= toonSmear; ++j) {
    for (int i = 0; i <= toonSmear; ++i) {
      c = texture2D(map, vUv + vec2(i, j) * s);
      m2 += c;
      s2 += c * c;
    }
  }

  for (int j = 0; j <= toonSmear; ++j) {
    for (int i = -toonSmear; i <= 0; ++i) {
      c = texture2D(map, vUv + vec2(i, j) * s);
      m3 += c;
      s3 += c * c;
    }
  }

  //*** calculate mean & std dev
  m0 /= size;
  s0 = abs(s0 / size - m0 * m0);
  m1 /= size;
  s1 = abs(s1 / size - m1 * m1);
  m2 /= size;
  s2 = abs(s2 / size - m2 * m2);
  m3 /= size;
  s3 = abs(s3 / size - m3 * m3);

  //*** find min std dev, set output to corresponding mean
  float min_sigma = 1e+2;

  float ms = s0.r + s0.g + s0.b;
  findMin(ms, min_sigma, m0, c);

  ms = s1.r + s1.g + s1.b;
  findMin(ms, min_sigma, m1, c);

  ms = s2.r + s2.g + s2.b;
  findMin(ms, min_sigma, m2, c);

  ms = s3.r + s3.g + s3.b;
  findMin(ms, min_sigma, m3, c);

  return c;
}

vec4 toon(vec4 originalColor) {
  float x = (iResolution.x > 600.0) ? 1.6 : 0.8;
  float y = (iResolution.y > 400.0) ? 1.6 : 0.8;
  vec2 s = vec2(x / iResolution.x, y / iResolution.y);

  vec3 toonColors = vec3(1.0);
  if (isColors) {
    toonColors = toonKuwahara(s).xyz;
    toonColors = brightness(toonColors);
    toonColors = contrast(toonColors);
    toonColors = exposure(toonColors);
  }

  if (isContours) {
    vec3 contours = toonEdges(s);
    if (isInverse) {
      toonColors = inverseColor(contours);
    } else {
      toonColors *= contours;
    }
  }

  return vec4(toonColors, 1.0);
}