---
title: "VectorDB"
summary: "A vector database written from scratch in Rust: a server with RocksDB storage and HNSW indexing, plus a Python SDK."
group: ml-systems
repo: Raghvender1205/VectorDB
stack: [Rust, RocksDB, HNSW, Python]
featured: true
order: 1
---

VectorDB is a vector database I wrote in Rust to learn what sits underneath the retrieval step of a RAG system. It is a single server: you create a collection, add documents with their embeddings, and search for the nearest ones over HTTP. A separate Python SDK wraps the API.

## The problem

Most RAG code treats the vector store as a box: embeddings go in, the top results come out. I wanted to know what the box has to do, so I set three requirements and built towards them:

- search must not scan every vector,
- documents must survive a restart,
- one server must hold several independent datasets with different embedding sizes and distance metrics.

## How it evolved

The design went through three versions, and each one replaced the part that was holding the previous one back.

1. **Brute force (September 2024).** A map from ID to vector, with search computing the distance to every stored vector. It was enough to get metadata filtering and the API shape right.
2. **A server with persistence (November 2024).** An Actix Web server, SQLite for storage, a batch insert endpoint, document content returned alongside each match, and collections.
3. **RocksDB and HNSW (June 2025).** Storage moved to RocksDB and search moved to an HNSW index, with one index per collection.

## Design

### Storage

RocksDB is a key-value store, so the layout is a set of key prefixes:

| Key | Value |
| --- | ----- |
| `col:{name}` | collection metadata as JSON |
| `vec:{collection}:{doc}` | the embedding, serialised with bincode |
| `meta:{collection}:{doc}` | the document's metadata string |
| `content:{collection}:{doc}` | the document text |

Vectors are stored in binary rather than JSON because they are the bulk of the data and are never read by a person.

### Index

Each collection owns an HNSW graph (from the `hnsw_rs` crate), built with 16 connections per node, 10 layers and an `ef_construction` of 200, and sized for 100,000 vectors. A search asks the graph for `top_k` neighbours with `ef_search` set to twice `top_k`, then fetches the metadata and content for those IDs from RocksDB.

The distance metric is part of the index's type in `hnsw_rs`, so a cosine index and a Euclidean index are different Rust types. I wrapped the three I support (cosine, dot product, Euclidean) in one enum, which lets a single map hold collections with different metrics:

```rust
enum MetricIndex<'a> {
    Cosine(Hnsw<'a, f32, DistCosine>),
    Dot(Hnsw<'a, f32, DistDot>),
    Euclidean(Hnsw<'a, f32, DistL2>),
}
```

### Collections and concurrency

A collection fixes its dimension and metric when it is created. Inserts and queries with the wrong dimension are rejected before they reach the index.

The collection map and each index sit behind their own `RwLock`. Searches take read locks, so they run in parallel across Actix workers; an insert takes the write lock of its own collection only, and does not block searches on the others.

### API

| Route | Purpose |
| ----- | ------- |
| `POST /create_collection` | name, metric and dimension |
| `GET /collections`, `GET /collections/{name}` | list or look up collections |
| `POST /add_document`, `POST /add_documents` | insert one document or a batch |
| `POST /search` | the `n` nearest documents to a query vector |

A batch insert reports failures per document and answers `207 Multi-Status` when some of them fail, so one bad embedding does not reject the rest.

## What is not done yet

- **The index lives in memory only.** Vectors are safe in RocksDB, but collections and their graphs are not rebuilt when the server restarts. The plan is to rebuild from the stored vectors on start-up, and later to dump and reload the graph itself.
- **No deletes**, and metadata filtering from the brute-force version has not been carried over to the HNSW path.
- **No benchmarks.** I have not yet measured recall or latency against the brute-force search, which is the obvious next experiment.
- **The Python SDK's LangChain vector store adapter** is not working yet.

## What I learned

- An approximate index and durable storage are separate problems. Keeping the vectors in a key-value store and treating the graph as a cache that can be rebuilt made each one simpler.
- Rust's type system pushed the metric choice into the open. The enum is a few extra lines, and in exchange it is impossible to query a cosine collection with a Euclidean index.
- Starting with brute force was worth it: it fixed the API and gave me a correct baseline to compare an approximate index against.
