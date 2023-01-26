<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	type Transition = {
		type: 'page' | 'component';
		duration?: number;
		delay?: number;
	};

	export let transition: Transition = { type: 'page' };
</script>

{#if transition.type === 'page'}
	{#key $page.url}
		<div in:fly={{ x: -20, duration: transition.duration || 250, delay: transition.delay || 0 }}>
			<slot />
		</div>
	{/key}
{:else if transition.type === 'component'}
	<div
		class="fadeScale h-full w-full"
		style:animation-duration="{transition.duration || 250}ms"
		style:animation-delay="{transition.delay || 0}ms"
	>
		<slot />
	</div>
{/if}

<style>
	.fadeScale {
		animation-name: fadeScale;
	}

	@keyframes fadeScale {
		from {
			opacity: 0;
			transform: scale(0.7);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
