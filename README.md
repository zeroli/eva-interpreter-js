This is the source code for Eva-lang interpreter implemention step by step.
It comes from the online course of 'Essential of Interpreter'.

* Examples for Eva lang
```
// Eva
(+ 10 20)
(* 10 30)
(var x 10)
(print x)  // 10

(begin
    (var x 20)
    (print x)  // 20
)
(print x)  // 10
(set foo 10)
(print x)  // 20
```

* Gramma of Eva lang
```
Exp ::= Number
        | String
        | [+ Exp, Exp]
        ...
        | [var name, Exp]
        | [set name, Exp]
        | name
        ...
        | [begin Exp...]
        ;
```
