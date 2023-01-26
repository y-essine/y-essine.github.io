<script lang="ts">
	export let currentIndex: number = 0;
</script>

<div class="h-[4px] w-full">
	<div
		class="underline h-[4px] w-40 bg-green-300 rounded-full duration-200"
		style="transform: translateX({11.25 * currentIndex}rem)"
	/>
</div>
