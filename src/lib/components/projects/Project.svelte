<script>
	import { Suspense } from '@svelte-drama/suspense';

	const _project = {
		name: 'exocial',
		description: 'A social network for developers'
	};

	// @ts-ignore
	const fake = (delay, value) => {
		return new Promise((resolve) => setTimeout(resolve, delay, value));
	};
</script>

<Suspense
	let:suspend
	on:error={(e) => console.error(e.detail)}
	on:load={() => console.log('fetched')}
>
	<p slot="error" let:error>Error: {error}</p>
	{#await suspend(fake(1000, _project)) then project}
		<div class="max-w-md pl-2">
			<h2 class="text-green-300 font-bold">
				{project.name}
			</h2>
			<p class="text-zinc-400 pl-2 text-sm">
				{project.description}
			</p>
		</div>
	{/await}
</Suspense>
