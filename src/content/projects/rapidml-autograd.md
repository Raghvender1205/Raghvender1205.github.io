---
title: "RapidML Autograd"
summary: "An automatic differentiation library written from scratch, with tensor operations running as OpenCL kernels on the GPU."
group: ml-from-scratch
repo: Raghvender1205/RapidMLAutograd
stack: [Python, PyOpenCL, NumPy]
featured: true
order: 3
---

RapidML Autograd is a small automatic differentiation library. Tensors record the operations that produced them, `backward()` walks that record to compute gradients, and the arithmetic itself runs as OpenCL kernels on the GPU. I wrote it over a few days in November 2024 to see how much machinery sits between `loss.backward()` and the hardware.

## The problem

Frameworks such as PyTorch hide two things behind one call: the bookkeeping that turns a chain of operations into gradients, and the device code that makes those operations fast. I wanted to write both by hand, on a scale small enough to read in one sitting:

- a tensor type that builds its computation graph as the code runs,
- correct gradients for the basic operations, including when shapes are broadcast,
- the forward computation executed on a GPU through kernels I wrote myself.

## Design

### The graph

A `Tensor` holds its data, a `requires_grad` flag, its accumulated gradient and a `creator`: the operation that produced it. Each operation is an object that remembers its input tensors and knows its own derivative.

```python
class MultiplyOperation(Operation):
    def forward(self, a, b):
        self.tensors = [a, b]
        result = tensor_operation(a, b, multiply_program.multiply_kernel)
        result.creator = self
        return result

    def backward(self, grad_output):
        a, b = self.tensors
        if a.requires_grad:
            a.backward(unbroadcast(grad_output * b.data, a.shape))
        if b.requires_grad:
            b.backward(unbroadcast(grad_output * a.data, b.shape))
```

Calling `backward()` on a result adds the incoming gradient to the tensor and hands it to the creator, which applies the chain rule and calls `backward()` on its inputs. The graph is never declared up front; it is whatever the Python code happened to execute.

### Operations on the GPU

There are four operations: add, subtract, multiply and matrix multiplication. Each is an OpenCL kernel compiled once when the library is imported.

- **Element-wise kernels** run one work item per element. The two inputs are broadcast to a common shape on the host, flattened, copied to the device, and the result is copied back and reshaped.
- **The matmul kernel** runs one work item per output cell, and each one loops over the shared dimension to compute its dot product.

```c
__kernel void matmul_kernel(__global const float *A, __global const float *B,
                            __global float *C, const int N, const int M, const int K) {
    int row = get_global_id(0);
    int col = get_global_id(1);
    if (row < N && col < M) {
        float sum = 0.0f;
        for (int k = 0; k < K; ++k)
            sum += A[row * K + k] * B[k * M + col];
        C[row * M + col] = sum;
    }
}
```

### Broadcasting and its gradient

Broadcasting is simple going forward and easy to get wrong going backward. If a `(3, 1)` tensor is added to a `(2,)` tensor, the result is `(3, 2)`, and the gradient that comes back has that larger shape. Each input must receive a gradient of its own shape, so `unbroadcast` sums the gradient over every axis that was stretched. Without it the shapes do not match and the gradients are wrong by a factor of the broadcast size.

### Testing

Gradients are checked against values worked out by hand for each operation, for a composite expression where one tensor is used twice (`d = a * (a + b)`), and for a broadcast addition.

## What is not done yet

- **Only the forward pass runs on the GPU.** Gradients are computed on the CPU with NumPy.
- **Every operation copies its data to the device and back**, and allocates fresh buffers. There is a buffer pool in the code, but the operations do not use it yet. For small tensors the copying costs more than the arithmetic saves.
- **Matmul is the naive kernel.** A tiled version that uses local memory is the first optimisation on the list. There is a stress test over 2048 × 2048 matrices, but I have not recorded timings or compared them with NumPy.
- **Backward is plain recursion** with no topological ordering, so a graph that reuses intermediate results revisits them.
- No reductions (`sum`, `mean`), no convolution or pooling, no `no_grad` context, and `transpose` does not carry gradients.

## What I learned

- Autodiff itself is small. The graph, the chain rule and four operations fit in a few hundred lines. Most of a real framework is everything around that.
- Moving data is the cost that matters. A kernel is fast, but a design that crosses the host-device boundary on every operation gives most of that back. Tensors need to live on the device, which is the next change this library needs.
- Broadcasting belongs in the gradient rules from the start. Adding it afterwards meant revisiting every operation's backward pass.
