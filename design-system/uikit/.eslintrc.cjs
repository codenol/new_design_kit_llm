module.exports = {
    "env": {
        "es6": true,
        "browser": true,
        "jest": true
    },
    "extends": [
        "airbnb-base",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier"
    ],
    "settings": {
        "react": {
            "createClass": "createReactClass",
            "pragma": "React",
            "version": "detect"
        }
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": ["prettier", "react", "react-hooks"],
    "rules": {
        "prettier/prettier": [
            "warn",
            require("./.prettierrc.cjs")
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "linebreak-style": 0,

        "no-plusplus": "off",
        "no-use-before-define": "off",
        "no-confusing-arrow": "off",
        "class-methods-use-this": "off",
        "func-names": "off",
        "prefer-template": "off",
        "prefer-destructuring": "off",
        "vars-on-top": "off",
        "no-underscore-dangle": "off",
        "no-param-reassign": "off",
        "global-require": "off",

        "import/extensions": "off",
        "import/first": "off",
        "import/no-unresolved": "off",
        "import/no-extraneous-dependencies": "off",
        "import/prefer-default-export": "off",

        "no-void": "warn",
        "no-shadow": "off",
        "no-nested-ternary": "warn",
        "max-len": "off",
        "no-mixed-operators": "warn",

        "react/prop-types": "off",
        "react/display-name": "off"
    },
    "overrides": [
        {
            "files": ["**/*.ts", "**/*.tsx"],
            "env": {
                "browser": true,
                "es6": true
            },
            "extends": ["plugin:react/recommended", "plugin:@typescript-eslint/recommended", "prettier"],
            "parser": "@typescript-eslint/parser",
            "plugins": ["react", "@typescript-eslint"],
            "rules": {
                "linebreak-style": 0,

                "no-plusplus": "off",
                "no-use-before-define": "off",
                "class-methods-use-this": "off",
                "func-names": "off",
                "prefer-template": "off",
                "prefer-destructuring": "off",
                "vars-on-top": "off",
                "no-underscore-dangle": "off",
                "no-param-reassign": "off",
                "global-require": "off",

                "import/extensions": "off",
                "import/first": "off",
                "import/no-unresolved": "off",
                "import/no-extraneous-dependencies": "off",
                "import/prefer-default-export": "off",

                "@typescript-eslint/no-explicit-any": "off",

                "no-void": "warn",
                "no-shadow": "off",
                "no-nested-ternary": "off",
                "max-len": "off",
                "no-mixed-operators": "warn",
                "react/prop-types": "off"
            },
            "settings": {
                "react": {
                    "version": "detect"
                }
            }
        }
    ],
    "globals": {
        "google": true,
        "Expo": true,
        "Linear": true,
        "ga": true,
        "YT": true
    }
}
