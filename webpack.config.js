import path from "path";
import { fileURLToPath } from "url";
import glob from "webpack-glob-entries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "production",
  entry: glob("./tests/*.test.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
    extensions: [".js"],
    mainFiles: ["index"],
  },
  externals: /^k6(\/.*)?/,
  target: "web",
};
