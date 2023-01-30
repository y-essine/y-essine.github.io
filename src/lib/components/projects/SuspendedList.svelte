<script>
	import { createSuspense, SuspenseList } from '@svelte-drama/suspense';
	const suspend = createSuspense();
	import Spinner from '@components/ui/Spinner.svelte';
	export let component;

	const Project = import('@components/projects/Project.svelte').then((m) => m.default);
</script>

<SuspenseList collapse final let:loading on:error={(e) => console.error(e.detail)}>
	{#if loading}
		<Spinner />
	{/if}
	{#await suspend(Project) then ProjectsList}
		<ProjectsList />
	{/await}
</SuspenseList>
