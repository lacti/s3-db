import pathDelimiter from "./pathDelimiter";

export default function validatePath(path: string) {
  if (path.length === 0) {
    return true;
  }
  let lastDelimIndex = path.indexOf(pathDelimiter);
  if (lastDelimIndex === 0) {
    return false;
  }
  while (true) {
    const nextDelimIndex = path.indexOf(
      pathDelimiter,
      lastDelimIndex + pathDelimiter.length
    );
    if (nextDelimIndex < 0) {
      break;
    }
    if (lastDelimIndex + pathDelimiter.length === nextDelimIndex) {
      return false;
    }
    lastDelimIndex = nextDelimIndex;
  }
  return lastDelimIndex + pathDelimiter.length < path.length;
}
