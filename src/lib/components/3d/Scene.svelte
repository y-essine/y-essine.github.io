<script lang="ts">
	import { Object3DInstance, T } from '@threlte/core';
	import { GLTF, Float, useGltf } from '@threlte/extras';
	import type { Object3D, Material } from 'three';

	export let scale = 1;
	export let rotation = 0;

	const { gltf } = useGltf<{
		nodes: {
			node_shiba: Object3D;
		};
		materials: {
			material_shiba: Material;
		};
	}>('/shiba/shiba.gltf');

	$: shiba = $gltf?.nodes['node_shiba'];
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={25} />

<Float floatIntensity={5} speed={6}
	><T.Group {scale} rotation.y={rotation}>
		<T.Mesh position={[0, 0.3, 1]}>
			<!-- <GLTF castShadow receiveShadow url={'/shiba/shiba.glb'} interactive /> -->
			{#if shiba}
				<Object3DInstance object={shiba} />
			{:else}
				<T.SphereGeometry args={[1, 32, 32]} />
				<T.MeshStandardMaterial color="red" />
			{/if}
		</T.Mesh>
	</T.Group>
</Float>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} />
