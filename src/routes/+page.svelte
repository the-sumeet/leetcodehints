<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Hints from './Hints.svelte';
	import QuestionNotes from './QuestionNotes.svelte';
	import { onMount } from 'svelte';

	let activeUrl: string = $state('');
	let hints: Array<{ content: string }> = $state([]);
	let questionNotes: string[] = $state([]);
	let loadError: string = $state('');

	async function getProblemHints() {
		loadError = '';
		hints = [];
		questionNotes = [];
		const problemName = activeUrl.split('/problems/')[1]?.split('/')[0];
		if (!problemName) return;
		try {
			// @ts-ignore chrome global in extensions
			const url = chrome.runtime.getURL(`hints/${problemName}.json`);
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to load hints (${res.status})`);
			const data = await res.json();
			if (Array.isArray(data?.hints)) {
				hints = data.hints;
			} else {
				loadError = 'Hints file has unexpected format.';
			}
			if (Array.isArray(data?.questionNotes)) {
				questionNotes = data.questionNotes.filter((x: any) => typeof x === 'string');
			}
		} catch (e: any) {
			console.error('Error loading hints:', e);
			loadError = 'Hints not found';
		}
	}

	function queryTabsChrome(): Promise<any[]> {
		return new Promise((resolve) => {
			try {
				// @ts-ignore chrome global in extensions
				chrome.tabs.query({ active: true, currentWindow: true }, resolve);
			} catch (e) {
				resolve([]);
			}
		});
	}

	async function getActiveTabUrl() {
		const g: any = globalThis as any;
		try {
			if (g.browser?.tabs?.query) {
				const tabs = await g.browser.tabs.query({ active: true, currentWindow: true });
				activeUrl = tabs?.[0]?.url ?? '';
				return;
			}
			const tabs = await queryTabsChrome();
			activeUrl = tabs?.[0]?.url ?? '';
		} catch (e) {
			console.error('Failed to get active tab URL', e);
		}
	}

	onMount(async () => {
		await getActiveTabUrl();
		getProblemHints();
	});
</script>

<div class="p-1 h-min max-h-80">
	{#if activeUrl.includes('https://leetcode.com') && !loadError}
		<Tabs.Root value="hints" class="w-[400px]">
			<Tabs.List>
				<Tabs.Trigger value="hints">Hits</Tabs.Trigger>
				<Tabs.Trigger value="notes">Question Notes</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="hints">
				<Hints {hints} />
			</Tabs.Content>
			<Tabs.Content value="notes">
				<QuestionNotes notes={questionNotes} />
			</Tabs.Content>
		</Tabs.Root>
	{:else if loadError}
		<p class="text-sm text-destructive">{loadError}</p>
	{:else}
		<p class="text-sm text-gray-500">Please navigate to a LeetCode problem page to see the hints.</p>
	{/if}
</div>
