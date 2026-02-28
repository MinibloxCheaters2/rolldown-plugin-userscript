import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

const BANNER = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;

const externals = [
	...Object.keys(pkg.dependencies),
	...Object.keys(pkg.peerDependencies),
];

export default defineConfig({
	plugins: [
		dts({
			outDir: "dist",
			// rollupTypes: true,
		}),
	],
	build: {
		outDir: "dist",
		lib: {
			entry: "src/index.ts",
			name: pkg.name,
			formats: ["es"],
			fileName: "index",
		},
		rollupOptions: {
			external: (id) =>
				id.startsWith("node:") ||
				externals.some((e) => id === e || id.startsWith(`${e}/`)),
			output: {
				banner: BANNER,
			},
		},
	},
});
