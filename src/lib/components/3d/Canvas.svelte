<script>
	import { spring } from 'svelte/motion';
	import { Canvas } from '@threlte/core';
	import Controls from './Controls.svelte';
	import Shiba from './Shiba.svelte';

	let rot = spring({ x: 0, y: 0.2 }, { stiffness: 0.1, damping: 0.25 });
	let scl = spring({ val: 1 }, { stiffness: 0.1, damping: 0.25 });
</script>

<div class="flex justify-center items-center rounded-lg p-3 h-96 max-w-xl relative">
	<div class="absolute right-0 opacity-90 bg-white/5 p-5 rounded-lg select-none">
		<div class="text-3xl font-extrabold mb-3">Controls</div>
		<!-- <div class="font-extrabold">Rot: {$rot.y}</div>
		<div class="font-extrabold">Scale: {$scl.val}</div> -->
		<Controls bind:rotation={rot} bind:scale={scl} />
	</div>
	<Canvas>
		<Shiba scale={$scl.val} rotation={$rot.y} />
	</Canvas>
</div>
