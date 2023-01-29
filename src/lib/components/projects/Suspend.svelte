<script lang="ts">
	import { createSuspense, SuspenseList } from '@svelte-drama/suspense';
	const suspend = createSuspense();
	import Spinner from '$components/ui/Spinner.svelte';
	export let component;

	const loadComponent = component().then((m: any) => m.default);
</script>

<SuspenseList collapse final let:loading on:error={(e) => console.error(e.detail)}>
	{#if loading}
		<Spinner />
	{/if}
	{#await suspend(loadComponent) then Component}
		<Component />
	{/await}
</SuspenseList>
