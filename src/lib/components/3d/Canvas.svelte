<script>
	import { Canvas } from '@threlte/core';
	import Box from './Box.svelte';
	import Shiba from './Shiba.svelte';
</script>

<div class="flex justify-center items-center rounded-lg p-3 h-96 max-w-xl relative">
	<Canvas>
		<Shiba scale={1} rotation={{ y: 0 }} />
	</Canvas>
</div>
