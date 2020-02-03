import pathDelimiter from "./pathDelimiter";

interface DecomposedPath {
  parentPath: string;
  currentKey: string;
}

export default function decomposePath(path: string): DecomposedPath {
  const lastDelimiterPos = path.lastIndexOf(pathDelimiter);
  if (lastDelimiterPos < 0) {
    return { parentPath: "", currentKey: path };
  } else {
    return {
      parentPath: path.substring(0, lastDelimiterPos),
      currentKey: path.substring(lastDelimiterPos + pathDelimiter.length)
    };
  }
}
