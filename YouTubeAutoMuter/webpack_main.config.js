const path = require("path");

module.exports = {
    entry: "./intermediate_build/automuter_main.js",
    output: {
        path: path.resolve(__dirname, "./extension"),
        filename: "automuter.js"
    }
};