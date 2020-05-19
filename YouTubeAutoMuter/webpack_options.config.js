const path = require("path");

module.exports = {
    entry: "./intermediate_build/options_main.js",
    output: {
        path: path.resolve(__dirname, "./extension"),
        filename: "options.js"
    }
};