<script>
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
	import { muted, toggleMute } from './store';
</script>

<div class="flex items-center px-3 w-10">
	<button class="text-t-pri/20 hover:text-t-pri/50" on:click={toggleMute}>
		{#if !$muted}
			<Fa icon={faVolumeUp} />
		{:else}
			<Fa icon={faVolumeMute} />
		{/if}
	</button>
</div>
