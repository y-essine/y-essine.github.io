<script lang="ts">
	import { page } from '$app/stores';
	import { links, pageIndex } from '@shared/store';
	import { onDestroy } from 'svelte';
	import NavbarItem from './NavbarItem.svelte';
	import NavbarSnake from './NavbarSnake.svelte';

	$: path = $page.url.pathname;
</script>

<div class="p-4 w-full flex justify-center">
	<div class="h-fit w-fit">
		<div class="flex items-center justify-center gap-5">
			{#each $links as link, index}
				<NavbarItem {...link} {index} isActive={link.href === path} />
			{/each}
		</div>
		<div class="pt-2">
			<NavbarSnake />
		</div>
	</div>
</div>
