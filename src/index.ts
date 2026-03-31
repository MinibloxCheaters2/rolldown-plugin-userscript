import { readFile } from "node:fs/promises";
import type { Plugin } from "rolldown";
import { withFilter } from "rolldown/filter";
import {
	type Context,
	defineParallelPluginImplementation,
	type ParallelPluginImplementation,
} from "rolldown/parallelPlugin";
import { collectGrants, getMetadata } from "./util.js";

type MaybePromise<T> = T | Promise<T>;

const suffix = "?userscript-metadata";

type TransformFn = (metadata: string) => string;

export interface UserscriptMetaOptions {
	transform?: TransformFn;
	ignoreAutomaticGrants?: string[];
}

type TransformOrUserOpt = TransformFn | UserscriptMetaOptions;

function userscriptPlugin(transformOrUserOptions?: TransformOrUserOpt): Plugin {
	const userOptions =
		typeof transformOrUserOptions === "function"
			? { transform: transformOrUserOptions }
			: transformOrUserOptions;

	const metadataMap = new Map();
	const grantMap = new Map();
	return withFilter(
		{
			name: "userscript-metadata",
			async resolveId(source, importer, options) {
				if (source.endsWith(suffix)) {
					let { id } = await this.resolve(source, importer, options);
					if (id.endsWith(suffix)) id = id.slice(0, -suffix.length);
					metadataMap.set(importer, id);
					return source;
				}
			},
			load(id) {
				if (id.endsWith(suffix)) {
					return "";
				}
			},
			transform: {
				filter: {
					id: /\.js$/,
				},
				handler(code, id) {
					const ast = this.parse(code);
					const grantSetPerFile = collectGrants(ast);
					grantMap.set(id, grantSetPerFile);
				},
			},
			banner: {
				order: "pre",
				async handler(chunk) {
					const metadataFile =
						chunk.isEntry &&
						[chunk.facadeModuleId, ...Object.keys(chunk.modules)]
							.map((id) => metadataMap.get(id))
							.find(Boolean);

					if (!metadataFile) return;
					let metadata = await readFile(metadataFile, "utf8");
					const grantSet = new Set<string>();
					for (const id of this.getModuleIds()) {
						const grantSetPerFile = grantMap.get(id);
						if (grantSetPerFile) {
							for (const item of grantSetPerFile) {
								if (
									userOptions.ignoreAutomaticGrants?.includes(
										item,
									)
								) {
									continue;
								}

								grantSet.add(item);
							}
						}
					}
					metadata = getMetadata(metadata, grantSet);
					if (userOptions.transform)
						metadata = userOptions.transform(metadata);
					return metadata;
				},
			},
		},
		{
			load: { id: /\?userscript-metadata$/ },
			resolveId: { id: /\?userscript-metadata$/ },
		},
	);
}

const parallel: (
	opts: TransformOrUserOpt,
	ctx: Context,
) => MaybePromise<ParallelPluginImplementation> =
	defineParallelPluginImplementation((a: TransformOrUserOpt, _ctx) => {
		return userscriptPlugin(a);
	});

export default parallel;
