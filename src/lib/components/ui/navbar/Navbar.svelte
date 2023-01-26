<script lang="ts">
	import { page } from '$app/stores';
	import { pageIndex } from '$shared/store';
	import NavbarItem from './NavbarItem.svelte';
	import NavbarSnake from './NavbarSnake.svelte';

	let myIndex = 0;
	pageIndex.subscribe((value) => {
		console.log('changed');
		myIndex = value;
	});

	const links = [
		{
			name: '@y-essine',
			href: '/',
			icon: null
		},
		{
			name: 'about',
			href: '/about',
			icon: null
		},
		{
			name: 'contact',
			href: '/contact',
			icon: null
		}
	];
</script>

<div class="p-4 w-full flex justify-center">
	<div class="h-fit w-fit">
		<div class="flex items-center justify-center gap-5">
			{#each links as link, index}
				<NavbarItem {...link} {index} />
			{/each}
		</div>
		<div class="pt-2">
			<NavbarSnake />
		</div>
		<div class="pt-2">
			{myIndex}
		</div>
	</div>
</div>
