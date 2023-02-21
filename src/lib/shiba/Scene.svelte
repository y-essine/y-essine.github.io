<script lang="ts">
	import { T, OrbitControls } from '@threlte/core';
	import { Float } from '@threlte/extras';
	import { degToRad } from 'three/src/math/MathUtils';

	export let scale = 2;
	export let rotation = 0;
</script>

<T.OrthographicCamera makeDefault position={[0, 0, 15]} zoom={60}>
	<OrbitControls />
</T.OrthographicCamera>

<T.Group {scale} rotation.y={rotation}>
	<T.Mesh position={[0, 0, 0]} rotation={[0, degToRad(180), 0]}>
		<slot />
	</T.Mesh>
</T.Group>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />
