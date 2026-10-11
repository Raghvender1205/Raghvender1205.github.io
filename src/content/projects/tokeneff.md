---
title: "TokenEff"
summary: "A Python library that converts JSON into token-efficient formats such as TOON before it reaches an LLM, and reports the tokens saved."
group: llm-tooling
repo: Raghvender1205/TokenEff
stack: [Python]
featured: true
order: 2
---

TokenEff is a Python library that rewrites structured data into a more compact text format before it is put into an LLM prompt, and reports how many tokens that saved. The format it targets is [TOON](https://github.com/johannschopplich/toon).

## The problem

JSON is a costly way to show data to a language model. Every object in an array repeats its keys, and quotes, braces and commas are tokens too. In a prompt that carries search results or database rows, a large share of the tokens are punctuation and repeated field names, and they count against both the bill and the context window.

## Design

The library separates reading data from writing it:

- a **converter** parses an input format into plain Python dictionaries and lists (JSON so far),
- a **formatter** turns that normalised data into the output text and returns it with its token count.

Adding an input format means adding a converter, and adding an output format means adding a formatter; neither needs to know about the other.

### The TOON formatter

The formatter picks an encoding for each value by its shape.

**Arrays of uniform objects become tables.** When every item has the same keys and only primitive values, the keys are written once in a header, with the row count, and each item becomes one delimited row:

```text
users[5]{id,name,role,active}
  1,Alice,admin,true
  2,Bob,editor,true
  3,Chandra,viewer,false
  4,Dmitri,editor,true
  5,Esi,viewer,true
```

**Arrays of primitives go on one line** with their length, as in `tags[2]: gift,express`. The length gives the model something to check the row count against.

**Nested objects use indentation** instead of braces, and anything irregular falls back to a dashed list.

**Key folding** is optional: a chain of single-key objects such as `{"a": {"b": {"c": 1}}}` collapses to `a.b.c: 1`.

Strings are quoted only when they need to be, which is when they contain the delimiter, a colon, a newline or a quote, or have leading or trailing spaces. The delimiter and indent width are configurable.

### Translation

The formatter can also translate its output into another language through `googletrans`, in chunks. The idea is that for some tokenizers the same content takes fewer tokens in Chinese than in English. This part is an experiment: I have not measured whether the saving survives the effect on answer quality.

### Counting tokens

Token counts come from `tiktoken`, using the encoding for `gpt-4o-mini` and falling back to `cl100k_base` for unknown models. A `token_savings` helper gives the percentage saved between two strings.

## What I measured

Two small samples, counted with the `gpt-4o-mini` tokenizer:

| Sample | TOON | Compact JSON | Indented JSON |
| ------ | ---: | -----------: | ------------: |
| Five user records with four fields each | 57 | 89 | 168 |
| One nested order with a short list | 37 | 34 | 64 |

The table form is where the saving is: 36% fewer tokens than compact JSON and 66% fewer than indented JSON for the user records. For the nested order TOON is no better than compact JSON, and slightly worse, because indentation costs about what the braces did.

So the library earns its keep on rows, such as retrieval results, query output and product lists, and does little for deeply nested configuration-style data. These are two small samples, and a proper benchmark over real payloads is still to do.

## What is not done yet

- JSON is the only input format; CSV, YAML and DataFrames are planned.
- Conversion is one way. There is no TOON-to-JSON parser yet.
- The output has not been checked against the reference TOON implementation for conformance.
- The command-line entry point is not wired up to the asynchronous formatter yet.

## What I learned

- The gain depends on the shape of the data much more than on the format's cleverness. Measuring two shapes side by side showed that quickly.
- Token counts are tokenizer-specific, so a saving has to be stated for a named model.
- Whether a model reads the compact form as reliably as JSON is a separate question from how many tokens it takes, and it is the one that decides if the format is usable in production.
