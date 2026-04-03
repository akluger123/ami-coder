import { useState, useEffect } from "react";
import { TokenInput } from "@/components/TokenInput";
import { RepoSelector } from "@/components/RepoSelector";
import { IDELayout } from "@/components/IDELayout";
import { fetchUser, fetchRepos, fetchTree } from "@/lib/github";
import type { Repo, TreeItem } from "@/lib/github";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type View = "token" | "repos" | "editor";

export default function Index() {
  const [view, setView] = useState<View>("token");
  const [token, setToken] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { toast } = useToast();

  // Check for saved token
  useEffect(() => {
    const saved = localStorage.getItem("gh_token");
    if (saved) {
      connectWithToken(saved);
    }
  }, []);

  async function connectWithToken(t: string) {
    setLoading(true);
    setLoadingMessage("Verifying token...");
    try {
      await fetchUser(t);
      setToken(t);
      localStorage.setItem("gh_token", t);
      setLoadingMessage("Fetching repositories...");
      const r = await fetchRepos(t);
      setRepos(r);
      setView("repos");
    } catch (err: any) {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
      localStorage.removeItem("gh_token");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function selectRepo(repo: Repo) {
    setLoading(true);
    setLoadingMessage("Loading file tree...");
    try {
      const [owner, name] = repo.full_name.split("/");
      const t = await fetchTree(token, owner, name, repo.default_branch);
      setSelectedRepo(repo);
      setTree(t);
      setView("editor");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  function disconnect() {
    setToken("");
    setRepos([]);
    setSelectedRepo(null);
    setTree([]);
    setView("token");
    localStorage.removeItem("gh_token");
  }

  if (loading && view !== "editor") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  switch (view) {
    case "token":
      return <TokenInput onConnect={connectWithToken} loading={loading} />;
    case "repos":
      return <RepoSelector repos={repos} onSelect={selectRepo} />;
    case "editor":
      return selectedRepo ? (
        <IDELayout token={token} repo={selectedRepo} tree={tree} onDisconnect={disconnect} />
      ) : null;
  }
}
