<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { marked } from 'marked';

	export let hints: Array<{ content: string }> = [];
</script>

<Accordion.Root type="single">
	{#each hints as h, i}
		<Accordion.Item value={`hint-${i}`}>
			<Accordion.Trigger>Hint {i + 1}</Accordion.Trigger>
			<Accordion.Content>
				<div class="preview">{@html marked(h.content ?? '')}</div>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>

<style>
	/* Neutralize Tailwind inside this subtree */
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
