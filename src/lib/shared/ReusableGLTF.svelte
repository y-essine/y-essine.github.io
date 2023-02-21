<script lang="ts">
	import { Object3DInstance } from '@threlte/core';
	import { GLTF, useGltfAnimations } from '@threlte/extras';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	import { setIsFetched } from '@shiba/store';
	import { AnimationMixer } from 'three';

	export let modelURL: string;

	function loader() {
		const loader = new GLTFLoader();
		return loader.loadAsync(modelURL);
	}

	let _gltf = null;

	const loadGLTF = loader().then((r) => {
		setIsFetched(true);
		_gltf = r;
		return r;
	});

	const { gltf } = useGltfAnimations<'ballas1_Armature'>(({ actions }) => {
		console.log(actions);
		actions['ballas1_Armature']?.play();
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
