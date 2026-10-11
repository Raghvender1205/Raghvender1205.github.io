---
title: "CacheService"
summary: "An in-memory cache in Rust with shard-per-core storage and pluggable eviction policies, which speaks the Redis protocol."
group: systems
repo: Raghvender1205/CustomCacheService
stack: [Rust, Tokio, RESP]
featured: true
order: 4
---

CacheService is an in-memory key-value cache written in Rust. It speaks the Redis wire protocol, so `redis-cli` and Redis Insight connect to it as they would to Redis, and inside it replaces the usual single lock with independent shards and a choice of eviction policy.

## The problem

The first version, from September 2024, was the obvious design: one hash map behind a mutex, an LRU list, and a binary protocol of my own. It worked, and it had two limits I wanted to remove.

- **Every request waited on one lock.** Adding cores added contention instead of throughput.
- **Nothing else could talk to it.** A custom protocol meant writing my own client and having no tools to inspect the data.

I rewrote it in February 2026 around three decisions: partition the data so that no lock is needed, keep the cost of a cache hit as low as possible, and speak a protocol that existing tools already understand.

## Design

### Shards as actors

The key space is split across shards (eight by default). Each shard is a Tokio task that owns its hash map and its eviction state outright. Nothing is shared, so there is no mutex anywhere on the request path.

A request reaches a shard as a message. The engine hashes the key with the Redis cluster key-slot function, picks the shard, sends the command down that shard's channel, and waits for the reply on a one-shot channel.

```rust
fn shard_index_for_key(&self, key: &Bytes) -> usize {
    let slot = redis_keyslot(key.as_ref());
    (slot as usize) % self.shard_txs.len()
}
```

Because one task handles all commands for a given key, operations on that key are applied in order without any locking. Commands that span keys, such as `DEL a b c`, `DBSIZE` and `SCAN`, are fanned out to the shards and their replies combined.

### Eviction as a plug-in

Each shard holds up to `max_items` entries and asks an eviction policy which key to drop when it goes over. The policy is a trait with four hooks:

```rust
pub trait EvictionPolicy<K>: Send {
    fn on_insert(&mut self, key: &K);
    fn on_access(&mut self, key: &K);
    fn on_remove(&mut self, key: &K);
    fn evict(&mut self) -> Option<K>;
}
```

Two policies implement it, chosen with a command-line flag.

- **LRU** moves a key to the head of a linked list on every hit and evicts from the tail.
- **SIEVE** only sets a "visited" bit on a hit and never moves the entry. To evict, a hand walks from the oldest entry towards the newest, clearing visited bits as it goes, and removes the first entry it finds unvisited.

The difference is in what a cache hit costs. LRU rewrites several list pointers on every read; SIEVE writes one bit. In a read-heavy cache the hit path is nearly all of the work, which is why I wanted both behind the same interface.

Both policies share one doubly linked list. Its nodes live in a slab and refer to each other by index instead of by pointer, which keeps the list in safe Rust and the nodes close together in memory.

### Expiry

A key's time-to-live is checked when the key is read, and an expired key is removed on the spot. Keys that are never read again are collected by a periodic sweep, every 30 seconds by default, sent to each shard as an ordinary message.

### Redis protocol

The server parses RESP frames, including several pipelined in one read, and implements `GET`, `SET` (with `PX`), `DEL`, `EXISTS`, `EXPIRE`, `TTL`, `PTTL`, `DBSIZE` and `SCAN`.

Getting Redis Insight to connect took more than those. A GUI client sends `HELLO`, `CLIENT SETINFO`, `COMMAND`, `INFO`, `SELECT` and `CONFIG GET` while it connects and browses, so each of those has a minimal implementation. That was the most instructive part of the protocol work: compatibility is defined by what clients send, not by the commands you consider important.

## What is not done yet

- **Single node only.** The design document covers consistent hashing across nodes and replication; none of that is built.
- **No benchmarks.** I have not measured throughput against the single-lock version, or compared hit ratios for LRU and SIEVE on a real trace. Both are needed before I can claim the design pays off.
- **`SCAN` copies every key** from every shard on each call, which is fine for browsing and wrong for a large keyspace.
- Strings only, with no `INCR`, `MGET` or other data types, and `AUTH` accepts any credentials.
- No persistence and no TLS.

## What I learned

- Removing a lock is a question of ownership more than of speed tricks. Once each shard owned its data, the mutex had nothing left to protect.
- An eviction policy should be judged by its cost on a hit as well as by its hit ratio. That framing is what made SIEVE interesting.
- Speaking an existing protocol was worth more than a faster custom one. It gave the project a client, a command line and a GUI on the first day.
