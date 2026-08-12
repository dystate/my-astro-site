export interface CategoryOption {
  value: string;
  label: string;
}

const DEFAULT_OPTIONS: CategoryOption[] = [
  { value: "essay", label: "随笔" },
  { value: "summary", label: "年度总结" },
  { value: "family", label: "一家人" },
  { value: "us", label: "我们" },
];

const FOLDER_VALUE_MAP: Record<string, string> = {
  "随笔": "essay",
  "年度总结": "summary",
  "一家人": "family",
  "家庭": "family",
  "我们": "us",
};

export function categoryForFolder(folderPath: string): string {
  const name = folderPath.split("/").filter(Boolean).pop() || "随笔";
  return FOLDER_VALUE_MAP[name] || name;
}

export function categoryOptionsFromFolders(folders: string[], current?: string): CategoryOption[] {
  const options = new Map(DEFAULT_OPTIONS.map((option) => [option.value, option]));
  for (const folder of folders) {
    const label = folder.split("/").filter(Boolean).pop();
    if (!label) continue;
    const value = categoryForFolder(folder);
    if (!options.has(value)) options.set(value, { value, label });
  }
  if (current && !options.has(current)) options.set(current, { value: current, label: current });
  return Array.from(options.values());
}
