<script lang="ts">
	import { marked } from 'marked';
	export let notes: string[] = [];
</script>

<div class="space-y-3">
	<p class="text-sm text-gray-500">
		These are the important things to remember about question which might be missed.
	</p>
	{#each notes as note, i}
		<div class="border rounded p-2">
			<div class="text-xs text-gray-500 mb-1">Note {i + 1}</div>
			<div class="preview">{@html marked(note ?? '')}</div>
		</div>
	{/each}
	{#if notes.length === 0}
		<p class="text-sm text-gray-500">No notes.</p>
	{/if}
</div>

<style>
	:global(.preview),
	:global(.preview *) {
		all: revert;
	}
	:global(.preview) {
		color: inherit;
		font: inherit;
	}
	:global(.preview img) {
		max-width: 100%;
		height: auto;
	}
	:global(.preview pre) {
		overflow: auto;
	}
</style>
