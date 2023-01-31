<script lang="ts">
	import { page } from '$app/stores';
	import { links, pageIndex } from '@shared/store';
	import { onDestroy } from 'svelte';
	import NavbarItem from './NavbarItem.svelte';

	$: path = $page.url.pathname;
</script>

<div class="p-4 w-full flex justify-center">
	<div class="h-fit w-fit">
		<div class="flex items-center justify-center gap-2 sm:gap-5">
			{#each $links as item, index}
				<NavbarItem {item} {index} isActive={item.href === path} />
			{/each}
		</div>
	</div>
</div>
