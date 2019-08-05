import { S3Repository } from "@yingyeothon/repository-s3";
import * as path from "path";
import envars from "./env";

const repo = new S3Repository({
  bucketName: envars.db.bucketName
});

const docTypes = ["plain", "map", "list"];
type DocumentType = "plain" | "map" | "list";

export const parseActorFromUrlPath = (urlPath: string) => {
  const docType = (path.extname(urlPath) || ".plain").toLowerCase().substr(1);
  const docPath = urlPath.replace(new RegExp(path.extname(urlPath) + "$"), "");
  if (!docTypes.includes(docType)) {
    throw new Error(`Invalid docType[${docType}] from urlPath[${urlPath}]`);
  }
  return { docType: docType as DocumentType, docPath };
};

interface IDocumentTypedDatabase {
  set: (docPath: string, value: any) => Promise<any>;
  get: (docPath: string) => Promise<any>;
}

export const details: { [T in DocumentType]: IDocumentTypedDatabase } = {
  plain: {
    get: (docPath: string) => repo.get(docPath),
    set: (docPath: string, value: any) => repo.set(docPath, value)
  },
  list: {
    get: (docPath: string) => repo.getListDocument(docPath).read(),
    set: (docPath: string, value: any) =>
      repo.getListDocument(docPath).insert(value)
  },
  map: {
    get: (docPath: string) => repo.getMapDocument(docPath).read(),
    set: (docPath: string, { key, value }: any) =>
      repo.getMapDocument(docPath).insertOrUpdate(key, value)
  }
};
