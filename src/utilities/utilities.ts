import * as path from "path";
import configuration from "../configuration";

export function getSwiftExecutable(exe = "swift"): string {
    return path.join(configuration.path, getExecutableName(exe));
}

export function getExecutableName(exe: string): string {
    return process.platform === "win32" ? `${exe}.exe` : exe;
}