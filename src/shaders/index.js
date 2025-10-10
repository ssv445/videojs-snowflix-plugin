import fragmentDeclare from './fragment_declare.glsl';
import fragmentMain from './fragment_main.glsl';

export const injectShaderCode = (shader, uniforms) => {
  shader.uniforms = { ...shader.uniforms, ...uniforms };

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <clipping_planes_pars_fragment>', fragmentDeclare)
    .replace('#include <output_fragment>', fragmentMain);
};
