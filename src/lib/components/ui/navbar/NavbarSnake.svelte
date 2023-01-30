<script lang="ts">
	// export let pageIndex: number = 0;
	import { pageIndex } from '@shared/store';
</script>

<div class="h-[4px] w-full">
	<div
		class="absolute underline h-[4px] transition-transform w-20 sm:w-32 lg:w-40 bg-green-300 rounded-full duration-200"
		style="transform: translateX({$pageIndex * 226}px)"
	/>
</div>
