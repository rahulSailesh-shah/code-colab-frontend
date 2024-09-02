import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import * as monaco from "monaco-editor";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";

const SERVER_URL = "https://livecode-colaborator.onrender.com";
const WEBSOCKET_URL = "wss://livecode-colaborator.onrender.com";

function CodeEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    let ws: WebSocket | null = null;

    const setupContest = async () => {
      if (!id || !userId) {
        navigate("/");
        return;
      }
      try {
        const response = await fetch(`${SERVER_URL}/contest/${id}`);
        if (!response.ok) {
          navigate("/");
          return;
        }

        ws = new WebSocket(
          `${WEBSOCKET_URL}/?contestId=${id}&userId=${userId}`
        );

        ws.onopen = () => {
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case "executing_code":
              setLoading(true);
              setResult("");
              break;
            case "code_result":
              setLoading(false);
              setResult(message.payload.output);
              break;
            default:
              break;
          }
        };

        ws.onerror = () => {
          navigate("/");
        };
      } catch (error) {
        console.log(error);
        navigate("/");
      }
    };

    setupContest();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [id, navigate, userId]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    const doc = new Y.Doc();

    const provider = new WebrtcProvider(id!, doc, {
      signaling: [`${WEBSOCKET_URL}/?contestId=${id}&userId=${userId}`],
    });
    const type = doc.getText("monaco");

    if (!editorRef.current) {
      return;
    }

    new MonacoBinding(
      type,
      editorRef.current.getModel() as monaco.editor.ITextModel,
      new Set([editorRef.current]),
      provider.awareness
    );
  };

  const handleSave = () => {
    if (
      editorRef.current &&
      socket &&
      socket.readyState === WebSocket.OPEN &&
      id
    ) {
      const code = editorRef.current.getValue();
      socket.send(
        JSON.stringify({
          type: "code_submit",
          payload: {
            code,
            codeId: "63",
            contestId: id,
          },
        })
      );
    }
  };

  return (
    <div className="w-screen h-screen p-4 bg-zinc-800">
      <div className="flex space-x-4 h-[90%]">
        <div className="w-3/5 h-full p-4 rounded-2xl bg-[#1f1f1f] border-2 border-slate-500">
          <Editor
            theme="vs-dark"
            language="javascript"
            onMount={handleEditorDidMount}
            options={
              {
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              } as monaco.editor.IEditorOptions
            }
          />
        </div>
        <div className="w-2/5 h-full p-4 rounded-2xl bg-[#1f1f1f] border-2 border-slate-500">
          <p className="italic text-gray-500">// Outut</p> <br />
          {loading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <pre className="text-gray-200">{result}</pre>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-start">
        <Button
          variant="secondary"
          className="mx-4"
          onClick={handleSave}
          disabled={loading}
        >
          Run Code
        </Button>
        <CopyToClipboard
          text={id!}
          onCopy={() => alert("Link copied to clipboard")}
        >
          <Button variant="outline" className="mx-4">
            Copy Room ID
          </Button>
        </CopyToClipboard>
      </div>
    </div>
  );
}

export default CodeEditor;
