var shaders = {};


/* ***************** VERTEX SHADER ****************************************** */

shaders.vertex = `
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
  
  // a max number we allow, can be upt to 16
  const int maxNbOfTextures = 1;
  
  // Number of texture used with this dataset
  // cannot be higher than maxNbOfTextures
  uniform int nbOfTextureUsed;
  
  // size of the mosaic
  uniform int nbSlicePerRow;
  uniform int nbSlicePerCol;
  // not necessary equal to nbSlicePerRow*nbSlicePerCol because last line
  // is not necessary full
  uniform int nbSliceTotal;
  
  uniform int indexSliceToDisplay;
  
  // space length
  uniform int xspaceLength;
  uniform int yspaceLength;
  uniform int zspaceLength;
  
  // a texture will contain a certain number of slices
  uniform sampler2D textures[maxNbOfTextures];
  
  
  // Shared with the vertex shader
  varying  vec4 worldCoord;
  varying  vec2 vUv;

  
  
  void main( void ) {
    // the position within the shader
    vec2 shaderPos = vUv;
    
    // row/col index of the slice within the grid of slices
    int rowTexture = indexSliceToDisplay / nbSlicePerCol;
    int colTexture = int(mod( float(indexSliceToDisplay), float(nbSlicePerCol) ) );
    
    // step to jump from a slice to another on a unit-sized texture
    float stepWidth = 1.0 / float(nbSlicePerRow);
    float stepHeight = 1.0 / float(nbSlicePerCol);
    
    // step to jump from one pixel to another in a unit-sized texture
    float microStepSliceWidth = float(stepWidth) / float(xspaceLength);
    float microStepSliceHeight = float(stepHeight) / float(yspaceLength);
    
    vec2 posInTexture = vec2(
      stepWidth * float(colTexture) + vUv.x * stepWidth ,
      stepHeight * float(rowTexture) + vUv.y * stepHeight
    );
    
    //gl_FragColor = vec4(1.0, 0.2 , 0.8, 1.0);
    //gl_FragColor = texture2D(textures[0], posInTexture);
    //gl_FragColor = vec4(float(indexSliceToDisplay) / 256., 0.0 , 0.0, 1.0);
  }

`
