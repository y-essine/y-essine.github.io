<script lang="ts">
	import { T } from '@threlte/core';
	import { Float } from '@threlte/extras';
	import ReusableGLTF from '@shared/ReusableGLTF.svelte';

	export let scale = 2;
	export let rotation = 0;
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={25} />

<Float floatIntensity={5} speed={6}>
	<T.Group {scale} rotation.y={rotation}>
		<T.Mesh position={[0, 0.3, 1]}>
			<ReusableGLTF modelURL={'/shiba/shiba.gltf'} />
		</T.Mesh>
	</T.Group>
</Float>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />
