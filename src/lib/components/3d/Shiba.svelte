<script lang="ts">
	import { T, OrbitControls } from '@threlte/core';
	import { GLTF } from '@threlte/extras';
	import { degToRad } from 'three/src/math/MathUtils';

	export let scale = 0.5;
	export let rotation = 0;
</script>

<T.PerspectiveCamera makeDefault position={[10, 10, 10]} fov={10}>
	<OrbitControls maxPolarAngle={degToRad(80)} enableZoom={false} enablePan={false} />
</T.PerspectiveCamera>

<T.Group {scale} rotation.y={rotation}>
	<T.Mesh position={[0, 0.3, 0.5]}>
		<GLTF castShadow receiveShadow url={'/shiba/shiba.glb'} interactive />
	</T.Mesh>
</T.Group>

<!-- <T.Mesh receiveShadow rotation.x={degToRad(-90)}>
	<T.CircleGeometry args={[2, 60]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh> -->

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />
