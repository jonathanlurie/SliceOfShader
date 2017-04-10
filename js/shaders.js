var shaders = {};


/* ***************** VERTEX SHADER ****************************************** */

shaders.vertex = `
  precision highp float;
  varying  vec2 vUv;
  varying  vec4 worldCoord;

  void main()
  {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    
    worldCoord = modelMatrix * vec4( position, 1.0 );
  }

`


/* ***************** FRAGMENT SHADER **************************************** */

shaders.fragment = `
  precision highp float;
  
  // a max number we allow, can be upt to 16
  const int maxNbOfTextures = 1;
  
  // Number of texture used with this dataset
  // cannot be higher than maxNbOfTextures
  uniform float nbOfTextureUsed;
  
  // size of the mosaic
  uniform float nbSlicePerRow;
  uniform float nbSlicePerCol;
  // not necessary equal to nbSlicePerRow*nbSlicePerCol because last line
  // is not necessary full
  uniform float nbSliceTotal;
  
  uniform float indexSliceToDisplay;
  
  // space length
  uniform float xspaceLength;
  uniform float yspaceLength;
  uniform float zspaceLength;
  
  // a texture will contain a certain number of slices
  uniform sampler2D textures[maxNbOfTextures];
  
  
  // Shared with the vertex shader
  varying  vec4 worldCoord;
  varying  vec2 vUv;

  float myMod(float x, float y){
    return x - (y * float(int(x/y)));
  }
  
  /**
  * Returns accurate MOD when arguments are approximate integers.
  */
  float modI(float a,float b) {
      float m = a - floor( ( a + 0.5 ) / b) * b;
      return floor( m + 0.5 );
  }

  
    
  void main( void ) {
    
    
    // the position within the shader
    vec2 shaderPos = vUv;
    
    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;
    
    // row/col index of the slice within the grid of slices
    // (0.5 rounding is mandatory to deal with float as integers)
    float rowTexture = nbSlicePerCol - 1.0 - floor( (indexSliceToDisplay + 0.5) / nbSlicePerRow);
    float colTexture = modI( indexSliceToDisplay, nbSlicePerRow );
    
    float indexSliceToDisplay2 = indexSliceToDisplay + 0.0;
    float nbSlicePerRow2 = nbSlicePerRow;
    
    vec2 posInTexture = vec2(
      sliceWidth * colTexture + vUv.x * sliceWidth ,
      sliceHeight * rowTexture + vUv.y * sliceHeight
    );
    
    gl_FragColor = texture2D(textures[0], posInTexture);
  }

`
