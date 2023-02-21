<script>
	import { spring } from 'svelte/motion';
	import { Canvas } from '@threlte/core';
	import Controls from '../components/3d/Controls.svelte';
	import Scene from './Scene.svelte';
	import ReusableGLTF from '@shared/ReusableGLTF.svelte';

	let rot = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.25 });
	let scl = spring({ val: 2 }, { stiffness: 0.1, damping: 0.25 });
</script>

<div class="flex justify-center items-center rounded-lg h-full max-w-xl relative">
	<!-- <div class="absolute right-0 opacity-90 bg-white/5 p-5 rounded-lg select-none">
		<div class="text-3xl font-extrabold mb-3">Controls</div>
		<Controls bind:rotation={rot} bind:scale={scl} />
	</div> -->
	<div class="absolute h-full">
		<Canvas>
			<Scene>
				<ReusableGLTF modelURL={'/ballas/ballas.gltf'} />
			</Scene>
		</Canvas>
	</div>
</div>
