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

(if (> x 1)
    (set y 10)
    (set y 20)
)

(switch ((> x 1) 100)
            ((= x 1) 200)
            (else 0)
)

(for (var x 10)
        (> x 0)
        (-- x)
        (print x)
)
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

```
(switch (<cond1> <block1>)
            (<cond2> <block2>)
            ...
            (else <alternate>)
)
```
implementions: transformation
```
(if <cond1>
    <block1>
    ...
    (if <condN>
        <blockN>
        <alternate>
    )
)
```

* for loops
```
(for <init>
      <condition>
      <modifier>
      <exp>
)

(begin
    <init>
    (while <condition>
            (begin
                <exp>
                <modifier>
            )
    )
)
```
