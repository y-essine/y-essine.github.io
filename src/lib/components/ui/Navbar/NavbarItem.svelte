<script lang="ts">
	import { page } from '$app/stores';

	export let name: string;
	export let href: string;
	export let icon: any = false;
</script>

<a
	{href}
	class="hover:bg-zinc-800/70 duration-200 px-3 py-2 rounded-md"
	class:active={$page.url.pathname == href}
>
	{#if icon}
		{icon}
	{/if}
	<span class="text-2xl font-extrabold">{name}</span>
</a>

<style>
	.active {
		@apply bg-zinc-800;
	}
</style>
