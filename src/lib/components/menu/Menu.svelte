<script lang="ts">
	import { page } from '$app/stores';
	import { links } from '@shared/store';
	import MenuItem from './MenuItem.svelte';

	$: path = $page.url.pathname;
</script>

<div class="w-fit p-16">
	{#each $links as item, index}
		<MenuItem {item} {index} isActive={item.href === path} />
	{/each}
</div>
