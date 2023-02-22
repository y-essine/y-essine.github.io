<script lang="ts">
	import { onMount } from 'svelte';
	import Transition from './Transition.svelte';
	import Spinner from '@/components/ui/Spinner.svelte';

	export let component: any;
	export let fetched: boolean = false;
	let props: any;

	$: {
		const { component, fetched, ...rest } = $$props;
		props = rest;
	}

	let _component: any = null;
	let _loading: boolean = true;

	onMount(() => {
		component().then((m: any) => {
			_component = m.default;
			_loading = false;
		});
	});
</script>

{#if _loading || !fetched}
	<Spinner />
{/if}
<Transition transition={{ type: 'component', duration: 500 }}>
	<svelte:component this={_component} {...props} />
</Transition>
