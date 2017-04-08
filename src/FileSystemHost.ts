﻿export interface FileSystemHost {
    readFile(filePath: string, encoding?: string): string;
    writeFile(filePath: string, fileText: string, callback?: (err: NodeJS.ErrnoException) => void): void;
    writeFileSync(filePath: string, fileText: string): void;
    fileExists(filePath: string): boolean;
    directoryExists(dirPath: string): boolean;
    getCurrentDirectory(): string;
    glob(patterns: string[]): string[];
}