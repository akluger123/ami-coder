import { useState, useCallback } from "react";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch, Save, LogOut, PanelLeftClose, PanelLeft,
  MessageSquare, PanelRightClose, X, Loader2
} from "lucide-react";
import { fetchFileContent, updateFile } from "@/lib/github";
import type { TreeItem, Repo } from "@/lib/github";
import { useToast } from "@/hooks/use-toast";

interface IDELayoutProps {
  token: string;
  repo: Repo;
  tree: TreeItem[];
  onDisconnect: () => void;
  onSignOut?: () => void;
}

export function IDELayout({ token, repo, tree, onDisconnect }: IDELayoutProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { toast } = useToast();

  const [owner, repoName] = repo.full_name.split("/");

  const selectFile = useCallback(async (path: string) => {
    setLoadingFile(true);
    try {
      const content = await fetchFileContent(token, owner, repoName, path, repo.default_branch);
      setSelectedPath(path);
      setFileContent(content);
      setOriginalContent(content);
      if (!openTabs.includes(path)) {
        setOpenTabs((prev) => [...prev, path]);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingFile(false);
    }
  }, [token, owner, repoName, repo.default_branch, openTabs, toast]);

  const closeTab = (path: string) => {
    const newTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(newTabs);
    if (selectedPath === path) {
      if (newTabs.length > 0) {
        selectFile(newTabs[newTabs.length - 1]);
      } else {
        setSelectedPath(null);
        setFileContent("");
        setOriginalContent("");
      }
    }
  };

  const saveFile = async () => {
    if (!selectedPath) return;
    setSaving(true);
    try {
      await updateFile(token, owner, repoName, selectedPath, fileContent, `Update ${selectedPath} via AI Editor`, repo.default_branch);
      setOriginalContent(fileContent);
      toast({ title: "Saved", description: `${selectedPath} committed successfully` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = fileContent !== originalContent;

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="flex h-10 items-center justify-between border-b border-border bg-card px-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-1.5 text-sm">
            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{repo.full_name}</span>
            <span className="text-muted-foreground">({repo.default_branch})</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={saveFile} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Commit
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatOpen(!chatOpen)}>
            {chatOpen ? <PanelRightClose className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDisconnect}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="flex w-60 flex-col border-r border-border bg-card shrink-0">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explorer
            </div>
            <FileTree items={tree} selectedPath={selectedPath} onSelect={selectFile} />
          </div>
        )}

        {/* Editor area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex border-b border-border bg-card overflow-x-auto">
              {openTabs.map((tab) => {
                const name = tab.split("/").pop() || tab;
                const isActive = tab === selectedPath;
                return (
                  <div
                    key={tab}
                    className={`group flex items-center gap-1.5 border-r border-border px-3 py-1.5 text-xs cursor-pointer shrink-0 ${
                      isActive ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => selectFile(tab)}
                  >
                    <span className="font-mono">{name}</span>
                    {hasChanges && isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    <button
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                      onClick={(e) => { e.stopPropagation(); closeTab(tab); }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {loadingFile ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedPath ? (
              <CodeEditor
                filename={selectedPath}
                content={fileContent}
                onChange={setFileContent}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">Select a file to start editing</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="w-80 border-l border-border shrink-0">
            <ChatPanel
              filename={selectedPath}
              fileContent={fileContent}
              onApplyEdit={(newContent) => setFileContent(newContent)}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex h-6 items-center justify-between border-t border-border bg-card px-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{selectedPath ? selectedPath : "No file selected"}</span>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && <span className="text-primary">● Modified</span>}
          <span>AI Code Editor</span>
        </div>
      </div>
    </div>
  );
}
