ShaderExamples = 
{
	m_fallingstar:
	{
		group : 
		{ 
			texture 	: THREE.ImageUtils.loadTexture( 'images/yellow-star.png' ),
			maxAge 		: 10
		},
		emitter : 
		{
			type		    	: 'cube',
			position 	    	: new THREE.Vector3( 0, 200, 0 ),
			positionSpread  	: new THREE.Vector3( 500, 0, 0 ),
			acceleration		: new THREE.Vector3( 0,  0, 0 ),
			velocity        	: new THREE.Vector3( 0, -60, 0 ),
			velocitySpread  	: new THREE.Vector3( 20, 20, 0 ), 	
			size 				: 20,
			sizeSpread			: 2,			
			opacityStart		: 1,
			particlesPerSecond 	: 30,
			emitterDuration		: null,
			alive				: 1
		}
	}
}