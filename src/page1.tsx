import { Page, Scene, Speaker, Popup, Translation, type Children } from "dsl";

const Arabic = ({ children }: { children: Children }) => (
  <Translation language="arabic" direction="rtl">
    {children}
  </Translation>
);

const CalebSpeakingScene = ({ children }: { children: Children }) => (
  <Scene
    authoringLanguage="us"
    languages={["us", "uk", "arabic"] as const}
    translate={async ({ language }, ...tokens => {
     return ... 
    }}
    tts={async ({ language }, ...tokens) => {
      switch (language) {
        case "us":
          return [{ text: "", startMs: -1, durationMs: -1 }];
        case "uk":
          return [{ text: "", startMs: -1, durationMs: -1 }];
        case "arabic":
          return [{ text: "", startMs: -1, durationMs: -1 }];
      }
    }}
  >
    {children}
  </Scene>
);

export default () => {
  return (
    <Page>
      <CalebSpeakingScene>
        <Speaker src="speaker1.png" />
        Hello, this is some <strong>text in the scene.</strong>
        <Popup src="popup1.png">This is a popup during the text.</Popup>
        <Arabic>
          مرحبًا، هذا بعض <strong>النص في المشهد.</strong>
        </Arabic>
      </CalebSpeakingScene>
    </Page>
  );
};
