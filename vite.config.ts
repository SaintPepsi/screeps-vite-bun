// vite.config.js
import fs from "fs";
import https from "https";
import { defineConfig } from "vite";
import screepsConfig from "./screeps.json";

export default defineConfig({
    build: {
        minify: false,
        rollupOptions: {
            input: "src/main.ts",
            output: {
                preserveModules: false,
                strict: false,
                format: "cjs",
                entryFileNames: "[name].js",
                dir: "dist",
            },
            preserveEntrySignatures: "strict",
        },
        emptyOutDir: true,
    },
    plugins: [
        {
            name: "postbuild-commands", // the name of your custom plugin. Could be anything.
            closeBundle: async () => {
                const email = screepsConfig.email;
                const password = screepsConfig.password;

                const data = {
                    branch: screepsConfig.branch,
                    modules: {
                        main: fs.readFileSync("./dist/main.js", "utf-8"),
                    },
                };

                const req = https.request({
                    hostname: "screeps.com",
                    port: 443,
                    path: "/api/user/code",
                    method: "POST",
                    auth: email + ":" + password,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });

                req.write(JSON.stringify(data));
                req.end();
                req.on("response", (res) => {
                    if (res.statusCode === 200) {
                        console.log("Code uploaded to screeps successfully");
                    } else {
                        console.log("Failed to upload code to screeps. Status code: " + res.statusCode);
                    }
                });
            },
        },
    ],
});
