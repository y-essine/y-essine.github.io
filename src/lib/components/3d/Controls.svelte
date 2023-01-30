<script>
	import { spring } from 'svelte/motion';
	let scaleVal = 1;
	export let scale = spring({ val: 0.6 });

	let rotationVal = 0;
	export let rotation = spring({ x: 0, y: 0 });
</script>

<div>
	<label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
		>Size: {Math.trunc((scaleVal / 1.5) * 100)}
	</label>
	<input
		id="steps-range"
		type="range"
		min="1"
		max="2.6"
		bind:value={scaleVal}
		on:input={() => {
			scale.set({ val: scaleVal });
		}}
		step="0.01"
		class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
	/>
	<label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
		>Rotation: {Math.trunc((rotationVal / 6.28) * 360)}
	</label>
	<input
		id="steps-range"
		type="range"
		min="0"
		max="6.28"
		bind:value={rotationVal}
		on:input={() => {
			rotation.set({ x: 0, y: rotationVal });
		}}
		step="0.01"
		class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
	/>
</div>
