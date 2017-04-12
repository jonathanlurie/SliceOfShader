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

    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;

    // row/col index of the slice within the grid of slices
    // (0.5 rounding is mandatory to deal with float as integers)
    float rowTexture = nbSlicePerCol - 1.0 - floor( (indexSliceToDisplay + 0.5) / nbSlicePerRow);
    float colTexture = modI( indexSliceToDisplay, nbSlicePerRow );

    vec2 posInTexture = vec2(
      sliceWidth * colTexture + vUv.x * sliceWidth ,
      sliceHeight * rowTexture + vUv.y * sliceHeight
    );

    gl_FragColor = texture2D(textures[0], posInTexture);
  }

`



shaders.fragmentWorld = `
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
    // worldCoord is [0, n], but the box is centered on 0 to make rotation work better
    // so worldCoordShifted is like worldCoord but shifted of half size in each direction
    vec3 worldCoordShifted = vec3( worldCoord.x + xspaceLength/2.0, worldCoord.y + yspaceLength/2.0, worldCoord.z + zspaceLength/2.0);

    // hide the outside
    if(worldCoordShifted.x < 0.0 || worldCoordShifted.x > xspaceLength ||
      worldCoordShifted.y < 0.0 || worldCoordShifted.y > yspaceLength ||
      worldCoordShifted.z < 0.0 || worldCoordShifted.z > zspaceLength)
    {
        discard;
        return;
    }

    // color at the edges of the volume
    float edgeSize = 0.5;
    if(worldCoordShifted.x < edgeSize || worldCoordShifted.x > (xspaceLength - edgeSize) ||
       worldCoordShifted.y < edgeSize || worldCoordShifted.y > (yspaceLength - edgeSize) ||
       worldCoordShifted.z < edgeSize || worldCoordShifted.z > (zspaceLength - edgeSize) )
    {
        gl_FragColor = vec4(0.7, 0.7, 1.0, 1.0);
        return;
    }

    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;

    float indexSliceToDisplay = floor(worldCoordShifted.z + 0.5);

    // row/col index of the slice within the grid of slices
    // (0.5 rounding is mandatory to deal with float as integers)
    float rowTexture = nbSlicePerCol - 1.0 - floor( (indexSliceToDisplay + 0.5) / nbSlicePerRow);
    float colTexture = modI( indexSliceToDisplay, nbSlicePerRow );

    vec2 posInTexture = vec2(
      sliceWidth * colTexture + worldCoordShifted.x/xspaceLength * sliceWidth ,
      sliceHeight * rowTexture + worldCoordShifted.y/yspaceLength * sliceHeight
    );

    gl_FragColor = texture2D(textures[0], posInTexture);
  }
`












shaders.fragmentMultiple = `
  precision highp float;

  // a max number we allow, can be upt to 16
  const int maxNbOfTextures = 16;

  // Number of texture used with this dataset
  // cannot be higher than maxNbOfTextures
  uniform int nbOfTextureUsed;

  // size of the mosaic
  uniform float nbSlicePerRow;
  uniform float nbSlicePerCol;
  // not necessary equal to nbSlicePerRow*nbSlicePerCol because last line
  // is not necessary full
  uniform float nbSliceTotal;

  // space length
  uniform float xspaceLength;
  uniform float yspaceLength;
  uniform float zspaceLength;

  // a texture will contain a certain number of slices
  uniform sampler2D textures[maxNbOfTextures];


  // Shared with the vertex shader
  varying  vec4 worldCoord;
  varying  vec2 vUv;

  /**
  * Returns accurate MOD when arguments are approximate integers.
  */
  float modI(float a,float b) {
      float m = a - floor( ( a + 0.05 ) / b) * b;
      return floor( m + 0.05 );
  }



  void main( void ) {

    // worldCoord is [0, n], but the box is centered on 0 to make rotation work better
    // so worldCoordShifted is like worldCoord but shifted of half size in each direction
    vec3 worldCoordShifted = vec3( worldCoord.x + xspaceLength/2.0, worldCoord.y + yspaceLength/2.0, worldCoord.z + zspaceLength/2.0);

    // hide the outside
    if(worldCoordShifted.x < 0.0 || worldCoordShifted.x > xspaceLength ||
      worldCoordShifted.y < 0.0 || worldCoordShifted.y > yspaceLength ||
      worldCoordShifted.z < 0.0 || worldCoordShifted.z > zspaceLength)
    {
        discard;
        return;
    }

    // color at the edges of the volume
    float edgeSize = 0.5;
    if(worldCoordShifted.x < edgeSize || worldCoordShifted.x > (xspaceLength - edgeSize) ||
       worldCoordShifted.y < edgeSize || worldCoordShifted.y > (yspaceLength - edgeSize) ||
       worldCoordShifted.z < edgeSize || worldCoordShifted.z > (zspaceLength - edgeSize) )
    {
        gl_FragColor = vec4(0.7, 0.7, 1.0, 1.0);
        return;
    }

    // step to jump from a slice to another on a unit-sized texture
    float sliceWidth = 1.0 / nbSlicePerRow;
    float sliceHeight = 1.0 / nbSlicePerCol;

    float indexSliceToDisplay = floor(worldCoordShifted.z + 0.05);
    int indexTextureInUse = int(floor(indexSliceToDisplay / (nbSlicePerRow*nbSlicePerCol) ));

    
    // orig mais a l'envers
    float rowTextureAbsolute = floor( (indexSliceToDisplay + 0.05) / nbSlicePerRow);
    float rowTexture = rowTextureAbsolute - (float(indexTextureInUse) * nbSlicePerCol) ;
    float colTexture = modI( indexSliceToDisplay, nbSlicePerRow );
    
    vec2 posInTexture = vec2(
      sliceWidth * colTexture + ( worldCoordShifted.x/xspaceLength * sliceWidth) ,
      sliceHeight * rowTexture + (1.0 / nbSlicePerCol  - worldCoordShifted.y/yspaceLength * sliceHeight)
    );

    vec4 color = texture2D(textures[0], posInTexture);


    if(indexTextureInUse == 0){
      color = texture2D(textures[0], posInTexture);
      
    }else if(indexTextureInUse == 1){
      color = texture2D(textures[1], posInTexture);
      
    }else if(indexTextureInUse == 2){
      color = texture2D(textures[2], posInTexture);
      
    }else if(indexTextureInUse == 3){
      color = texture2D(textures[3], posInTexture);
      
    }else if(indexTextureInUse == 4){
      color = texture2D(textures[4], posInTexture);
      
    }else if(indexTextureInUse == 5){
      color = texture2D(textures[5], posInTexture);
      
    }else if(indexTextureInUse == 6){
      color = texture2D(textures[6], posInTexture);
      
    }else if(indexTextureInUse == 7){
      color = texture2D(textures[7], posInTexture);
      
    }else if(indexTextureInUse == 8){
      color = texture2D(textures[8], posInTexture);
      
    }else if(indexTextureInUse == 9){
      color = texture2D(textures[9], posInTexture);
      
    }else if(indexTextureInUse == 10){
      color = texture2D(textures[10], posInTexture);
      
    }else if(indexTextureInUse == 11){
      color = texture2D(textures[11], posInTexture);
      
    }else if(indexTextureInUse == 12){
      color = texture2D(textures[12], posInTexture);
      
    }else if(indexTextureInUse == 13){
      color = texture2D(textures[13], posInTexture);
      
    }else if(indexTextureInUse == 14){
      color = texture2D(textures[14], posInTexture);
      
    }else if(indexTextureInUse == 15){
      color = texture2D(textures[15], posInTexture);
    }



    gl_FragColor = color;



    //gl_FragColor = texture2D(textureInUse, posInTexture);
  }
`
