<script>
	import { spring } from 'svelte/motion';
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import ReusableGLTF from '@shared/ReusableGLTF.svelte';

	let rot = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.25 });
	let scl = spring({ val: 2 }, { stiffness: 0.1, damping: 0.25 });
</script>

<div class="flex justify-center items-center rounded-lg h-full max-w-xl relative">
	<div class="absolute h-full">
		<Canvas>
			<Scene>
				<ReusableGLTF modelURL={'/ballas/ballas.gltf'} />
			</Scene>
		</Canvas>
	</div>
</div>
