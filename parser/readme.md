To isntall syntax-cli to parse S-expression BNF grammar
```
npm install -g syntax-cli
```

Example to run syntax-cli for our grammar BNF:
```
syntax-cli --grammar parser/eva-grammar.bnf --mode LALR1 --parse '(begin (var x 10) (var y 20) (+ x y))' --tokenize
```

if no `--tokenize` option, then output will have no tokens output:
output will be:
```
Parsed value:

[
  "begin",
  [
    "var",
    "x",
    10
  ],
  [
    "var",
    "y",
    20
  ],
  [
    "+",
    "x",
    "y"
  ]
]

```

To generate eva-lang parser JS file:
```
syntax-cli --grammar parser/eva-grammar.bnf --mode LALR1 --output parser/evaParser.js
```
