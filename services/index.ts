import { IRepository } from "./types";
import { localRepository } from "./localRepository";
import { remoteRepository } from "./remoteRepository";

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "local";

/**
 * Service repository được sử dụng trong toàn bộ ứng dụng.
 * Tùy biến thông qua NEXT_PUBLIC_DATA_SOURCE = "local" | "remote".
 */
export const repository: IRepository =
  dataSource === "remote" ? remoteRepository : localRepository;

export * from "./types";
export * from "./localRepository";
export * from "./remoteRepository";
