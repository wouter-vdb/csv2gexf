# csv2gexf

> Convert graph data in a CSV document to a GEXF document.

The current version (0.0.1) does not support dynamic nor hierarchical graphs.


## Getting started

First install [NodeJS](https://nodejs.org) (version 5.6.0 or higher).

Install the NodeJS dependencies:

```shell
$ npm install
```

Generate the documentation:

```shell
$ grunt
```

Open `./doc/csv2gexf/*/index.html` in your browser to see the documentation.


## CSV Documents

The graph data is loaded from two CSV documents. The first should contain the nodes data, the second the edges data. The data must respect the following requirements.

Both CSV files should contain headers.


### Nodes CSV file
- One column should contain unique node ids.
- One column may contain the node labels.
- All other columns are either node attributes or visualizaton settings.
    - Attributes may be arbitrary values of type string, int, float or boolean.
    - Visualization settings must be either:
        - A color expressed as RGB components in the form `rgb(<r>,<g>,<b>)`, where `<r>`, `<g>` and `<b>` are integer values in the range [0–255].
        - A size expressed as a decimal scale. The default is 1.0.
        - A shape, which must be either `disc`, `square`, `triangle`, or `diamond`.

#### Edges CSV file
- One column should contain the source node ids.
- One column should contain the target node ids.
- One column may contain unique edge ids.
- One column may contain the edge labels.
- One column may contain the edge types, which must be either `directed`, `undirected` or `mutual`.
- One column may contain the edge weights, which must be (decimal) numbers.
- All other columns are either edge attributes or visualizaton settings.
    - Attributes may be arbitrary values of type string, int, float or boolean.
    - Visualization settings must be either:
        - A color expressed as RGB components in the form `rgb(<r>,<g>,<b>)`, where `<r>`, `<g>` and `<b>` are integer values in the range [0–255].
        - A thickness expressed as a (decimal) number. The default is 1.0.
        - A shape, which must be either `solid`, `dotted`, `dashed`, or `double`.


## Configuration and schemas

To convert the CSV data to a GEXF document you will need to call the [convert](module-csv2gexf.html#~convert) function in this package. This function takes a [configuration object](module-csv2gexf.html#~config) as sole argument.


## Example

See `./example/start.js` for an example of how to use the convertor. This example should write the file `result.gexf` in the `./example` directory.


## Dependencies

- [csv for NodeJS](https://www.npmjs.com/package/csv)
- [Gexf library for JavaScript](https://www.npmjs.com/package/gexf)