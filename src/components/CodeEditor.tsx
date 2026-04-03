import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { getLanguage } from "@/lib/github";

function getLangExtension(filename: string) {
  const lang = getLanguage(filename);
  switch (lang) {
    case "javascript": return [javascript({ jsx: true, typescript: filename.endsWith(".ts") || filename.endsWith(".tsx") })];
    case "python": return [python()];
    case "html": return [html()];
    case "css": return [css()];
    case "json": return [json()];
    case "markdown": return [markdown()];
    default: return [];
  }
}

interface CodeEditorProps {
  filename: string;
  content: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ filename, content, onChange }: CodeEditorProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      <CodeMirror
        value={content}
        height="100%"
        theme={oneDark}
        extensions={getLangExtension(filename)}
        onChange={onChange}
        className="h-full text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}
