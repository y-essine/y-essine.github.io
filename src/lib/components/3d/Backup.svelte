<script lang="ts">
	import { Three } from '@threlte/core';
	import { GLTF, Float, useGltf } from '@threlte/extras';
	import {
		PerspectiveCamera,
		Group,
		Mesh,
		Object3D,
		MeshStandardMaterial,
		DirectionalLight,
		AmbientLight,
		Scene,
		Color
	} from 'three';

	// import type { Object3D, Material } from 'three';

	// export let scale = 1;
	// export let rotation = 0;

	// const { gltf } = useGltf<{
	// 	nodes: {
	// 		node_shiba: THREE.Mesh
	// 	},
	// 	materials: {
	// 		material_shiba: THREE.MeshStandardMaterial
	//     }
	// }>('/shiba/scene.gltf');

	// $: shiba = $gltf?.nodes['node_shiba'];
</script>

<!-- <Three type={Scene} background={new Color(0xffffff)}>
	<Three
		type={PerspectiveCamera}
		position.x={0}
		position.y={0}
		position.z={15}
		fov={60}
		makeDefault
		let:ref={camera}
	/>
</Three> -->

<!-- <T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={25} />

<Float floatIntensity={5} speed={6}>
    <T.Group {scale} rotation.y={rotation}>
		<T.Mesh position={[0, 0.3, 1]}>
			<GLTF castShadow receiveShadow url={'/shiba/shiba.glb'} interactive />
			{#if shiba}
				<T.Object3DInstance object={shiba} />
			{/if}
		</T.Mesh>
	</T.Group>
</Float>

<T.DirectionalLight position={[3, 10, 10]} castShadow />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.5} /> -->
