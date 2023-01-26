<script lang="ts">
	import { T } from '@threlte/core';
	import { GLTF, Float } from '@threlte/extras';
	import { degToRad } from 'three/src/math/MathUtils';

	export let scale = 1;
	export let rotation = 0;
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={25} />

<Float floatIntensity={5} speed={6}
	><T.Group {scale} rotation.y={rotation}>
		<T.Mesh position={[0, 0.3, 1]}>
			<GLTF castShadow receiveShadow url={'/shiba/shiba.glb'} interactive />
		</T.Mesh>
	</T.Group>
</Float>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />
