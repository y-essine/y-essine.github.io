<script lang="ts">
	import { page } from '$app/stores';
	import { pageIndex } from '$shared/store';

	$: path = $page.url.pathname;

	const isActive = () => {
		if (path === href) {
			pageIndex.set(index);
			return true;
		}
		return false;
	};

	export let name: string;
	export let href: string;
	export let icon: any = false;
	export let index: number = 0;
</script>

<a
	{href}
	class="hover:bg-zinc-800/70 duration-200 px-2 rounded-md w-40 flex justify-center"
	class:active={isActive}
>
	{#if icon}
		{icon}
	{/if}
	<span class="text-sm sm:text-xl lg:text-2xl font-semibold">{name}</span>
</a>

<style>
	.active {
		@apply bg-zinc-800;
	}
</style>
