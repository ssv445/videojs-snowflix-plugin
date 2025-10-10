#include <output_fragment>

vec4 color = gl_FragColor;

if (hueActive) {
  color = rgb(color);
}
color = desat(color);
if (isToon) {
  color = toon(color);
}

gl_FragColor = color;
