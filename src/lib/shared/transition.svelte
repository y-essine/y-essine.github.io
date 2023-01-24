<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';

	type Transition = {
		type: 'page' | 'fade';
		duration?: number;
		delay?: number;
	};

	export let transition: Transition = { type: 'page' };
</script>

{#if transition.type === 'page'}
	{#key $page.url.pathname}
		<div in:fly={{ x: -20, duration: 250 }}>
			<slot />
		</div>
	{/key}
{/if}
