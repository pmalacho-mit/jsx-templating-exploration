import { member, norm } from "./utils";

export type Tagged<Kind, Details> = { kind: Kind } & Details;
export type OneOrMore<T> = T | T[];

export class SceneStorage {}

namespace LanguageGeneration {
  type Config<Languages extends string[]> = {
    /**
     * The language this generator supports.
     */
    language: Languages[number];
    writeToFile?: string;
    onData?: (chunk: Uint8Array) => void;
  };

  type TimestampedToken = {
    /**
     * The text of the token.
     */
    text: string;
    /**
     * The start time of the token utterance in milliseconds.
     */
    startMs: number;
    /**
     * The duration of the token utterance in milliseconds.
     */
    durationMs: number;
  };

  export type Output = TimestampedToken[];

  /** The tokens to generate */
  type Tokens = string[];

  export type Generate<Languages extends string[]> = (
    config: Config<Languages>,
    ...tokens: Tokens
  ) => Promise<Output>;
}

export type SceneEventPayload = {
  timestamps: LanguageGeneration.Output;
  storage: SceneStorage;
  previous?: SceneStorage;
};

export class HTML {
  constructor(
    public tag: keyof HTMLElementTagNameMap,
    public attrs: Record<string, any>,
    public children: AnyWithinSceneRenderable[]
  ) {}
}

type Renderable<K extends string> = {
  readonly key: K;
  render(...args: any[]): Promise<any>;
};

type WithinSceneRenderable<K extends string> = Renderable<K> & {
  render(payload: SceneEventPayload): Promise<any>;
};

type AnyWithinSceneRenderable = WithinSceneRenderable<string> | HTML | string;

class RenderableSpeaker implements WithinSceneRenderable<"speaker"> {
  readonly key = "speaker" as const;

  /**
   *
   * @param src Image source for the speaker
   */
  constructor(public src: string) {}

  async render(payload: SceneEventPayload) {}
}

class RenderablePopup implements WithinSceneRenderable<"popup"> {
  readonly key = "popup";

  constructor(
    public src: string,
    public children: AnyWithinSceneRenderable[]
  ) {}

  async render(payload: Pick<SceneEventPayload, "storage" | "timestamps">) {}
}

const withinSceneRenderables = [RenderableSpeaker, RenderablePopup, HTML];
type WithinSceneRenderables =
  | InstanceType<(typeof withinSceneRenderables)[number]>
  | string;

class RenderableTranslation implements Renderable<"translation"> {
  readonly key = "translation";

  constructor(
    public language: string,
    public children: (WithinSceneRenderables | string)[],
    public direction?: "ltr" | "rtl"
  ) {}

  async render() {}
}

const sceneBoundaries = [RenderableTranslation];
type SceneBoundaries = InstanceType<(typeof sceneBoundaries)[number]>;

class RenderableScene<Languages extends string[] = string[]>
  implements Renderable<"scene">
{
  readonly key = "scene";

  /**
   *
   * @param languages Languages supported in this scene
   * @param generate Function to generate language-specific assets
   * @param children Child renderables within the scene
   */
  constructor(
    public languages: Languages,
    public generate: LanguageGeneration.Generate<Languages>,
    public children: (WithinSceneRenderables | SceneBoundaries)[]
  ) {}

  async render(payload: Pick<SceneEventPayload, "storage" | "previous">) {}
}

class RenderablePage implements Renderable<"page"> {
  readonly key = "page";

  constructor(public children: RenderableScene[]) {}

  async render(
    onScene: (
      index: number,
      language: string,
      scene: Awaited<ReturnType<RenderableScene["render"]>>
    ) => void
  ) {
    const storedByLanguage = new Map<string, SceneStorage[]>();
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      for (const lang of child.languages) {
        const stored = storedByLanguage.get(lang);
        const previous = stored?.at(-1);
        const storage = new SceneStorage();
        const result = await child.render({ storage, previous });
        onScene(index, lang, result);
        if (stored) stored.push(storage);
        else storedByLanguage.set(lang, [storage]);
      }
    }
    return storedByLanguage;
  }
}

export type Child =
  | AnyWithinSceneRenderable
  | SceneBoundaries
  | RenderableScene
  | RenderablePage;

export type Children = OneOrMore<Child>;

export type Props<T extends Renderable<string>> = Omit<
  { [K in keyof T]: T[K] },
  keyof Renderable<string> | "children"
> &
  ("children" extends keyof T
    ? {
        children: Children;
      }
    : {});

export const Scene = <Languages extends string[]>({
  children,
  languages,
  generate,
}: Props<RenderableScene<Languages>>) => {
  const validated: RenderableScene["children"] = [];
  for (const child of member.annotate(
    norm(children),
    withinSceneRenderables,
    sceneBoundaries
  ))
    if (child.matched) validated.push(child.item);
    else if (typeof child.item === "string") validated.push(child.item);
    else throw new TypeError(`Invalid child for Scene: ${child.item}`);
  return new RenderableScene(languages, generate, validated);
};

export const Page = ({ children }: Props<RenderablePage>) => {
  const validated: RenderablePage["children"] = [];
  for (const child of member.annotate(norm(children), [RenderableScene]))
    if (child.matched) validated.push(child.item);
    else
      throw new TypeError(
        `Invalid child for Page: ${child.item}. Only ${RenderableScene.name} allowed.`
      );
  return new RenderablePage(validated);
};

export const Speaker = ({ src }: Props<RenderableSpeaker>) =>
  new RenderableSpeaker(src);

const childrenWithinScene = (children: Children) => {
  const validated: RenderableTranslation["children"] = [];
  for (const child of member.annotate(norm(children), withinSceneRenderables))
    if (child.matched) validated.push(child.item);
    else if (typeof child.item === "string") validated.push(child.item);
    else throw new TypeError(`Invalid child within Scene: ${child.item}`);
  return validated;
};

export const Popup = ({ children, src }: Props<RenderablePopup>) =>
  new RenderablePopup(src, childrenWithinScene(children));

export const Translation = ({
  language,
  children,
  direction,
}: Props<RenderableTranslation>) =>
  new RenderableTranslation(language, childrenWithinScene(children), direction);
