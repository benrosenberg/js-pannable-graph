# Pannable graph with custom data
Pannable and zoomable graph paper-like canvas on which points, lines, and circles can be drawn.

Example: https://benrosenberg.info/js-pannable-graph/canvas.html

## Requirements

 - Python 3
 - `pandas`
 - MS Excel or equivalent (for data input)
 
## Running (online)

1. Edit data in `data.xlsx`
2. Navigate to directory being used
3. Run `python data_conversion.py`
4. Push updated files
 
## Running (locally)

1. Edit data in `data.xlsx`
2. Navigate to directory being used
3. Run `python data_conversion.py`
4. Run `python -m http.server [port]` where `[port]` is an optional port to use (defaults to `8000`)
5. Open `http://127.0.0.1:<port>` in browser (for default port, `http://127.0.0.1:8000`) to get to directory listing 
6. Click on `canvas.html` to open the graph (also possible to go directly to `http://127.0.0.1:<port>/canvas.html` to save a step)

### Acknowledgements

Adapted from https://codepen.io/chengarda/pen/wRxoyB.
