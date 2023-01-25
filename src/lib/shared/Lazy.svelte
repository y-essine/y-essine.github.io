<script lang="ts">
	import Spinner from '$components/ui/loading/Spinner.svelte';
	import { onMount } from 'svelte';
	import Transition from './Transitions.svelte';

	export let component: any;

	let loadedComponent: any = null;
	let timeout: NodeJS.Timeout;
	let showFallback = true;

	let props: any;

	$: {
		const { component, delayMs, ...rest } = $$props;
		props = rest;
	}

	onMount(() => {
		component().then((module: any) => {
			loadedComponent = module.default;
			showFallback = false;
		});
		return () => clearTimeout(timeout);
	});
</script>

{#key loadedComponent}
	<Transition transition={{ type: 'component' }}
		>{#if showFallback}
			<Spinner />
		{:else if loadedComponent}
			<svelte:component this={loadedComponent} {...props} />
		{/if}
	</Transition>
{/key}
