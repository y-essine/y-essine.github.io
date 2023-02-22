<script lang="ts">
	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	import { setIsFetched } from '@shiba/store';
	import { LoopRepeat } from 'three';

	export let modelURL: string;

	function loader() {
		const loader = new GLTFLoader();
		return loader.loadAsync(modelURL);
	}

	const loadGLTF = loader().then((r) => {
		setIsFetched(true);
		return r;
	});

	const { gltf } = useGltfAnimations(({ actions }) => {
		Object.keys(actions).forEach((key) => {
			actions[key]?.play();
		});
	});
</script>

<!-- {#await loadGLTF then gltf}
	{#if gltf}
		<Object3DInstance object={gltf.scene} />
	{/if}
{/await} -->

<GLTF
	bind:gltf={$gltf}
	url="/ballas/ballas.gltf"
	useDraco="https://www.gstatic.com/draco/v1/decoders/"
/>
