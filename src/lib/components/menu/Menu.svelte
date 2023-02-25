<script lang="ts">
	import { links } from '@/shared/store';
	import MenuItem from './MenuItem.svelte';
</script>

<div class="w-fit p-16 flex flex-col items-center">
	{#each $links as item}
		<MenuItem {item} />
	{/each}
</div>
