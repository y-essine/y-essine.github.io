<script>
	import { fly } from 'svelte/transition';

	export let refresh = '';
</script>

{#key refresh}
	<div in:fly={{ x: -20, duration: 600, delay: 400 }} out:fly={{ x: 20, duration: 400 }}>
		<slot />
	</div>
{/key}
