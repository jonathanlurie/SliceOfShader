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
  precision lowp float;
  
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
    return x - (y * floor(x/y));
  }
  
  void main( void ) {
    
    
    // the position within the shader
    vec2 shaderPos = vUv;
    
    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;
    
    // row/col index of the slice within the grid of slices
    float rowTexture = nbSlicePerCol - 1.0 - floor(indexSliceToDisplay / nbSlicePerRow);
    float colTexture = myMod( indexSliceToDisplay, nbSlicePerRow );
    
    float indexSliceToDisplay2 = indexSliceToDisplay;
    float nbSlicePerRow2 = nbSlicePerRow;
    gl_FragColor = vec4(myMod(indexSliceToDisplay2 ,nbSlicePerRow2) / 23.0, 0.0 , 0.0, 1.0);
    return;
    
    if( (indexSliceToDisplay == 23.0) && (nbSlicePerRow == 23.0) &&  ( myMod( floor(indexSliceToDisplay), floor(nbSlicePerRow) ) == 23.0 ) ){
    //if( mod( 23.0, nbSlicePerRow ) == 23.0 ){
      gl_FragColor = vec4(1.0, 0.0 , 0.0, 1.0);
      return;
    }
    
    /*
    if( colTexture == nbSlicePerRow ){
      colTexture = 0.0;
      rowTexture = rowTexture + 1.0;
    }
    */
  
    vec2 posInTexture = vec2(
      sliceWidth * colTexture + vUv.x * sliceWidth ,
      sliceHeight * rowTexture + vUv.y * sliceHeight
    );
    
  
    

    gl_FragColor = texture2D(textures[0], posInTexture);
    //gl_FragColor = texture2D(textures[0], vUv);
    //gl_FragColor = vec4(float(indexSliceToDisplay) / 256., 0.0 , 0.0, 1.0);
  }

`
