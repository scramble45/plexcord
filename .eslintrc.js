module.exports = {
  "root": true,
  "extends": "eslint:recommended",
  "rules": {
    "semi"                    : ["error", "never"],
    "indent"                  : ["error", 2, {"SwitchCase":1, "VariableDeclarator": { "var": 2, "let": 2, "const": 3}}],
    "linebreak-style"         : ["error", "unix"],
    "eqeqeq"                  : ["error", "smart"],
    "quotes"                  : ["error", "single", {allowTemplateLiterals: true}],
    "curly"                   : ["error", "multi-line"],
    "brace-style"             : ["error", "1tbs", {"allowSingleLine": true}],
    "camelcase"               : "error",
    "no-trailing-spaces"      : "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-tabs"                 : "error",
    "no-console"              : "off",
    "no-unused-vars"          : ["warn", { "vars": "all", "args": "none" }],
    "keyword-spacing"         : "error"
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true,
    "mocha": true
  },
  "plugins": []
}