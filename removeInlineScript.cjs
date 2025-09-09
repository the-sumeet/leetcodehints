// Externalize SvelteKit inline bootstrap scripts to satisfy MV3 CSP
// Run after `vite build` so that files under `build/` no longer contain inline <script> blocks.

const fs = require('fs');
const path = require('path');

function hash36(value) {
	let h = 5381;
	for (let i = value.length - 1; i >= 0; i--) h = (h * 33) ^ value.charCodeAt(i);
	return (h >>> 0).toString(36);
}

function walk(dir, out = []) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const e of entries) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

function externalizeInFile(file) {
	if (!file.endsWith('.html')) return false;
	const html = fs.readFileSync(file, 'utf-8');
	// Match first inline script only (skip scripts that already have src=)
	const scriptRe = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i;
	const m = html.match(scriptRe);
	if (!m || !m[1]) return false;

	const inline = m[1]
		.replace('__sveltekit', 'const __sveltekit')
		.replace('document.currentScript.parentElement', 'document.body.firstElementChild');

	const filename = `script-${hash36(inline)}.js`;
	const fileDir = path.dirname(file);
	const jsPath = path.join(fileDir, filename);
	const newHtml = html.replace(scriptRe, `<script type="module" src="./${filename}"></script>`);

	fs.writeFileSync(file, newHtml);
	fs.writeFileSync(jsPath, inline);
	console.log(`[postbuild] externalized inline script in ${file} -> ${jsPath}`);
	return true;
}

function main() {
	const buildDir = path.resolve(__dirname, 'build');
	if (!fs.existsSync(buildDir)) {
		console.error(`[postbuild] build directory not found: ${buildDir}`);
		process.exit(0);
	}
	const files = walk(buildDir, []);
	let changed = 0;
	for (const f of files) changed += externalizeInFile(f) ? 1 : 0;
	console.log(`[postbuild] done, files updated: ${changed}`);
}

main();
