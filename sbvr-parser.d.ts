export type LFModel = Array<LFModel | string>;

export type OMetaError = Error & {
	OMeta: {
		idx?: number;
		line?: number;
		col?: number;
	};
};

export type MatchFailed<R> = (grammar: unknown, err: OMetaError) => R;

type AttributeAttachment = 'Term' | 'Name' | 'FactType' | 'Rule';

export interface SBVRParserGrammar {
	_sideEffectingRules: string[];
	initialize(): void;
	reset(): void;
	AddCustomAttribute(
		attributeName: string,
		attachedTo?: AttributeAttachment,
	): void;
	AddBuiltInVocab(vocabulary: string): void;
	matchAll(seModel: string, rule: 'Process'): LFModel;
	matchAll<R = LFModel>(
		seModel: string,
		rule: 'Process',
		args: unknown[] | undefined,
		matchFailed: MatchFailed<R>,
	): LFModel | R;
	matchAll(
		input: string,
		rule: string,
		args?: unknown[],
		matchFailed?: MatchFailed<unknown>,
	): unknown;
	createInstance(): this & SBVRParserInstance;
	_extend<T extends object>(extension: T & ThisType<this & T>): this & T;
}

export interface SBVRParserInstance {
	/** Reuse memoizations from the previous input, for incremental (editor) parsing */
	enableReusingMemoizations(sideEffectingRules?: string[]): void;
}

export declare const SBVRParser: SBVRParserGrammar;
