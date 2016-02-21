"use strict";

const csv2gexf = require('../lib/index');

// -------------------------------------------------------------------------------------------------

var config = {
    graphParams: {
        defaultEdgeType: 'directed',
        meta: {
            description: 'An example graph.',
            creator: 'csv2gexf by Wouter Van den Broeck'
        }
    },
    nodes: {
        file: 'csv/nodes.csv',
        schema: [
            'id',
            'label',
            {
                target: 'attributes',
                id: 'attrib_1',
                type: 'float'
            },
            {
                target: 'attributes',
                type: 'string'
            }
        ],
        parseOptions: {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }
    },
    edges: {
        file: 'csv/edges.csv',
        schema: [
            'source',
            'target',
            {
                target: 'attributes',
                type: 'string'
            },
            {
                target: 'viz',
                id: 'thickness'
            }
        ],
        parseOptions: {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }
    },
    saveAs: 'result.gexf'
};

csv2gexf.convert(config)
    .then(function () {
        console.log("The Gexf file is written.");
    });
