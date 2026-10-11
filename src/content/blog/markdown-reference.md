---
title: "Markdown reference"
description: "A draft that shows how headings, maths, code and tables render on this site."
date: 2026-10-11
tags: [meta]
draft: true
---

This post is a draft, so it appears in `npm run dev` and is left out of the published site.
Delete it once there are real posts.

## Maths

Inline maths such as $\nabla_\theta \mathcal{L}(\theta)$ sits in the sentence. Display maths gets its own line:

$$
\mathrm{softmax}(z)_i = \frac{e^{z_i}}{\sum_{j} e^{z_j}}
$$

## Code

```rust
fn euclidean(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b).map(|(x, y)| (x - y).powi(2)).sum::<f32>().sqrt()
}
```

## Tables and quotes

| Format | Use it for |
| ------ | ---------- |
| Blog   | Essays and write-ups |
| Notes  | Papers |
| Maths  | Derivations |

> A blockquote, for citing a paper or a source.
