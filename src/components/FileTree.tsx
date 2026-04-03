import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import type { TreeItem } from "@/lib/github";

interface FileNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: FileNode[];
}

function buildTree(items: TreeItem[]): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  // Sort: folders first, then alphabetical
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const node: FileNode = { name, path: item.path, type: item.type, children: [] };
    map.set(item.path, node);

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = map.get(parentPath);
      if (parent) parent.children.push(node);
    }
  }

  return root;
}

function FileNodeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const isFolder = node.type === "tree";
  const isSelected = node.path === selectedPath;

  const icon = isFolder ? (
    open ? <FolderOpen className="h-4 w-4 text-primary shrink-0" /> : <Folder className="h-4 w-4 text-primary shrink-0" />
  ) : (
    <File className="h-4 w-4 text-muted-foreground shrink-0" />
  );

  return (
    <div>
      <button
        className={`flex w-full items-center gap-1 py-1 px-2 text-left text-sm hover:bg-secondary/50 transition-colors ${
          isSelected ? "bg-secondary text-foreground" : "text-foreground/80"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) setOpen(!open);
          else onSelect(node.path);
        }}
      >
        {isFolder && (
          open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        {icon}
        <span className="truncate font-mono text-xs">{node.name}</span>
      </button>
      {isFolder && open && node.children.map((child) => (
        <FileNodeItem key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </div>
  );
}

interface FileTreeProps {
  items: TreeItem[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ items, selectedPath, onSelect }: FileTreeProps) {
  const tree = useMemo(() => buildTree(items), [items]);

  return (
    <ScrollArea className="h-full">
      <div className="py-1">
        {tree.map((node) => (
          <FileNodeItem key={node.path} node={node} depth={0} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    </ScrollArea>
  );
}
