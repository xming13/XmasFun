function PresentEngine() {
	
	this.positionBase   = new THREE.Vector3();
	this.positionSpread = new THREE.Vector3();
	
	this.velocityBase       = new THREE.Vector3();
	this.velocitySpread     = new THREE.Vector3(); 
	
	this.accelerationBase   = new THREE.Vector3();
	this.accelerationSpread = new THREE.Vector3();	
	
	this.angleBase               = 0;
	this.angleSpread             = 0;
	this.angleVelocityBase       = 0;
	this.angleVelocitySpread     = 0;
	this.angleAccelerationBase   = 0;
	this.angleAccelerationSpread = 0;
	
	this.sizeBase   = 0.0;
	this.sizeSpread = 0.0;
	this.sizeTween  = new Tween();
			
	// store colors in HSL format in a THREE.Vector3 object
	// http://en.wikipedia.org/wiki/HSL_and_HSV
	this.colorBase   = new THREE.Vector3(0.0, 1.0, 0.5); 
	this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
	this.colorTween  = new Tween();
	
	this.opacityBase   = 1.0;
	this.opacitySpread = 0.0;
	this.opacityTween  = new Tween();

	this.blendStyle = THREE.NormalBlending; // false;

	this.presentArray = [];
	this.presentsPerSecond = 100;
	this.presentDeathAge = 3.0;
	
	////////////////////////
	// EMITTER PROPERTIES //
	////////////////////////
	
	this.emitterAge      = 0.0;
	this.emitterAlive    = true;
	this.emitterDeathAge = 9999; // time (seconds) at which to stop creating particles.
	
	// How many particles could be active at any time?
	this.presentCount = this.presentsPerSecond * Math.min( this.presentDeathAge, this.emitterDeathAge );

	//////////////
	// THREE.JS //	
	//////////////

	this.presentTexture = null;
	this.presentMaterial = new THREE.MeshBasicMaterial();
	this.presentGeometry = new THREE.PlaneGeometry();
	this.presentAnimator = null;
} 
PresentEngine.prototype.initialize = function() {
	// this.presentAnimator = new TextureAnimator(this.presentTexture, 4, 1, 4, 100);
	// link particle data with geometry/material data
	for (var i = 0; i < this.presentCount; i++)
	{
		// remove duplicate code somehow, here and in update function below.
		this.presentArray[i] = this.createPresent();
	}
}
PresentEngine.prototype.update = function(dt) {

	var recycleIndices = [];
	
	// update particle data
	for (var i = 0; i < this.presentCount; i++)
	{
		if ( this.presentArray[i].alive )
		{
			
			this.presentArray[i].update(dt);

			// convert from degrees to radians: 0.01745329251 = Math.PI/180
			rotateAroundObjectAxis(this.presentArray[i].presentMesh, this.presentArray[i].presentMesh.angle * 0.01745329251);
			// check if particle should expire
			// could also use: death by size<0 or alpha<0.
			if ( this.presentArray[i].age > this.presentDeathAge ) 
			{
				this.presentArray[i].alive = 0.0;
				this.presentArray[i].destroy();
				recycleIndices.push(i);
			}			
		}		
	}

	// check if particle emitter is still running
	if ( !this.emitterAlive ) return;

	// if no particles have died yet, then there are still particles to activate
	if ( this.emitterAge < this.particleDeathAge )
	{
		// determine indices of particles to activate
		var startIndex = Math.round( this.presentsPerSecond * (this.emitterAge +  0) );
		var   endIndex = Math.round( this.presentsPerSecond * (this.emitterAge + dt) );
		if  ( endIndex > this.presentCount ) 
			  endIndex = this.presentCount; 
			  
		for (var i = startIndex; i < endIndex; i++)
			this.presentArray[i].alive = 1.0;		
	}

	// if any particles have died while the emitter is still running, we imediately recycle them
	for (var j = 0; j < recycleIndices.length; j++)
	{
		var i = recycleIndices[j];
		this.presentArray[i] = this.createPresent();
		this.presentArray[i].alive = 1.0; // activate right away
	}

	// stop emitter?
	this.emitterAge += dt;
	if ( this.emitterAge > this.emitterDeathAge )  this.emitterAlive = false;
}
PresentEngine.prototype.setValues = function( parameters )
{
	if ( parameters === undefined ) return;
	
	for ( var key in parameters ) 
		this[ key ] = parameters[ key ];

	// calculate/set derived particle engine values
	this.presentArray = [];
	this.emitterAge      = 0.0;
	this.emitterAlive    = true;
	this.presentCount = this.presentsPerSecond * Math.min( this.presentDeathAge, this.emitterDeathAge );
	
	this.presentGeometry = new THREE.Geometry();
}
PresentEngine.prototype.createPresent = function() {
	var present = new Present();

	present.presentTexture  = this.presentTexture;
	present.presentMaterial = new THREE.MeshBasicMaterial( { map: present.presentTexture, side: THREE.FrontSide, transparent: true });
	present.presentGeometry = new THREE.PlaneGeometry(50, 50);
	present.presentMesh     = new THREE.Mesh(present.presentGeometry, present.presentMaterial);
	present.presentMesh.position      = this.randomVector3(new THREE.Vector3(0, SCREEN_HEIGHT / 2 * (VIEW_ANGLE + 5) / 90, 152), new THREE.Vector3(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 10, 0)); 
	present.presentMesh.velocity 	  = this.randomVector3(new THREE.Vector3(0, SCREEN_HEIGHT / -10, 0), new THREE.Vector3(SCREEN_WIDTH / 5, SCREEN_HEIGHT / -10, 0)); 
	present.presentMesh.acceleration  = new THREE.Vector3(0, SCREEN_HEIGHT / -5, 0);
	present.presentMesh.angle    	  = this.randomValue( this.angleBase,             this.angleSpread );
	present.presentMesh.angleVelocity = this.randomValue( this.angleVelocityBase,     this.angleVelocitySpread );
	present.presentMesh.angleAcceleration = this.randomValue( this.angleAccelerationBase, this.angleAccelerationSpread );
	present.presentMesh.present 	  = present;
	present.age 		  			  = 0;

	scene.add(present.presentMesh);
	presentMeshes.push(present.presentMesh);
	return present;
}
PresentEngine.prototype.randomValue = function(base, spread)
{
	return base + spread * (Math.random() - 0.5);
}
PresentEngine.prototype.randomVector3 = function(base, spread)
{
	var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
	return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
}
PresentEngine.prototype.destroy = function()
{
	var presentCount = this.presentArray.length;
	var presentMeshIndex = -1;
	for (var i = 0; i < presentCount; i++) {
		scene.remove(this.presentArray[i].presentMesh);
		presentMeshIndex = presentMeshes.indexOf(this.presentArray[i].presentMesh);
		if (presentMeshIndex > -1) {
			presentMeshes.splice(presentMeshIndex, 1);
		}
	}
    this.emitterAlive = false;
}

function Present() {
	this.opacity = 1.0;			
	this.age   = 0;
	this.alive = 1.0; // use float instead of boolean for shader purposes	

	this.presentTexture = new THREE.Texture();
	this.presentMaterial = new THREE.MeshBasicMaterial();
	this.presentGeometry = new THREE.PlaneGeometry();
	this.presentMesh = new THREE.Mesh();

	this.presentMesh.position = new THREE.Vector3();
	this.presentMesh.velocity = new THREE.Vector3();
	this.presentMesh.acceleration = new THREE.Vector3();

	this.presentMesh.angle             = 0;
	this.presentMesh.angleVelocity     = 0; // degrees per second
	this.presentMesh.angleAcceleration = 0; // degrees per second, per second
}
Present.prototype.update = function(dt) {
	this.presentMesh.position.add( this.presentMesh.velocity.clone().multiplyScalar(dt) );
	this.presentMesh.velocity.add( this.presentMesh.acceleration.clone().multiplyScalar(dt) );
	
	// convert from degrees to radians: 0.01745329251 = Math.PI/180
	this.presentMesh.angle         += this.presentMesh.angleVelocity     * 0.01745329251 * dt;
	this.presentMesh.angleVelocity += this.presentMesh.angleAcceleration * 0.01745329251 * dt;

	this.age += dt;
}

var rotObjectMatrix;
function rotateAroundObjectAxis(object, radians) {
	// rotate against z-axis
	var axis = new THREE.Vector3(0, 0, 1);
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}
Present.prototype.destroy = function() {
	scene.remove(this.presentMesh);
	var presentMeshIndex = presentMeshes.indexOf(this.presentMesh);
	if (presentMeshIndex > -1) {
		presentMeshes.splice(presentMeshIndex, 1);
	}
	this.age = 999999999;
}