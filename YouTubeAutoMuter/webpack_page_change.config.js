const path = require("path");

module.exports = {
    entry: "./intermediate_build/page_change_main.js",
    output: {
        path: path.resolve(__dirname, "./extension"),
        filename: "page_change.js"
    }
};