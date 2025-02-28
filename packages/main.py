#!/usr/bin/env python3
import os, argparse, contextlib
from typing import Optional, Union
import tinygrad
with contextlib.suppress(ImportError): import tiktoken
from tinygrad import Tensor, TinyJit, Device, GlobalCounters, Variable, dtypes
from tinygrad.ops import UOp
from tinygrad.helpers import Timing, DEBUG, JIT, getenv, fetch, colored, trange
from tinygrad.nn import Embedding, Linear, LayerNorm
from tinygrad.nn.state import gguf_load, torch_load, load_state_dict, get_state_dict
import tensorboard
from tinygrad.nn.state import get_parameters
from tinygrad.nn import optim
from tinygrad.helpers import getenv
from extra.training import train, evaluate
from extra.models.resnet import ResNet
from extra.datasets import fetch_mnist
from PIL import Image
import numpy as np

MAX_CONTEXT = getenv("MAX_CONTEXT", 512)
HALF = getenv("HALF")
