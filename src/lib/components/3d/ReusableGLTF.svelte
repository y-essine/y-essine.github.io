<script lang="ts">
	import { Object3DInstance } from '@threlte/core';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

	export let modelURL: string;

	function loader() {
		const loader = new GLTFLoader();
		return loader.loadAsync(modelURL);
	}

	const loadGLTF = loader();
</script>

{#await loadGLTF then gltf}
	{#if gltf}
		<Object3DInstance object={gltf.scene} />
	{/if}
{/await}
